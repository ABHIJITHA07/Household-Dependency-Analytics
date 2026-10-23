import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/auth.validator.js';

const router = Router();

// Public Authentication Endpoints (Rate Limited)
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

// Protected User Endpoints (Bearer Token Required)
router.get('/me', authenticate, AuthController.me);
router.post('/logout', authenticate, AuthController.logout);
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
