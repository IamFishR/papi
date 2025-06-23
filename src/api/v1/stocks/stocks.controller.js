/**
 * Stock controller - handles HTTP requests for stock operations
 */
const { StatusCodes } = require('http-status-codes');
const pick = require('../../../core/utils/pick');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const stockService = require('./stock.service');
const { catchAsync } = require('../../../core/utils/catchAsync');
const { transformNSELivePrice } = require('./transformers/nseLivePriceTransformer');
const bulkLivePriceService = require('./services/bulkLivePriceUpdate.service');

/**
 * Get all stocks with filtering support
 * @route GET /api/v1/stocks
 */
const getStocks = catchAsync(async (req, res) => {
  // Extract filter parameters from query
  const filter = pick(req.query, [
    'search',
    'exchange',
    'sector',
  ]);

  // Extract pagination and sorting options
  const options = pick(req.query, [
    'sortBy',
    'sortOrder',
    'limit',
    'page',
  ]);

  // Convert string values to appropriate types
  options.limit = options.limit ? parseInt(options.limit, 10) : 10;
  options.page = options.page ? parseInt(options.page, 10) : 1;

  const { stocks, pagination } = await stockService.getStocks(filter, options);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCKS_FETCHED,
    stocks,
    pagination
  );
});

/**
 * Get stock by ID
 * @route GET /api/v1/stocks/:id
 */
const getStockById = catchAsync(async (req, res) => {
  const stock = await stockService.getStockById(req.params.id);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_FETCHED,
    stock
  );
});

/**
 * Get stock prices with date range filtering
 * @route GET /api/v1/stocks/:id/prices
 */
const getStockPrices = catchAsync(async (req, res) => {
  const stockId = req.params.id;
  const dateFilter = pick(req.query, ['from', 'to']);

  const stockPrices = await stockService.getStockPrices(stockId, dateFilter);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_PRICES_FETCHED,
    stockPrices
  );
});

/**
 * Add stock prices (data ingestion)
 * @route POST /api/v1/stocks/:id/prices
 */
const addStockPrices = catchAsync(async (req, res) => {
  const stockId = req.params.id;
  const priceData = req.body;

  const result = await stockService.addStockPrices(stockId, priceData);

  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.STOCK_PRICES_ADDED,
    result
  );
});

/**
 * Get stock news with sentiment and date filtering
 * @route GET /api/v1/stocks/:id/news
 */
const getStockNews = catchAsync(async (req, res) => {
  const stockId = req.params.id;
  const filter = pick(req.query, ['sentiment', 'from', 'to']);

  const news = await stockService.getStockNews(stockId, filter);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_NEWS_FETCHED,
    news
  );
});

/**
 * Get stock technical indicators with type and period filtering
 * @route GET /api/v1/stocks/:id/indicators
 */
const getStockIndicators = catchAsync(async (req, res) => {
  const stockId = req.params.id;
  const filter = pick(req.query, ['type', 'period']);

  const indicators = await stockService.getStockIndicators(stockId, filter);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_INDICATORS_FETCHED,
    indicators
  );
});

/**
 * Create a new stock
 * @route POST /api/v1/stocks
 * @admin
 */
const createStock = catchAsync(async (req, res) => {
  const stockData = req.body;

  const stock = await stockService.createStock(stockData);

  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.STOCK_CREATED,
    stock
  );
});

/**
 * Update an existing stock
 * @route PUT /api/v1/stocks/:id
 * @admin
 */
const updateStock = catchAsync(async (req, res) => {
  const stockId = req.params.id;
  const updateData = req.body;

  const stock = await stockService.updateStock(stockId, updateData);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_UPDATED,
    stock
  );
});

/**
 * Soft delete a stock
 * @route DELETE /api/v1/stocks/:id
 * @admin
 */
const deleteStock = catchAsync(async (req, res) => {
  const stockId = req.params.id;

  const stock = await stockService.deleteStock(stockId);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_DELETED,
    stock
  );
});

/**
 * Bulk update stock prices from NSE JSON data
 * @route POST /api/v1/stocks/bulk/prices
 * @admin
 */
const bulkUpdatePrices = catchAsync(async (req, res) => {
  const { priceData, priceDate } = req.body;

  const result = await stockService.bulkUpdatePrices(priceData, priceDate);

  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Bulk price update completed successfully',
    result
  );
});

/**
 * Complete market data processing - handles stock info, prices, pre-market data, valuation, and index memberships
 * @route POST /api/v1/stocks/complete-market-data
 * @admin
 */
const completeMarketData = catchAsync(async (req, res) => {
  // const { stockInfo, priceInfo, preMarketData, preMarketOrders, valuationMetrics, indexMemberships, industryInfo } = req.body;

  const result = await stockService.processCompleteMarketData(req.body);

  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    'Complete market data processed successfully',
    result
  );
});

/**
 * Bulk update stock live prices from NSE live feed
 * @route POST /api/v1/stocks/bulk/prices/live
 * @admin
 */
const bulkUpdateLivePrices = catchAsync(async (req, res) => {
  const transformedData = transformNSELivePrice(req.body);
  
  const result = await bulkLivePriceService(
    transformedData.priceData, 
    transformedData.priceDate,
    transformedData.marketData
  );

  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Live price update completed successfully',
    {
      summary: {
        totalSubmitted: result.totalSubmitted,
        processed: result.processed,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped.length,
        errors: result.errors.length
      },
      details: {
        skipped: result.skipped,
        errors: result.errors
      },
      priceDate: result.priceDate,
      marketDataProcessed: result.marketDataProcessed
    }
  );
});

module.exports = {
  getStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockNews,
  getStockIndicators,
  createStock,
  updateStock,
  deleteStock,
  bulkUpdatePrices,
  completeMarketData,
  bulkUpdateLivePrices
};
