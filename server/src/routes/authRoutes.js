import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, logout, getMe, updateProfile, forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  registerRules, loginRules, forgotPasswordRules, resetPasswordRules, updateProfileRules,
} from '../validators/authValidators.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileRules, validate, updateProfile);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, validate, resetPassword);

export default router;
