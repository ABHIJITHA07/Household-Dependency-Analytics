import { AppError } from '../utils/errors.js';

/**
 * Higher-order middleware function for validating requests using Zod schemas.
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} [source='body'] - Request object property to validate
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.length > 0 ? issue.path.join('.') : undefined,
        message: issue.message
      }));

      return next(AppError.validationError('Validation failed for request data', details));
    }

    // Replace request data with parsed/sanitized result
    req[source] = result.data;
    next();
  };
}
