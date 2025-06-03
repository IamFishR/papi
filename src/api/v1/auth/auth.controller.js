/**
 * Authentication controller
 */
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { catchAsync } = require('../../../core/utils/catchAsync');
const apiResponse = require('../../../core/utils/apiResponse');
const config = require('../../../config/config');
const successMessages = require('../../../constants/successMessages');
const errorMessages = require('../../../constants/errorMessages');
const authService = require('./auth.service');

/**
 * Register a new user
 */
const register = catchAsync(async (req, res) => {
  const userData = req.body;
  const newUser = await authService.registerUser(userData);
  
  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.REGISTER_SUCCESS,
    { userId: newUser.id, email: newUser.email }
  );
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
  
  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.LOGIN_SUCCESS,
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    }
  );
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
  }
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.LOGOUT_SUCCESS
  );
});

/**
 * Refresh access token
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return apiResponse.error(
      res,
      StatusCodes.UNAUTHORIZED,
      errorMessages.TOKEN_MISSING
    );
  }
  
  const { accessToken, newRefreshToken } = await authService.refreshToken(refreshToken);
  
  // Set new refresh token in HTTP-only cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Token refreshed successfully',
    { accessToken }
  );
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  
  await authService.verifyEmail(token);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.VERIFICATION_SUCCESS
  );
});

/**
 * Request password reset
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  await authService.forgotPassword(email);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.PASSWORD_RESET_SENT
  );
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  await authService.resetPassword(token, password);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.PASSWORD_RESET_SUCCESS
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
