import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { ErrorCode } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Centralized Express Error Handling Middleware
 * Ensures no raw SQL errors, stack traces, or internal server details leak to the client.
 */
export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle operational AppErrors
  if (err instanceof AppError) {
    logger.warn(`Operational Error [${err.code}]: ${err.message}`, {
      code: err.code,
      path: req.path,
      method: req.method,
      details: err.details
    });

    return sendError(res, err.code, err.message, err.details, err.statusCode);
  }

  // Handle SyntaxError in JSON body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      ErrorCode.VALIDATION_ERROR,
      'Malformed JSON request payload',
      [],
      400
    );
  }

  // Unexpected system or unhandled errors
  logger.error(`Unhandled Exception on ${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack
  });

  // Safe fallback error response (Hides internal implementation details)
  return sendError(
    res,
    ErrorCode.INTERNAL_ERROR,
    'An unexpected server error occurred. Please try again later.',
    [],
    500
  );
}

/**
 * 404 Not Found Middleware for undefined routes
 */
export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Cannot ${req.method} ${req.path}`));
}
