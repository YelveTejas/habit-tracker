import { body, param } from 'express-validator';

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
];

export const resetPasswordRules = [
  param('token').isHexadecimal().withMessage('Invalid reset token'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 60 }),
  body('email').optional().trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('reminderEnabled').optional().isBoolean().withMessage('reminderEnabled must be true or false'),
  body('reminderTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Reminder time must be in HH:MM format'),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('currentPassword')
    .if(body('newPassword').exists())
    .notEmpty()
    .withMessage('Current password is required to set a new password'),
];
