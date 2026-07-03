import { body } from 'express-validator';

const dateKey = /^\d{4}-\d{2}-\d{2}$/;

export const habitRules = [
  body('name').trim().notEmpty().withMessage('Habit name is required').isLength({ max: 80 }),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description is too long'),
  body('category').optional().trim().notEmpty().isLength({ max: 40 }).withMessage('Category is too long'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a hex value like #10b981'),
  body('startDate').optional().matches(dateKey).withMessage('Start date must be YYYY-MM-DD'),
];

export const completionRules = [
  body('date').optional().matches(dateKey).withMessage('Date must be YYYY-MM-DD'),
];
