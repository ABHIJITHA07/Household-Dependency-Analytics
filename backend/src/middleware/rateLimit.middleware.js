import rateLimit from 'express-rate-limit';
import { ErrorCode } from '../config/constants.js';

const isProduction = process.env.NODE_ENV === 'production';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // 1000 in dev/test, 100 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.FORBIDDEN,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      details: []
    }
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 500, // 500 in dev/test, 10 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.FORBIDDEN,
      message: 'Too many authentication attempts, please try again after 15 minutes',
      details: []
    }
  }
});

