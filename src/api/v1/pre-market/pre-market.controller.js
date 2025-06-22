/**
 * Pre-Market Data controller - handles HTTP requests for pre-market trading operations
 */
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../../../core/utils/catchAsync');
const apiResponse = require('../../../core/utils/apiResponse');
const preMarketService = require('./pre-market.service');

/**
 * Get pre-market data for a stock on a specific date
 * @route GET /api/v1/pre-market/stocks/:stockId
 */
const getPreMarketData = catchAsync(async (req, res) => {
  const result = await preMarketService.getPreMarketData(
    req.params.stockId,
    req.query.tradingDate
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Pre-market data retrieved successfully')
  );
});

/**
 * Get current IEP for a stock
 * @route GET /api/v1/pre-market/stocks/:stockId/iep
 */
const getCurrentIEP = catchAsync(async (req, res) => {
  const result = await preMarketService.getCurrentIEP(req.params.stockId);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Current IEP retrieved successfully')
  );
});

/**
 * Add pre-market data for a stock
 * @route POST /api/v1/pre-market/data
 */
const addPreMarketData = catchAsync(async (req, res) => {
  const result = await preMarketService.addPreMarketData(req.body);
  
  const statusCode = result.isNew ? StatusCodes.CREATED : StatusCodes.OK;
  const message = result.isNew ? 'Pre-market data created successfully' : 'Pre-market data updated successfully';
  
  res.status(statusCode).json(
    apiResponse.success(result.preMarketData, message)
  );
});

/**
 * Add pre-market order book data
 * @route POST /api/v1/pre-market/data/:preMarketDataId/orders
 */
const addPreMarketOrders = catchAsync(async (req, res) => {
  const orders = await preMarketService.addPreMarketOrders(
    req.params.preMarketDataId,
    req.body.orders
  );
  
  res.status(StatusCodes.CREATED).json(
    apiResponse.success(orders, 'Pre-market orders added successfully')
  );
});

/**
 * Get pre-market summary for a specific date
 * @route GET /api/v1/pre-market/summary
 */
const getPreMarketSummary = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    exchange: req.query.exchange,
    sector: req.query.sector
  };

  const result = await preMarketService.getPreMarketSummary(
    req.query.tradingDate,
    options
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Pre-market summary retrieved successfully')
  );
});

/**
 * Get pre-market data for multiple stocks
 * @route POST /api/v1/pre-market/multiple-stocks
 */
const getMultipleStocksPreMarketData = catchAsync(async (req, res) => {
  const result = await preMarketService.getMultipleStocksPreMarketData(
    req.body.stockIds,
    req.body.tradingDate
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Multiple stocks pre-market data retrieved successfully')
  );
});

/**
 * Get historical pre-market data for a stock
 * @route GET /api/v1/pre-market/stocks/:stockId/history
 */
const getHistoricalPreMarketData = catchAsync(async (req, res) => {
  const dateFilter = {
    from: req.query.from,
    to: req.query.to
  };
  
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 30,
    sortOrder: req.query.sortOrder || 'DESC'
  };

  const result = await preMarketService.getHistoricalPreMarketData(
    req.params.stockId,
    dateFilter,
    options
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Historical pre-market data retrieved successfully')
  );
});

/**
 * Get top gainers/losers in pre-market
 * @route GET /api/v1/pre-market/movers
 */
const getPreMarketMovers = catchAsync(async (req, res) => {
  const result = await preMarketService.getPreMarketMovers(
    req.query.tradingDate,
    req.query.type,
    parseInt(req.query.limit) || 10
  );
  
  const message = req.query.type === 'losers' ? 
    'Pre-market top losers retrieved successfully' : 
    'Pre-market top gainers retrieved successfully';
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, message)
  );
});

/**
 * Update pre-market data
 * @route PUT /api/v1/pre-market/data/:preMarketDataId
 */
const updatePreMarketData = catchAsync(async (req, res) => {
  const result = await preMarketService.updatePreMarketData(
    req.params.preMarketDataId,
    req.body
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Pre-market data updated successfully')
  );
});

module.exports = {
  getPreMarketData,
  getCurrentIEP,
  addPreMarketData,
  addPreMarketOrders,
  getPreMarketSummary,
  getMultipleStocksPreMarketData,
  getHistoricalPreMarketData,
  getPreMarketMovers,
  updatePreMarketData
};