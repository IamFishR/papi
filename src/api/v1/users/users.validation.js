/**
 * User validation schemas
 */
const Joi = require('joi');
const { password } = require('./custom.validation');

/**
 * Schema for creating a new user
 */
const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().valid('user', 'admin'),
    phone: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    zipCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
    isEmailVerified: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

/**
 * Schema for updating a user
 */
const updateUser = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    password: Joi.string().custom(password),
    role: Joi.string().valid('user', 'admin'),
    phone: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    zipCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
    isEmailVerified: Joi.boolean(),
    isActive: Joi.boolean(),
  }).min(1),
};

/**
 * Schema for getting a user by ID
 */
const getUserById = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for deleting a user
 */
const deleteUser = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for restoring a deleted user
 */
const restoreUser = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for listing users with filtering and pagination
 */
const listUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    role: Joi.string().valid('user', 'admin'),
    isActive: Joi.boolean(),
    isEmailVerified: Joi.boolean(),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
    includeDeleted: Joi.boolean().default(false),
  }),
};

module.exports = {
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  restoreUser,
  listUsers,
};
