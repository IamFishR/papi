/**
 * Stock Indices service - handles business logic for stock index operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const db = require('../../../database/models');

/**
 * Get all stock indices with pagination and filtering
 * @param {Object} filter - Filter options (indexType, exchange)
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated stock indices list with metadata
 */
const getAllIndices = async (filter, options) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = {
    isActive: true
  };
  
  // Apply index type filter
  if (filter.indexType) {
    whereConditions.indexType = filter.indexType;
  }
  
  // Apply exchange filter
  if (filter.exchange) {
    whereConditions.exchangeId = filter.exchange;
  }
  
  // Apply search filter
  if (filter.search) {
    whereConditions[Op.or] = [
      { indexName: { [Op.like]: `%${filter.search}%` } },
      { indexCode: { [Op.like]: `%${filter.search}%` } },
      { description: { [Op.like]: `%${filter.search}%` } }
    ];
  }

  // Execute query with includes for related data
  const { rows, count } = await db.StockIndex.findAndCountAll({
    where: whereConditions,
    include: [
      { model: db.Exchange, as: 'exchange', attributes: ['name', 'code'] },
      { model: db.Currency, as: 'currency', attributes: ['name', 'code'] }
    ],
    limit,
    offset,
    order: [[sortBy || 'indexName', sortOrder || 'ASC']]
  });

  // Return paginated result
  return {
    indices: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get stock index by ID
 * @param {number} id - Stock index ID
 * @returns {Promise<Object>} Stock index with related data
 */
const getIndexById = async (id) => {
  const stockIndex = await db.StockIndex.findOne({
    where: { 
      id: id,
      isActive: true 
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' }
    ]
  });

  if (!stockIndex) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock index not found');
  }

  return stockIndex;
};

/**
 * Get index memberships (stocks in an index)
 * @param {number} indexId - Stock index ID
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Index memberships with stock details
 */
const getIndexMemberships = async (indexId, options = {}) => {
  const { limit = 50, page = 1, sortBy = 'weight', sortOrder = 'DESC', activeOnly = true } = options;
  const offset = (page - 1) * limit;

  // Verify index exists
  const stockIndex = await getIndexById(indexId);

  // Build where conditions
  const whereConditions = { indexId: indexId };
  if (activeOnly) {
    whereConditions.isActive = true;
  }

  const { rows, count } = await db.StockIndexMembership.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['id', 'symbol', 'companyName', 'marketCap'],
        include: [
          { model: db.Exchange, as: 'exchange', attributes: ['name', 'code'] }
        ]
      }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

  return {
    index: stockIndex,
    memberships: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Add stock to index
 * @param {number} stockId - Stock ID
 * @param {number} indexId - Index ID
 * @param {Object} membershipData - Membership data (weight, rank, etc.)
 * @returns {Promise<Object>} Created membership
 */
const addStockToIndex = async (stockId, indexId, membershipData) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Verify index exists
  const stockIndex = await getIndexById(indexId);

  // Check if membership already exists
  const existingMembership = await db.StockIndexMembership.findOne({
    where: {
      stockId: stockId,
      indexId: indexId,
      isActive: true
    }
  });

  if (existingMembership) {
    throw new ApiError(StatusCodes.CONFLICT, 'Stock is already a member of this index');
  }

  // Create membership
  const membership = await db.StockIndexMembership.create({
    stockId: stockId,
    indexId: indexId,
    addedDate: new Date(),
    isActive: true,
    ...membershipData
  });

  // Return membership with related data
  return await db.StockIndexMembership.findByPk(membership.id, {
    include: [
      { model: db.Stock, as: 'stock', attributes: ['symbol', 'companyName'] },
      { model: db.StockIndex, as: 'index', attributes: ['indexName', 'indexCode'] }
    ]
  });
};

/**
 * Remove stock from index
 * @param {number} stockId - Stock ID
 * @param {number} indexId - Index ID
 * @returns {Promise<Object>} Updated membership
 */
const removeStockFromIndex = async (stockId, indexId) => {
  // Find active membership
  const membership = await db.StockIndexMembership.findOne({
    where: {
      stockId: stockId,
      indexId: indexId,
      isActive: true
    }
  });

  if (!membership) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Active membership not found');
  }

  // Update membership to inactive
  await membership.update({
    isActive: false,
    removedDate: new Date()
  });

  return membership;
};

/**
 * Update index weights for multiple stocks
 * @param {number} indexId - Index ID
 * @param {Array} weights - Array of {stockId, weight, rankPosition} objects
 * @returns {Promise<Array>} Updated memberships
 */
