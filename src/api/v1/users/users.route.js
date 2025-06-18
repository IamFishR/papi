/**
 * Users routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const authorize = require('../../../core/middlewares/authorize');
const validate = require('../../../core/middlewares/requestValidator');
const userValidation = require('./users.validation');
const userController = require('./users.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get current user's profile - accessible to authenticated users
router.get(
  '/me',
  authenticate,
  catchAsync(userController.getCurrentUser)
);

// Create new user - admin only
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(userValidation.createUser.body),
  catchAsync(userController.createUser)
);

// Get all users with pagination and filtering - admin only
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(userValidation.listUsers.query, 'query'),
  catchAsync(userController.getUsers)
);

// Get user by ID - admin or same user
router.get(
  '/:id',
  authenticate,
  validate(userValidation.getUserById.params, 'params'),
  catchAsync(userController.getUserById)
);

// Update user - admin or same user
router.put(
  '/:id',
  authenticate,
  validate(userValidation.updateUser.params, 'params'),
  validate(userValidation.updateUser.body),
  catchAsync(userController.updateUser)
);

// Delete user - admin only
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(userValidation.deleteUser.params, 'params'),
  catchAsync(userController.deleteUser)
);

// Restore deleted user - admin only
router.patch(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  validate(userValidation.restoreUser.params, 'params'),
  catchAsync(userController.restoreUser)
);

module.exports = router;
