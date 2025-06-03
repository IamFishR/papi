/**
 * User controller - handles HTTP requests for user operations
 */
const { StatusCodes } = require('http-status-codes');
const pick = require('../../../core/utils/pick');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const userService = require('./users.service');

/**
 * Create a new user
 * @route POST /api/v1/users
 */
const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.USER_CREATED,
    user
  );
};

/**
 * Get all users with pagination and filtering
 * @route GET /api/v1/users
 */
const getUsers = async (req, res) => {
  // Extract filter parameters from query
  const filter = pick(req.query, [
    'firstName',
    'lastName',
    'email',
    'role',
    'isActive',
    'isEmailVerified',
  ]);

  // Extract pagination and sorting options
  const options = pick(req.query, [
    'sortBy',
    'sortOrder',
    'limit',
    'page',
    'includeDeleted',
  ]);

  // Convert string values to appropriate types
  options.limit = options.limit ? parseInt(options.limit, 10) : 10;
  options.page = options.page ? parseInt(options.page, 10) : 1;
  options.includeDeleted = options.includeDeleted === 'true';

  const { users, pagination } = await userService.getUsers(filter, options);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Users retrieved successfully',
    users,
    pagination
  );
};

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 */
const getUserById = async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true';
  const user = await userService.getUserById(req.params.id, includeDeleted);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'User retrieved successfully',
    user
  );
};

/**
 * Update user by ID
 * @route PUT /api/v1/users/:id
 */
const updateUser = async (req, res) => {
  // Check permission - users can only update themselves unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return apiResponse.error(
      res,
      StatusCodes.FORBIDDEN,
      'You can only update your own profile'
    );
  }

  const user = await userService.updateUser(req.params.id, req.body);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.USER_UPDATED,
    user
  );
};

/**
 * Delete user by ID (soft delete)
 * @route DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.USER_DELETED
  );
};

/**
 * Restore a deleted user
 * @route PATCH /api/v1/users/:id/restore
 */
const restoreUser = async (req, res) => {
  const user = await userService.restoreUser(req.params.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'User restored successfully',
    user
  );
};

/**
 * Get current user profile
 * @route GET /api/v1/users/me
 */
const getCurrentUser = async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Profile retrieved successfully',
    user
  );
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getCurrentUser,
};