const updateIndexWeights = async (indexId, weights) => {
  // Verify index exists
  await getIndexById(indexId);

  const updatedMemberships = [];

  // Update each membership
  for (const weightData of weights) {
    const membership = await db.StockIndexMembership.findOne({
      where: {
        stockId: weightData.stockId,
        indexId: indexId,
        isActive: true
      }
    });

    if (!membership) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Active membership not found for stock ID ${weightData.stockId}`);
    }

    await membership.update({
      weight: weightData.weight,
      rankPosition: weightData.rankPosition || membership.rankPosition,
      freeFloatMarketCap: weightData.freeFloatMarketCap || membership.freeFloatMarketCap,
      indexShares: weightData.indexShares || membership.indexShares
    });

    updatedMemberships.push(membership);
  }

  return updatedMemberships;
};

/**
 * Create a new stock index
 * @param {Object} indexData - Index data to create
 * @returns {Promise<Object>} Created stock index
 */
const createIndex = async (indexData) => {
  // Check if index with same name or code already exists
  const existingIndex = await db.StockIndex.findOne({
    where: {
      [Op.or]: [
        { indexName: indexData.indexName },
        { indexCode: indexData.indexCode }
      ]
    }
  });

  if (existingIndex) {
    throw new ApiError(StatusCodes.CONFLICT, 'Index with this name or code already exists');
  }

  // Create the index
  const stockIndex = await db.StockIndex.create(indexData);

  // Return index with associations
  return await db.StockIndex.findByPk(stockIndex.id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' }
    ]
  });
};

/**
 * Update an existing stock index
 * @param {number} id - Index ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated stock index
 */
const updateIndex = async (id, updateData) => {
  // Check if index exists
  const stockIndex = await getIndexById(id);

  // Check if name/code is being updated and already exists
  if (updateData.indexName || updateData.indexCode) {
    const conditions = [];
    
    if (updateData.indexName && updateData.indexName !== stockIndex.indexName) {
      conditions.push({ indexName: updateData.indexName });
    }
    
    if (updateData.indexCode && updateData.indexCode !== stockIndex.indexCode) {
      conditions.push({ indexCode: updateData.indexCode });
    }
    
    if (conditions.length > 0) {
      const existingIndex = await db.StockIndex.findOne({
        where: {
          [Op.or]: conditions,
          id: { [Op.ne]: id }
        }
      });

      if (existingIndex) {
        throw new ApiError(StatusCodes.CONFLICT, 'Index with this name or code already exists');
      }
    }
  }

  // Update the index
  await stockIndex.update(updateData);

  // Return updated index with associations
  return await db.StockIndex.findByPk(id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' }
    ]
  });
};

/**
 * Soft delete a stock index
 * @param {number} id - Index ID
 * @returns {Promise<Object>} Deleted stock index
 */
const deleteIndex = async (id) => {
  // Check if index exists
  const stockIndex = await getIndexById(id);

  // Check if there are active memberships
  const activeMemberships = await db.StockIndexMembership.count({
    where: {
      indexId: id,
      isActive: true
    }
  });

  if (activeMemberships > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot delete index. ${activeMemberships} active memberships exist.`
    );
  }

  // Soft delete by setting isActive to false
  await stockIndex.update({ isActive: false });

  return stockIndex;
};

/**
 * Get indices by type
 * @param {string} indexType - Index type (MARKET_CAP, EQUAL_WEIGHT, etc.)
 * @returns {Promise<Array>} List of indices by type
 */
const getIndicesByType = async (indexType) => {
  const indices = await db.StockIndex.findAll({
    where: {
      indexType: indexType,
      isActive: true
    },
    include: [
      { model: db.Exchange, as: 'exchange', attributes: ['name', 'code'] }
    ],
    order: [['indexName', 'ASC']]
  });

  return indices;
};

/**
 * Get stock's index memberships
 * @param {number} stockId - Stock ID
 * @param {boolean} activeOnly - Whether to return only active memberships
 * @returns {Promise<Array>} List of indices the stock belongs to
 */
const getStockIndexMemberships = async (stockId, activeOnly = true) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  const whereConditions = { stockId: stockId };
  if (activeOnly) {
    whereConditions.isActive = true;
  }

  const memberships = await db.StockIndexMembership.findAll({
    where: whereConditions,
    include: [
      {
        model: db.StockIndex,
        as: 'index',
        attributes: ['id', 'indexName', 'indexCode', 'indexType']
      }
    ],
    order: [['weight', 'DESC']]
  });

  return {
    stock: {
      id: stock.id,
      symbol: stock.symbol,
      companyName: stock.companyName
    },
    memberships
  };
};

/**
 * Get index composition summary
 * @param {number} indexId - Index ID
 * @returns {Promise<Object>} Index composition summary with statistics
 */
const getIndexCompositionSummary = async (indexId) => {
  // Verify index exists
  const stockIndex = await getIndexById(indexId);

  // Get composition statistics
  const stats = await db.StockIndexMembership.findAll({
    where: {
      indexId: indexId,
      isActive: true
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        include: [
          { model: db.DetailedSector, as: 'detailedSector', attributes: ['macroSector', 'sector'] }
        ]
      }
    ]
  });

  // Calculate sector distribution
  const sectorDistribution = {};
  let totalWeight = 0;

  stats.forEach(membership => {
    const sector = membership.stock.detailedSector?.sector || 'Unknown';
    if (!sectorDistribution[sector]) {
      sectorDistribution[sector] = {
        weight: 0,
        stocks: 0
      };
    }
    sectorDistribution[sector].weight += membership.weight || 0;
    sectorDistribution[sector].stocks += 1;
    totalWeight += membership.weight || 0;
  });

  return {
    index: stockIndex,
    summary: {
      totalStocks: stats.length,
      totalWeight: totalWeight,
      sectorDistribution: sectorDistribution,
      topHoldings: stats
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 10)
        .map(m => ({
          stock: {
            symbol: m.stock.symbol,
            companyName: m.stock.companyName
          },
          weight: m.weight,
          rankPosition: m.rankPosition
        }))
    }
  };
};

module.exports = {
  getAllIndices,
  getIndexById,
  getIndexMemberships,
  addStockToIndex,
  removeStockFromIndex,
  updateIndexWeights,
  createIndex,
  updateIndex,
  deleteIndex,
  getIndicesByType,
  getStockIndexMemberships,
  getIndexCompositionSummary
};