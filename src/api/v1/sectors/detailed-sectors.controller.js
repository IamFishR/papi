/**
 * Detailed Sectors controller - handles HTTP requests for detailed sector operations
 */
const { StatusCodes } = require('http-status-codes');
const catchAsync = require('../../../core/utils/catchAsync');
const apiResponse = require('../../../core/utils/apiResponse');
const detailedSectorService = require('./detailed-sectors.service');

/**
 * Get all detailed sectors with filtering and pagination
 * @route GET /api/v1/sectors/detailed
 */
const getDetailedSectors = catchAsync(async (req, res) => {
  const filter = {
    search: req.query.search,
    macroSector: req.query.macroSector,
    sector: req.query.sector,
    industry: req.query.industry,
    basicIndustry: req.query.basicIndustry
  };
  
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sortBy: req.query.sortBy || 'macroSector',
    sortOrder: req.query.sortOrder || 'ASC'
  };

  const result = await detailedSectorService.getDetailedSectors(filter, options);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Detailed sectors retrieved successfully')
  );
});

/**
 * Get detailed sector by ID
 * @route GET /api/v1/sectors/detailed/:id
 */
const getDetailedSectorById = catchAsync(async (req, res) => {
  const detailedSector = await detailedSectorService.getDetailedSectorById(req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(detailedSector, 'Detailed sector retrieved successfully')
  );
});

/**
 * Get sector hierarchy
 * @route GET /api/v1/sectors/detailed/hierarchy
 */
const getSectorHierarchy = catchAsync(async (req, res) => {
  const hierarchy = await detailedSectorService.getSectorHierarchy();
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(hierarchy, 'Sector hierarchy retrieved successfully')
  );
});

/**
 * Get stocks by detailed sector
 * @route GET /api/v1/sectors/detailed/:id/stocks
 */
const getStocksByDetailedSector = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sortBy: req.query.sortBy || 'symbol',
    sortOrder: req.query.sortOrder || 'ASC'
  };

  const result = await detailedSectorService.getStocksByDetailedSector(req.params.id, options);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Stocks for detailed sector retrieved successfully')
  );
});

/**
 * Create a new detailed sector
 * @route POST /api/v1/sectors/detailed
 */
const createDetailedSector = catchAsync(async (req, res) => {
  const detailedSector = await detailedSectorService.createDetailedSector(req.body);
  
  res.status(StatusCodes.CREATED).json(
    apiResponse.success(detailedSector, 'Detailed sector created successfully')
  );
});

/**
 * Update a detailed sector
 * @route PUT /api/v1/sectors/detailed/:id
 */
const updateDetailedSector = catchAsync(async (req, res) => {
  const detailedSector = await detailedSectorService.updateDetailedSector(req.params.id, req.body);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(detailedSector, 'Detailed sector updated successfully')
  );
});

/**
 * Delete a detailed sector (soft delete)
 * @route DELETE /api/v1/sectors/detailed/:id
 */
const deleteDetailedSector = catchAsync(async (req, res) => {
  await detailedSectorService.deleteDetailedSector(req.params.id);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(null, 'Detailed sector deleted successfully')
  );
});

/**
 * Get detailed sectors by macro sector
 * @route GET /api/v1/sectors/detailed/macro/:macroSector
 */
const getDetailedSectorsByMacroSector = catchAsync(async (req, res) => {
  const detailedSectors = await detailedSectorService.getDetailedSectorsByMacroSector(req.params.macroSector);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(detailedSectors, 'Detailed sectors by macro sector retrieved successfully')
  );
});

/**
 * Search detailed sectors
 * @route GET /api/v1/sectors/detailed/search
 */
const searchDetailedSectors = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const result = await detailedSectorService.searchDetailedSectors(req.query.q, options);
  
  res.status(StatusCodes.OK).json(
    apiResponse.success(result, 'Detailed sectors search completed successfully')
  );
});

module.exports = {
  getDetailedSectors,
  getDetailedSectorById,
  getSectorHierarchy,
  getStocksByDetailedSector,
  createDetailedSector,
  updateDetailedSector,
  deleteDetailedSector,
  getDetailedSectorsByMacroSector,
  searchDetailedSectors
};