/**
 * Watchlist validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing user watchlists
 */
const listWatchlists = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    sortBy: Joi.string().valid('name', 'created_at').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Schema for creating a new watchlist
 */
const createWatchlist = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().allow('', null),
    is_default: Joi.boolean().default(false),
    stock_ids: Joi.array().items(Joi.string().uuid()),
  }),
};

/**
 * Schema for getting a watchlist by ID
 */
const getWatchlistById = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for updating a watchlist
 */
const updateWatchlist = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().min(1).max(100),
    description: Joi.string().allow('', null),
    is_default: Joi.boolean(),
  }).min(1),
};

/**
 * Schema for deleting a watchlist
 */
const deleteWatchlist = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for adding a stock to a watchlist
 */
const addStockToWatchlist = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
    stock_id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    position_order: Joi.number().integer().min(0),
    notes: Joi.string().allow('', null),
  }),
};

/**
 * Schema for removing a stock from a watchlist
 */
const removeStockFromWatchlist = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
    stock_id: Joi.string().uuid().required(),
  }),
};

module.exports = {
  listWatchlists,
  createWatchlist,
  getWatchlistById,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
};
