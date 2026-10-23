import { ErrorCode } from '../config/constants.js';

export class AppError extends Error {
  /**
   * @param {string} code - Standard ErrorCode constant from 19_ERROR_HANDLING_AND_VALIDATION.md
   * @param {number} statusCode - HTTP status code
   * @param {string} message - User-friendly error message
   * @param {Array<{field?: string, message: string}>} [details] - Detailed validation error list
   */
  constructor(code, statusCode, message, details = []) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Operational error: safe to expose to client

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = []) {
    return new AppError(ErrorCode.VALIDATION_ERROR, 400, message, details);
  }

  static validationError(message, details = []) {
    return new AppError(ErrorCode.VALIDATION_ERROR, 422, message, details);
  }

  static unauthorized(message = 'Authentication required', code = ErrorCode.UNAUTHORIZED) {
    return new AppError(code, 401, message);
  }

  static forbidden(message = 'Access forbidden') {
    return new AppError(ErrorCode.FORBIDDEN, 403, message);
  }

  static notFound(message = 'Requested resource not found') {
    return new AppError(ErrorCode.NOT_FOUND, 404, message);
  }

  static conflict(code, message) {
    return new AppError(code, 409, message);
  }

  static internal(message = 'An unexpected server error occurred') {
    return new AppError(ErrorCode.INTERNAL_ERROR, 500, message);
  }

  static serviceUnavailable(code, message) {
    return new AppError(code, 503, message);
  }
}
