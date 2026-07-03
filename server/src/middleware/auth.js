import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }
  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Session expired or invalid. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('The account for this session no longer exists.', 401);

  req.user = user;
  next();
});
