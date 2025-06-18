/**
 * Stock validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing stocks with filters
 */
const listStocks = {
  query: Joi.object().keys({
    search: Joi.string().allow('', null),
    exchange: Joi.number().integer().allow(null),
    sector: Joi.number().integer().allow(null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'company_name', 'market_cap').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting a stock by ID
 */
const getStockById = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for getting stock prices
 */
const getStockPrices = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    interval: Joi.string().valid('day', 'week', 'month').default('day'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(100),
  }),
};

/**
 * Schema for adding stock prices
 */
const addStockPrices = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    price: Joi.number().positive().required(),
    volume: Joi.number().integer().positive(),
    high: Joi.number().positive(),
    low: Joi.number().positive(),
    open_price: Joi.number().positive(),
    close_price: Joi.number().positive(),
    price_date: Joi.date().iso().required(),
  }).or('high', 'low', 'open_price', 'close_price'),
};

/**
 * Schema for getting stock news
 */
const getStockNews = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    sentiment: Joi.string().valid('positive', 'negative', 'neutral', 'any'),
    from: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * Schema for getting stock technical indicators
 */
const getStockIndicators = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    type: Joi.string().valid('RSI', 'SMA', 'EMA', 'MACD', 'bollinger_bands'),
    period: Joi.number().integer().min(1).max(200),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * Schema for creating a stock
 */
const createStock = {
  body: Joi.object().keys({
    symbol: Joi.string().min(1).max(20).required(),
    companyName: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow('', null),
    exchangeId: Joi.number().integer().positive().required(),
    sectorId: Joi.number().integer().positive().allow(null),
    currencyId: Joi.number().integer().positive().required(),
    marketCap: Joi.number().integer().positive().allow(null),
    peRatio: Joi.number().positive().allow(null),
    dividendYield: Joi.number().min(0).max(100).allow(null),
    beta: Joi.number().allow(null),
    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Schema for updating a stock
 */
const updateStock = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    symbol: Joi.string().min(1).max(20),
    companyName: Joi.string().min(1).max(100),
    description: Joi.string().allow('', null),
    exchangeId: Joi.number().integer().positive(),
    sectorId: Joi.number().integer().positive().allow(null),
    currencyId: Joi.number().integer().positive(),
    marketCap: Joi.number().integer().positive().allow(null),
    peRatio: Joi.number().positive().allow(null),
    dividendYield: Joi.number().min(0).max(100).allow(null),
    beta: Joi.number().allow(null),
    isActive: Joi.boolean(),
  }).min(1),
};

/**
 * Schema for deleting a stock
 */
const deleteStock = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = {
  listStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockNews,
  getStockIndicators,
  createStock,
  updateStock,
  deleteStock,
};
