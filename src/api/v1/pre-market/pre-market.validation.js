/**
 * Pre-Market Data validation schemas
 */
const Joi = require('joi');

/**
 * Schema for getting pre-market data for a stock
 */
const getPreMarketData = {
  params: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    tradingDate: Joi.date().iso().default(() => new Date().toISOString().split('T')[0]),
  }),
};

/**
 * Schema for getting current IEP
 */
const getCurrentIEP = {
  params: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for adding pre-market data
 */
const addPreMarketData = {
  body: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
    tradingDate: Joi.date().iso().required(),
    sessionStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    sessionEndTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    iep: Joi.number().positive().allow(null),
    iepChange: Joi.number().allow(null),
    iepChangePercent: Joi.number().allow(null),
    totalTradedVolume: Joi.number().integer().min(0).allow(null),
    totalTradedValue: Joi.number().positive().allow(null),
    totalBuyQuantity: Joi.number().integer().min(0).allow(null),
    totalSellQuantity: Joi.number().integer().min(0).allow(null),
    atoBuyQty: Joi.number().integer().min(0).allow(null),
    atoSellQty: Joi.number().integer().min(0).allow(null),
    finalIep: Joi.number().positive().allow(null),
    finalIepQty: Joi.number().integer().min(0).allow(null),
    marketType: Joi.string().max(20).default('REGULAR'),
    dataSource: Joi.string().max(50).allow(null),
  }),
};

/**
 * Schema for adding pre-market orders
 */
const addPreMarketOrders = {
  params: Joi.object().keys({
    preMarketDataId: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    orders: Joi.array().items(
      Joi.object().keys({
        orderType: Joi.string().valid('BUY', 'SELL').required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        numberOfOrders: Joi.number().integer().positive().allow(null),
        isIep: Joi.boolean().default(false),
        orderRank: Joi.number().integer().positive().allow(null),
        timestamp: Joi.date().allow(null),
        dataSource: Joi.string().max(50).allow(null),
      }).required()
    ).min(1).required(),
  }),
};

/**
 * Schema for getting pre-market summary
 */
const getPreMarketSummary = {
  query: Joi.object().keys({
    tradingDate: Joi.date().iso().default(() => new Date().toISOString().split('T')[0]),
    exchange: Joi.number().integer().positive().allow(null),
    sector: Joi.number().integer().positive().allow(null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * Schema for getting multiple stocks pre-market data
 */
const getMultipleStocksPreMarketData = {
  body: Joi.object().keys({
    stockIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(50).required(),
    tradingDate: Joi.date().iso().default(() => new Date().toISOString().split('T')[0]),
  }),
};

/**
 * Schema for getting historical pre-market data
 */
const getHistoricalPreMarketData = {
  params: Joi.object().keys({
    stockId: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(30),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  }),
};

/**
 * Schema for getting pre-market movers
 */
const getPreMarketMovers = {
  query: Joi.object().keys({
    tradingDate: Joi.date().iso().default(() => new Date().toISOString().split('T')[0]),
    type: Joi.string().valid('gainers', 'losers').default('gainers'),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

/**
 * Schema for updating pre-market data
 */
const updatePreMarketData = {
  params: Joi.object().keys({
    preMarketDataId: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    sessionStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    sessionEndTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    iep: Joi.number().positive().allow(null),
    iepChange: Joi.number().allow(null),
    iepChangePercent: Joi.number().allow(null),
    totalTradedVolume: Joi.number().integer().min(0).allow(null),
    totalTradedValue: Joi.number().positive().allow(null),
    totalBuyQuantity: Joi.number().integer().min(0).allow(null),
    totalSellQuantity: Joi.number().integer().min(0).allow(null),
    atoBuyQty: Joi.number().integer().min(0).allow(null),
    atoSellQty: Joi.number().integer().min(0).allow(null),
    finalIep: Joi.number().positive().allow(null),
    finalIepQty: Joi.number().integer().min(0).allow(null),
    marketType: Joi.string().max(20),
    dataSource: Joi.string().max(50).allow(null),
  }).min(1),
};

module.exports = {
  getPreMarketData,
  getCurrentIEP,
  addPreMarketData,
  addPreMarketOrders,
  getPreMarketSummary,
  getMultipleStocksPreMarketData,
  getHistoricalPreMarketData,
  getPreMarketMovers,
  updatePreMarketData,
};