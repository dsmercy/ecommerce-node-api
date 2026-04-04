import { apiError } from '../utils/response.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  logger.error({ err }, err.message);

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return apiError(res, 'Validation failed', 400, errors);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return apiError(res, 'Invalid ID format', 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return apiError(res, `Duplicate value for ${field}`, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiError(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return apiError(res, 'Token expired', 401);
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    return apiError(res, err.message, 402);
  }

  // Known operational errors (thrown with statusCode)
  if (err.statusCode) {
    return apiError(res, err.message, err.statusCode);
  }

  // Generic 500
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return apiError(res, message, 500);
}
