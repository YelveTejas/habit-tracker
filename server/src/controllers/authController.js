import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  reminderEnabled: user.reminderEnabled,
  reminderTime: user.reminderTime,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('That email is already registered', 409);

  const user = await User.create({ name, email, password });
  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: serializeUser(user),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  res.json({ success: true, token: generateToken(user._id), user: serializeUser(user) });
});

// POST /api/auth/logout  (JWT is stateless; the client discards the token)
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: serializeUser(req.user) });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, email, reminderEnabled, reminderTime, currentPassword, newPassword } = req.body;

  if (email && email !== user.email) {
    const taken = await User.findOne({ email });
    if (taken) throw new AppError('That email is already registered', 409);
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  if (reminderEnabled !== undefined) user.reminderEnabled = reminderEnabled;
  if (reminderTime !== undefined) user.reminderTime = reminderTime;

  if (newPassword) {
    if (!(await user.matchPassword(currentPassword || ''))) {
      throw new AppError('Current password is incorrect', 401);
    }
    user.password = newPassword;
  }

  await user.save();
  res.json({ success: true, user: serializeUser(user) });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond identically so the endpoint can't be used to enumerate accounts
  const genericResponse = {
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  };
  if (!user) return res.json(genericResponse);

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your HabitFlow password',
      text: `Reset your password (link valid for 15 minutes): ${resetUrl}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. This link is valid for 15 minutes:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Could not send the reset email. Try again later.', 502);
  }

  res.json(genericResponse);
});

// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Reset link is invalid or has expired', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
});
