const errorHandler = (err, req, res, next) => {
    console.error(`Error occurred at ${req.method} ${req.url}:`, err.stack);
    const responseMessage = process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : { message: 'An error occurred', error: err.message };
    res.status(500).json(responseMessage);
};


module.exports = errorHandler;
