/**
 * Authentication validation schemas
 */
const Joi = require('joi');

/**
 * Register validation schema
 */
const register = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

/**
 * Login validation schema
 */
const login = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

/**
 * Forgot password validation schema
 */
const forgotPassword = Joi.object({
  email: Joi.string().required().email(),
});

/**
 * Reset password validation schema
 */
const resetPassword = Joi.object({
  password: Joi.string().required().min(8).max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
