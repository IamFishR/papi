/**
 * Stock Indices controller - handles HTTP requests for stock index operations
 */
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../../../core/utils/catchAsync');
const apiResponse = require('../../../core/utils/apiResponse');
const stockIndicesService = require('./stock-indices.service');

/**
 * Get all stock indices with filtering and pagination
 * @route GET /api/v1/indices
 */
const getAllIndices = catchAsync(async (req, res) => {
  const filter = {
    search: req.query.search,
    indexType: req.query.indexType,
    exchange: req.query.exchange
  };
  
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sortBy: req.query.sortBy || 'indexName',
    sortOrder: req.query.sortOrder || 'ASC'
  };

  const result = await stockIndicesService.getAllIndices(filter, options);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Stock indices retrieved successfully')
  );
});

/**
 * Get stock index by ID
 * @route GET /api/v1/indices/:id
 */
const getIndexById = catchAsync(async (req, res) => {
  const stockIndex = await stockIndicesService.getIndexById(req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(stockIndex, 'Stock index retrieved successfully')
  );
});

/**
 * Get index memberships
 * @route GET /api/v1/indices/:id/memberships
 */
const getIndexMemberships = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
    sortBy: req.query.sortBy || 'weight',
    sortOrder: req.query.sortOrder || 'DESC',
    activeOnly: req.query.activeOnly !== 'false'
  };

  const result = await stockIndicesService.getIndexMemberships(req.params.id, options);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Index memberships retrieved successfully')
  );
});

/**
 * Create a new stock index
 * @route POST /api/v1/indices
 */
const createIndex = catchAsync(async (req, res) => {
  const stockIndex = await stockIndicesService.createIndex(req.body);
  
  res.status(StatusCodes.CREATED).json(
    apiResponse.success(stockIndex, 'Stock index created successfully')
  );
});

/**
 * Update a stock index
 * @route PUT /api/v1/indices/:id
 */
const updateIndex = catchAsync(async (req, res) => {
  const stockIndex = await stockIndicesService.updateIndex(req.params.id, req.body);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(stockIndex, 'Stock index updated successfully')
  );
});

/**
 * Delete a stock index
 * @route DELETE /api/v1/indices/:id
 */
const deleteIndex = catchAsync(async (req, res) => {
  await stockIndicesService.deleteIndex(req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(null, 'Stock index deleted successfully')
  );
});

/**
 * Add stock to index
 * @route POST /api/v1/indices/:id/stocks
 */
const addStockToIndex = catchAsync(async (req, res) => {
  const membership = await stockIndicesService.addStockToIndex(
    req.body.stockId,
    req.params.id,
    req.body
  );
  
  res.status(StatusCodes.CREATED).json(
    apiResponse.success(membership, 'Stock added to index successfully')
  );
});

/**
 * Remove stock from index
 * @route DELETE /api/v1/indices/:id/stocks/:stockId
 */
const removeStockFromIndex = catchAsync(async (req, res) => {
  await stockIndicesService.removeStockFromIndex(req.params.stockId, req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(null, 'Stock removed from index successfully')
  );
});

/**
 * Update index weights
 * @route PUT /api/v1/indices/:id/weights
 */
const updateIndexWeights = catchAsync(async (req, res) => {
  const updatedMemberships = await stockIndicesService.updateIndexWeights(
    req.params.id,
    req.body.weights
  );
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(updatedMemberships, 'Index weights updated successfully')
  );
});

/**
 * Get indices by type
 * @route GET /api/v1/indices/type/:type
 */
const getIndicesByType = catchAsync(async (req, res) => {
  const indices = await stockIndicesService.getIndicesByType(req.params.type);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(indices, 'Indices by type retrieved successfully')
  );
});

/**
 * Get stock index memberships
 * @route GET /api/v1/indices/stocks/:stockId/memberships
 */
const getStockIndexMemberships = catchAsync(async (req, res) => {
  const activeOnly = req.query.activeOnly !== 'false';
  const result = await stockIndicesService.getStockIndexMemberships(req.params.stockId, activeOnly);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Stock index memberships retrieved successfully')
  );
});

/**
 * Get index composition summary
 * @route GET /api/v1/indices/:id/composition
 */
const getIndexCompositionSummary = catchAsync(async (req, res) => {
  const result = await stockIndicesService.getIndexCompositionSummary(req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Index composition summary retrieved successfully')
  );
});

module.exports = {
  getAllIndices,
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
  getIndexCompositionSummary
};