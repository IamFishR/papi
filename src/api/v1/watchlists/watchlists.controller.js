/**
 * Watchlist controller - handles HTTP requests for watchlist operations
 */
const { StatusCodes } = require('http-status-codes');
const pick = require('../../../core/utils/pick');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const watchlistService = require('./watchlist.service');
const { catchAsync } = require('../../../core/utils/catchAsync');

/**
 * Get all watchlists for the authenticated user
 * @route GET /api/v1/watchlists
 */
const getWatchlists = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
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
  
  const { watchlists, pagination } = await watchlistService.getWatchlists(userId, options);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.WATCHLISTS_FETCHED,
    watchlists,
    pagination
  );
});

/**
 * Create a new watchlist
 * @route POST /api/v1/watchlists
 */
const createWatchlist = catchAsync(async (req, res) => {
  // Add user ID to the watchlist data
  const watchlistData = {
    ...req.body,
    user_id: req.user.id
  };
  
  const watchlist = await watchlistService.createWatchlist(watchlistData);
  
  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.WATCHLIST_CREATED,
    watchlist
  );
});

/**
 * Update a watchlist
 * @route PUT /api/v1/watchlists/:id
 */
const updateWatchlist = catchAsync(async (req, res) => {
  const watchlistId = req.params.id;
  const updateData = req.body;
  
  const watchlist = await watchlistService.updateWatchlist(watchlistId, req.user.id, updateData);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.WATCHLIST_UPDATED,
    watchlist
  );
});

/**
 * Delete a watchlist
 * @route DELETE /api/v1/watchlists/:id
 */
const deleteWatchlist = catchAsync(async (req, res) => {
  await watchlistService.deleteWatchlist(req.params.id, req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.WATCHLIST_DELETED
  );
});

/**
 * Add a stock to a watchlist
 * @route POST /api/v1/watchlists/:id/stocks/:stock_id
 */
const addStockToWatchlist = catchAsync(async (req, res) => {
  const watchlistId = req.params.id;
  const stockId = req.params.stock_id;
  const positionOrder = req.body.position_order;
  
  await watchlistService.addStockToWatchlist(watchlistId, stockId, req.user.id, positionOrder);
  
  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.STOCK_ADDED_TO_WATCHLIST
  );
});

/**
 * Remove a stock from a watchlist
 * @route DELETE /api/v1/watchlists/:id/stocks/:stock_id
 */
const removeStockFromWatchlist = catchAsync(async (req, res) => {
  const watchlistId = req.params.id;
  const stockId = req.params.stock_id;
  
  await watchlistService.removeStockFromWatchlist(watchlistId, stockId, req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.STOCK_REMOVED_FROM_WATCHLIST
  );
});

module.exports = {
  getWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist
};
