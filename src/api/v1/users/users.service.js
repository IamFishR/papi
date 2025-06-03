/**
 * User service - handles business logic for user operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');
const { hashPassword } = require('../../../core/utils/passwordUtils');

/**
 * Create a new user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  // Check if email is already taken
  const existingUser = await db.User.findOne({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER_ALREADY_EXISTS);
  }

  // Create new user
  const user = await db.User.create(userData);

  // Remove sensitive fields before returning
  const sanitizedUser = user.toJSON();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return sanitizedUser;
};

/**
 * Get all users with pagination and filtering
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated users list with metadata
 */
const getUsers = async (filter, options) => {
  const { limit, page, sortBy, sortOrder, includeDeleted } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = {};
  
  // Apply filters if they exist
  if (filter.firstName) whereConditions.firstName = { [Op.like]: `%${filter.firstName}%` };
  if (filter.lastName) whereConditions.lastName = { [Op.like]: `%${filter.lastName}%` };
  if (filter.email) whereConditions.email = { [Op.like]: `%${filter.email}%` };
  if (filter.role) whereConditions.role = filter.role;
  if (filter.isActive !== undefined) whereConditions.isActive = filter.isActive;
  if (filter.isEmailVerified !== undefined) whereConditions.isEmailVerified = filter.isEmailVerified;

  // Prepare query options
  const queryOptions = {
    where: whereConditions,
    limit,
    offset,
    attributes: { exclude: ['password', 'refreshToken'] },
    order: [[sortBy || 'createdAt', sortOrder || 'desc']],
    paranoid: !includeDeleted, // Include soft-deleted users if requested
  };

  // Execute query
  const { count, rows: users } = await db.User.findAndCountAll(queryOptions);

  // Calculate pagination metadata
  const totalPages = Math.ceil(count / limit);
  
  return {
    users,
    pagination: {
      total: count,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @param {boolean} includeDeleted - Whether to include deleted users
 * @returns {Promise<Object>} User object
 */
const getUserById = async (id, includeDeleted = false) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ['password', 'refreshToken'] },
    paranoid: !includeDeleted,
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }

  return user;
};

/**
 * Update user by ID
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (id, updateData) => {
  const user = await db.User.findByPk(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }

  // Check if email is being updated and already exists
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await db.User.findOne({
      where: { email: updateData.email },
    });

    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages.USER_ALREADY_EXISTS);
    }
  }

  // Update user
  await user.update(updateData);

  // Fetch updated user to return
  const updatedUser = await db.User.findByPk(id, {
    attributes: { exclude: ['password', 'refreshToken'] },
  });

  return updatedUser;
};

/**
 * Soft delete user by ID
 * @param {string} id - User ID
 * @returns {Promise<boolean>} Operation success
 */
const deleteUser = async (id) => {
  const user = await db.User.findByPk(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }

  await user.destroy();
  return true;
};

/**
 * Restore soft-deleted user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Restored user
 */
const restoreUser = async (id) => {
  // First check if the user exists (even if deleted)
  const deletedUser = await db.User.findByPk(id, {
    paranoid: false,
  });

  if (!deletedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }

  // Check if user is actually deleted
  if (!deletedUser.deletedAt) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User is not deleted');
  }

  // Restore the user
  await deletedUser.restore();

  // Return the restored user
  return getUserById(id);
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
};
