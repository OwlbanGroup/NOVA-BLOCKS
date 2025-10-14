const errorHandler = (err, req, res, next) => {
    console.error(`Error occurred at ${req.method} ${req.url}:`, err.stack);
    let statusCode = 500;
    let responseMessage = { message: 'An error occurred' };

    if (err.status) {
        statusCode = err.status;
        responseMessage.message = err.message || responseMessage.message;
    }

    // Enhanced logging for "GOLDS" related errors
    if (err.message.includes('GOLDS')) {
        console.error(`GOLDS related error: ${err.message}`);
    }

    if (process.env.NODE_ENV !== 'production') {
        responseMessage.error = err.message;
    }

    res.status(statusCode).json(responseMessage);
};

module.exports = errorHandler;
