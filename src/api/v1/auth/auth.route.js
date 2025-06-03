/**
 * Authentication routes
 */
const express = require('express');
const { authLimiter } = require('../../../config/rateLimit');
const authController = require('./auth.controller');
const validate = require('../../../core/middlewares/requestValidator');
const authValidation = require('./auth.validation');
const authenticate = require('../../../core/middlewares/authenticate');

const router = express.Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(authValidation.login),
  authController.login
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  authLimiter,
  validate(authValidation.resetPassword),
  authController.resetPassword
);

router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

module.exports = router;
