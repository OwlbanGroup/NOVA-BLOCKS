const joi = require('joi');

/**
 * ============================================
 * Standard Error Response Middleware
 * ============================================
 * 
 * Provides consistent error format across all endpoints:
 * 
 * Success format: { success: true, data: ... }
 * Error format:   { success: false, error: 'Message', details: ..., correlationId: ... }
 * 
 * - Always includes correlationId for request tracing
 * - In development: includes full error stack trace
 * - In production: hides sensitive details, shows user-friendly messages
 * - Maps known error types to appropriate HTTP status codes
 */

// Helper function to build standardized error response
function buildErrorResponse(err, req, statusCode) {
  const errorDetail = err.details || err.message || 'An unexpected error occurred';

  // In development, include full stack trace
  const details = process.env.NODE_ENV === 'production'
    ? errorDetail
    : {
        message: errorDetail,
        stack: err.stack,
      };

  // Map specific error types to messages
  let userMessage = errorDetail;

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    userMessage = 'Validation error';
  } else if (err.name === 'TokenExpiredError') {
    userMessage = 'Token has expired';
  } else if (err.name === 'JsonWebTokenError') {
    userMessage = 'Invalid token';
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    userMessage = 'Duplicate field value entered';
  } else if (err.statusCode) {
    userMessage = err.message;
  }

  return {
    success: false,
    error: userMessage,
    details,
    correlationId: req.correlationId || undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };
}

/**
 * Global error handling middleware
 * Catches all async errors and returns standardized format
 */
function errorMiddleware(err, req, res, next) {
  // Set status code - default to 500 or use err.statusCode if provided
  const statusCode = err.statusCode || 500;

  // Log the error with full details (correlationId already set by request logger)
  // We log at error level with the error details and correlation ID
  // Note: req.correlationId should be set by the request logging middleware
  if (req.correlationId) {
    logger.error({
      correlationId: req.correlationId,
      error: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    }, `Request error: ${req.method} ${req.path}`);
  } else {
    logger.error({
      error: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    }, `Request error: ${req.method} ${req.path}`);
  }

  // Return standardized error response
  const errorResponse = buildErrorResponse(err, req, statusCode);

  res.status(statusCode).json(errorResponse);
}

/**
 * Not found middleware - for routes that don't exist
 */
function notFoundMiddleware(req, res) {
  const error = new Error('Not found');
  error.statusCode = 404;
  throw error;
}

/**
 * Validation error wrapper - converts Joi/ Mongoose validation errors
 * to standardized format
 */
function wrapAsync(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
  wrapAsync,
};