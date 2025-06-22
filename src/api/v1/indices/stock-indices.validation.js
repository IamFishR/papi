/**
 * Stock Indices validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing stock indices
 */
const listIndices = {
  query: Joi.object().keys({
    search: Joi.string().allow('', null),
    indexType: Joi.string().valid('MARKET_CAP', 'EQUAL_WEIGHT', 'PRICE_WEIGHTED', 'SECTOR', 'THEMATIC').allow(null),
    exchange: Joi.number().integer().positive().allow(null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('indexName', 'indexCode', 'indexType').default('indexName'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting index by ID
 */
const getIndexById = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for getting index memberships
 */
const getIndexMemberships = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    activeOnly: Joi.boolean().default(true),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    sortBy: Joi.string().valid('weight', 'rankPosition', 'addedDate').default('weight'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Schema for creating stock index
 */
const createIndex = {
  body: Joi.object().keys({
    indexName: Joi.string().min(1).max(100).required(),
    indexCode: Joi.string().min(1).max(50).required(),
    indexSymbol: Joi.string().max(50).allow(null),
    description: Joi.string().allow(null),
    baseDate: Joi.date().allow(null),
    baseValue: Joi.number().positive().allow(null),
    exchangeId: Joi.number().integer().positive().required(),
    currencyId: Joi.number().integer().positive().required(),
    indexType: Joi.string().max(50).default('MARKET_CAP'),
    calculationMethod: Joi.string().max(100).allow(null),
    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Schema for updating stock index
 */
const updateIndex = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    indexName: Joi.string().min(1).max(100),
    indexCode: Joi.string().min(1).max(50),
    indexSymbol: Joi.string().max(50).allow(null),
    description: Joi.string().allow(null),
    baseDate: Joi.date().allow(null),
    baseValue: Joi.number().positive().allow(null),
    exchangeId: Joi.number().integer().positive(),
    currencyId: Joi.number().integer().positive(),
    indexType: Joi.string().max(50),
    calculationMethod: Joi.string().max(100).allow(null),
    isActive: Joi.boolean(),
  }).min(1),
};

/**
 * Schema for deleting stock index
 */
const deleteIndex = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for adding stock to index
 */
const addStockToIndex = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
    weight: Joi.number().min(0).max(100).allow(null),
    rankPosition: Joi.number().integer().positive().allow(null),
    freeFloatMarketCap: Joi.number().integer().positive().allow(null),
    indexShares: Joi.number().integer().positive().allow(null),
  }),
};

/**
 * Schema for removing stock from index
 */
const removeStockFromIndex = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
    stockId: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for updating index weights
 */
const updateIndexWeights = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    weights: Joi.array().items(
      Joi.object().keys({
        stockId: Joi.number().integer().positive().required(),
        weight: Joi.number().min(0).max(100).required(),
        rankPosition: Joi.number().integer().positive().allow(null),
        freeFloatMarketCap: Joi.number().integer().positive().allow(null),
        indexShares: Joi.number().integer().positive().allow(null),
      })
    ).min(1).required(),
  }),
};

/**
 * Schema for getting indices by type
 */
const getIndicesByType = {
  params: Joi.object().keys({
    type: Joi.string().valid('MARKET_CAP', 'EQUAL_WEIGHT', 'PRICE_WEIGHTED', 'SECTOR', 'THEMATIC').required(),
  }),
};

/**
 * Schema for getting stock index memberships
 */
const getStockIndexMemberships = {
  params: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    activeOnly: Joi.boolean().default(true),
  }),
};

module.exports = {
  listIndices,
  getIndexById,
  getIndexMemberships,
  createIndex,
  updateIndex,
  deleteIndex,
  addStockToIndex,
  removeStockFromIndex,
  updateIndexWeights,
  getIndicesByType,
  getStockIndexMemberships,
};