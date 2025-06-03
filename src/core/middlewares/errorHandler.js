/**
 * Global error handling middleware
 */
const { StatusCodes } = require('http-status-codes');
const logger = require('../../config/logger');
const errorMessages = require('../../constants/errorMessages');
const config = require('../../config/config');

/**
 * Middleware for handling errors globally
 */
const errorHandler = (err, req, res, next) => {
  // Default error object
  const error = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || errorMessages.SERVER_ERROR,
  };

  // Handle Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.statusCode = StatusCodes.CONFLICT;
    error.message = err.errors[0].message;
  }

  // Handle Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = err.errors[0].message;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = StatusCodes.UNAUTHORIZED;
    error.message = errorMessages.TOKEN_INVALID;
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = StatusCodes.UNAUTHORIZED;
    error.message = errorMessages.TOKEN_EXPIRED;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.message = errorMessages.VALIDATION_ERROR;
    error.errors = err.errors;
  }

  // Log error for server-side issues
  if (error.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${error.statusCode}, Message:: ${err.message}`, {
      stack: err.stack,
      error: err,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode:: ${error.statusCode}, Message:: ${error.message}`);
  }

  // Response based on environment
  const response = {
    status: 'error',
    message: error.message,
    ...(error.errors && { errors: error.errors }),
  };

  // Include stack trace in development environment
  if (config.env === 'development' && error.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
