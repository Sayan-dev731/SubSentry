const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // PostgreSQL errors
    if (err.code === '23505') {
        return res.status(409).json({
            error: 'Duplicate Entry',
            message: 'A record with this information already exists'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            error: 'Invalid Reference',
            message: 'Referenced record does not exist'
        });
    }

    if (err.code === '22P02') {
        return res.status(400).json({
            error: 'Invalid Input',
            message: 'Invalid data format provided'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authentication token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication token has expired'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
