import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { ErrorCode } from '../config/constants.js';

/**
 * Authentication Middleware
 * Validates JWT Bearer tokens and attaches authenticated user identity to req.user.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      AppError.unauthorized('Authentication token is required', ErrorCode.NO_TOKEN_PROVIDED)
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(
      AppError.unauthorized('Authentication token is missing', ErrorCode.NO_TOKEN_PROVIDED)
    );
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
    
    // Attach user ownership payload to request context
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        AppError.unauthorized('Session has expired. Please log in again.', ErrorCode.TOKEN_EXPIRED)
      );
    }
    
    return next(
      AppError.unauthorized('Invalid authentication token', ErrorCode.INVALID_TOKEN)
    );
  }
}
