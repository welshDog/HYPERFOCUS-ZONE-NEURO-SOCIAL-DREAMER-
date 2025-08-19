/**
 * ⚠️💎⚡ Error Handler Middleware - Centralized Error Management ⚡💎⚠️
 */

const errorHandler = (err, req, res, next) => {
    console.error('❌ API Error:', err);

    // Default error response
    let error = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        error.error = 'Validation failed';
        error.details = Object.values(err.errors).map(val => val.message);
        return res.status(400).json(error);
    }

    if (err.name === 'CastError') {
        error.error = 'Invalid ID format';
        return res.status(400).json(error);
    }

    if (err.code === 11000) {
        error.error = 'Duplicate field value';
        const field = Object.keys(err.keyValue)[0];
        error.details = `${field} already exists`;
        return res.status(409).json(error);
    }

    if (err.name === 'JsonWebTokenError') {
        error.error = 'Invalid token';
        return res.status(401).json(error);
    }

    if (err.name === 'TokenExpiredError') {
        error.error = 'Token expired';
        return res.status(401).json(error);
    }

    // Rate limiting error
    if (err.status === 429) {
        error.error = 'Too many requests';
        error.retryAfter = err.retryAfter;
        return res.status(429).json(error);
    }

    // Development vs production error details
    if (process.env.NODE_ENV === 'development') {
        error.details = err.message;
        error.stack = err.stack;
    }

    res.status(err.status || 500).json(error);
};

module.exports = errorHandler;
