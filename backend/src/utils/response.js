/**
 * Standard API Response Formatting Module
 * Implements the standard JSON response format defined in 09_API_SPECIFICATION.md
 */

/**
 * Sends a standardized success response.
 * @param {object} res - Express response object
 * @param {any} [data=null] - Response data payload
 * @param {string} [message] - Optional success message
 * @param {number} [statusCode=200] - HTTP status code
 */
export function sendSuccess(res, data = null, message = undefined, statusCode = 200) {
  const body = {
    success: true,
    data
  };

  if (message !== undefined) {
    body.message = message;
  }

  return res.status(statusCode).json(body);
}

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object
 * @param {string} code - Standard ErrorCode string
 * @param {string} message - Human-readable error message
 * @param {Array<{field?: string, message: string}>} [details=[]] - Optional validation details
 * @param {number} [statusCode=500] - HTTP status code
 */
export function sendError(res, code, message, details = [], statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}
