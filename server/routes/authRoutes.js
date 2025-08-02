import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  updateProfile, 
  refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { 
  validateRegistration, 
  validateLogin, 
  validatePasswordChange,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegistration, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, validatePasswordChange, handleValidationErrors, changePassword);

export default router;