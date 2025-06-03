/**
 * Role-based access control middleware
 */
const { StatusCodes } = require('http-status-codes');
const errorMessages = require('../../constants/errorMessages');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to authorize based on user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_MISSING);
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, errorMessages.UNAUTHORIZED);
    }
    
    next();
  };
};

module.exports = authorize;
