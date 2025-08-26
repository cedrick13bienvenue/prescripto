import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = null;

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
  logger.error('Error occurred:', {
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

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
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

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;