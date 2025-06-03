/**
 * Authentication service
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const config = require('../../../config/config');
const errorMessages = require('../../../constants/errorMessages');
const ApiError = require('../../../core/utils/ApiError');
const EmailService = require('../../../core/services/email.service');
const { hashPassword, comparePasswords } = require('../../../core/utils/passwordUtils');
const db = require('../../../database/models');

const { User } = db;

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Newly created user
 */
const registerUser = async (userData) => {
  // Check if user with this email already exists
  const existingUser = await User.findOne({ where: { email: userData.email } });
  
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, errorMessages.USER_ALREADY_EXISTS);
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(userData.password);
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Create user
  const newUser = await User.create({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: hashedPassword,
    refreshToken: null,
  });
  
  // Send welcome email with verification link
  await EmailService.sendWelcomeEmail(
    newUser.email,
    `${newUser.firstName} ${newUser.lastName}`,
    verificationToken
  );
  
  return newUser;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and tokens
 */
const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.INVALID_CREDENTIALS);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(StatusCodes.FORBIDDEN, errorMessages.ACCOUNT_LOCKED);
  }
  
  // Verify password
  const isPasswordValid = await comparePasswords(password, user.password);
  
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.INVALID_CREDENTIALS);
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Update user's refresh token and last login date
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  
  return { user, accessToken, refreshToken };
};

/**
 * Logout user
 * @param {string} refreshToken - User's refresh token
 * @returns {Promise<void>}
 */
const logoutUser = async (refreshToken) => {
  // Find user by refresh token
  const user = await User.findOne({ where: { refreshToken } });
  
  if (user) {
    // Clear user's refresh token
    user.refreshToken = null;
    await user.save();
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - User's refresh token
 * @returns {Promise<object>} New access and refresh tokens
 */
const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Find user by id and refresh token
    const user = await User.findOne({
      where: {
        id: decoded.id,
        refreshToken,
      },
    });
    
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_INVALID);
    }
    
    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Update user's refresh token
    user.refreshToken = newRefreshToken;
    await user.save();
    
    return { accessToken, newRefreshToken };
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, errorMessages.TOKEN_INVALID);
  }
};

/**
 * Verify user email
 * @param {string} token - Email verification token
 * @returns {Promise<void>}
 */
const verifyEmail = async (token) => {
  // This is a simplified implementation
  // In a real application, you would store the verification token in the database
  // and match it against the token provided in the request
  
  // For now, just return without doing anything
  return;
};

/**
 * Initiate password reset process
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    // Don't reveal that the user doesn't exist for security reasons
    return;
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // In a real application, you would store the reset token and its expiry
  // in the database and match it against the token provided in the request
  
  // Send password reset email
  await EmailService.sendPasswordResetEmail(
    user.email,
    `${user.firstName} ${user.lastName}`,
    resetToken
  );
};

/**
 * Reset user password
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const resetPassword = async (token, newPassword) => {
  // This is a simplified implementation
  // In a real application, you would validate the token and find the user
  
  // For now, just return without doing anything
  return;
};

/**
 * Generate JWT access token
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate JWT refresh token
 * @param {object} user - User object
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
