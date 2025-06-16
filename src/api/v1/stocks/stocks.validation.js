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
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for getting stock prices
 */
const getStockPrices = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
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
    id: Joi.string().uuid().required(),
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
    id: Joi.string().uuid().required(),
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
    id: Joi.string().uuid().required(),
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

module.exports = {
  listStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockNews,
  getStockIndicators,
};
