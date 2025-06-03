/**
 * JWT authentication middleware
 */
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const config = require('../../config/config');
const errorMessages = require('../../constants/errorMessages');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Middleware to authenticate user by validating JWT token
 */
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_MISSING);
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Set user in request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_EXPIRED);
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_INVALID);
  }
});

module.exports = authenticate;
