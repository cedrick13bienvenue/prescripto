"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../config/logger");
// Custom error class
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Error handler middleware
const errorHandler = (error, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;
    // Handle custom AppError
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    // Handle Sequelize validation errors
    else if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = error.message;
    }
    // Handle Sequelize unique constraint errors
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Duplicate Entry';
        details = error.message;
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid Token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token Expired';
    }
    // Handle multer file upload errors
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File Upload Error';
        details = error.message;
    }
    // Log error
    logger_1.logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode,
        timestamp: new Date().toISOString()
    });
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            ...(details && { details }),
            ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
        },
        timestamp: new Date().toISOString(),
        path: req.url
    });
};
exports.errorHandler = errorHandler;
// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            statusCode: 404
        },
        timestamp: new Date().toISOString(),
        path: req.url
    });
};
exports.notFoundHandler = notFoundHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map