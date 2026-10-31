/**
 * Winston Structured Logger for NOVA BLOCKS Backend
 * Provides consistent, structured logging across all services
 * 
 * Features:
 * - Timestamped log entries
 * - Configurable log levels (debug, info, warning, error, fatal)
 * - Correlation ID support for request tracing
 * - Metadata enrichment (context, GPU status, database ops, etc.)
 * - Multiple transport support (Console, File, HTTP, etc.)
 * 
 * Usage:
 *  const logger = require('./logger');
 *  logger.info('Message', { key: 'value' });
 *  logger.error('Error message', { error: err });
 */

const winston = require('winston');

// Define log format with timestamp, colorization, and printf formatting
const logFormat = winston.format.combine(
  // Add timestamp in ISO format
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  // Colorize output for console (disabled in production)
  winston.format.colorize({ all: process.env.NODE_ENV !== 'production' }),
  // Custom printf format
  winston.format.printf(
    ({ timestamp, level, message, context, correlationId, ...metadata }) => {
      // Build correlation ID prefix
      const corrPrefix = correlationId ? `[Corr: ${correlationId}] ` : '';
      
      // Build context prefix if provided
      const ctxPrefix = context ? `[${context}] ` : '';
      
      // Stringify remaining metadata, exclude if empty
      const metaString = Object.keys(metadata).length
        ? ` ${JSON.stringify(metadata, null, 2)}`
        : '';
      
      // Return formatted log line
      return `${timestamp} ${level.toUpperCase()} ${corrPrefix}${ctxPrefix}${message}${metaString}`;
    }
  )
);

// Define file transport options (rotating file transport)
const fileTransportOptions = {
  // Only in non-production or when LOG_FILE env var is set
  ...(process.env.LOG_FILE && { filename: process.env.LOG_FILE }),
  // Rotate files at 20MB, keep 5 previous files
  maxsize: 20 * 1024 * 1024,
  maxFiles: 5,
  // Compress rotated files
  compress: true,
  // Format same as console
  format: logFormat
};

// Create the Winston logger instance
const logger = winston.createLogger({
  // Log level from environment variable, default to 'info'
  level: process.env.LOG_LEVEL || 'info',
  
  // Apply the custom format
  format: logFormat,
  
  // Configure transports based on environment
  transports: [
    // Always log to console
    new winston.transports.Console()
  ],
  
  // Add file transport if LOG_FILE is set or in development
  ...(process.env.LOG_FILE || process.env.NODE_ENV !== 'production'
    ? [new winston.transports.File(fileTransportOptions)]
    : {})
});

// Export a convenience function for request correlation
function createRequestContext(correlationId) {
  return {
    correlationId,
    timestamp: new Date().toISOString()
  };
}

// Export the logger and helper
module.exports = {
  logger,
  createRequestContext
};
