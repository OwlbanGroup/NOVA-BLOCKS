const errorHandler = (err, req, res, next) => {
    console.error(`❌ Error occurred at ${req.method} ${req.url}:`, err.stack);
    console.error(`📋 Error name: ${err.name}`);
    console.error(`📋 Error message: ${err.message}`);
    if (err.context) {
      console.error(`📋 Error context:`, err.context);
    }
    let statusCode = 500;
    let responseMessage = { message: 'An error occurred' };

    // Enhanced error categorization
    logger.error({
      message: err.message,
      correlationId: req.correlationId,
      errorName: err.name,
      stack: err.stack,
      context: err.context,
      gpuRelated: err.message.includes('GPU') || err.message.includes('gpu'),
      databaseRelated: err.message.includes('MongoDB') || err.message.includes('mongodb'),
      lightspeedRelated: err.message.includes('GOLDS') || err.message.includes('golds'),
      httpMethod: req.method,
      httpUrl: req.originalUrl,
      httpStatus: res.statusCode,
      userAgent: req.get('User-Agent')
    });

    if (err.status) {
        statusCode = err.status;
        responseMessage.message = err.message || responseMessage.message;
    }

    // Error type specific handling
    if (err.name === 'ValidationError') {
        responseMessage.details = 'Validation error - please check input data';
        responseMessage.status = 'validation_error';
    } else if (err.name === 'UnauthorizedError') {
        responseMessage.details = 'Authentication failed - invalid or expired token';
        responseMessage.status = 'unauthorized';
    } else if (err.message.includes('GPU')) {
        responseMessage.details = 'GPU inference error';
        responseMessage.status = 'gpu_error';
    } else if (err.message.includes('MongoDB')) {
        responseMessage.details = 'Database error';
        responseMessage.status = 'database_error';
    }

    // Enhanced logging for "GOLDS" related errors
    if (err.message.includes('GOLDS')) {
        logger.warn(`💰 GOLDS related error: ${err.message}`);
    }

    if (process.env.NODE_ENV !== 'production') {
        responseMessage.error = err.message;
        responseMessage.stack = err.stack;
    }

    res.status(statusCode).json(responseMessage);
};

module.exports = errorHandler;
