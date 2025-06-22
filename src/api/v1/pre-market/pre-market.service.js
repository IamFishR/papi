/**
 * Pre-Market Data service - handles business logic for pre-market trading operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const db = require('../../../database/models');

/**
 * Get pre-market data for a stock on a specific date
 * @param {number} stockId - Stock ID
 * @param {string} tradingDate - Trading date (YYYY-MM-DD)
 * @returns {Promise<Object>} Pre-market data with order book
 */
const getPreMarketData = async (stockId, tradingDate) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get pre-market data
  const preMarketData = await db.PreMarketData.findOne({
    where: {
      stockId: stockId,
      tradingDate: tradingDate
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName']
      }
    ]
  });

  if (!preMarketData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pre-market data not found for this stock and date');
  }

  // Get associated order book data
  const orderBook = await db.PreMarketOrder.findAll({
    where: {
      preMarketDataId: preMarketData.id
    },
    order: [
      ['orderType', 'DESC'], // SELL orders first, then BUY orders
      ['price', 'DESC'] // Highest price first for SELL, lowest for BUY
    ]
  });

  return {
    preMarketData,
    orderBook
  };
};

/**
 * Get current IEP (Indicative Equilibrium Price) for a stock
 * @param {number} stockId - Stock ID
 * @returns {Promise<Object>} Current IEP data
 */
const getCurrentIEP = async (stockId) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get latest pre-market data for today
  const today = new Date().toISOString().split('T')[0];
  
  const preMarketData = await db.PreMarketData.findOne({
    where: {
      stockId: stockId,
      tradingDate: today
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName']
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  if (!preMarketData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No pre-market data available for today');
  }

  // Get IEP order information
  const iepOrder = await db.PreMarketOrder.findOne({
    where: {
      preMarketDataId: preMarketData.id,
      isIep: true
    }
  });

  return {
    stockId,
    stock: preMarketData.stock,
    tradingDate: preMarketData.tradingDate,
    currentIEP: preMarketData.iep,
    iepChange: preMarketData.iepChange,
    iepChangePercent: preMarketData.iepChangePercent,
    finalIEP: preMarketData.finalIep,
    finalIEPQty: preMarketData.finalIepQty,
    totalTradedVolume: preMarketData.totalTradedVolume,
    totalTradedValue: preMarketData.totalTradedValue,
    iepOrderDetails: iepOrder,
    lastUpdated: preMarketData.updatedAt
  };
};

/**
 * Add pre-market data for a stock
 * @param {Object} preMarketData - Pre-market data to add
 * @returns {Promise<Object>} Created pre-market data
 */
const addPreMarketData = async (preMarketData) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(preMarketData.stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Use upsert to handle existing records
  const [preMarket, created] = await db.PreMarketData.upsert(preMarketData, {
    returning: true
  });

  return {
    preMarketData: preMarket,
    isNew: created
  };
};

/**
 * Add pre-market order book data
 * @param {number} preMarketDataId - Pre-market data ID
 * @param {Array} orders - Array of order book entries
 * @returns {Promise<Array>} Created order book entries
 */
const addPreMarketOrders = async (preMarketDataId, orders) => {
  // Verify pre-market data exists
  const preMarketData = await db.PreMarketData.findByPk(preMarketDataId);
  if (!preMarketData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pre-market data not found');
  }

  // Add pre-market data ID and stock ID to each order
  const ordersWithIds = orders.map(order => ({
    ...order,
    preMarketDataId: preMarketDataId,
    stockId: preMarketData.stockId
  }));

  // Clear existing orders for this pre-market session
  await db.PreMarketOrder.destroy({
    where: {
      preMarketDataId: preMarketDataId
    }
  });

  // Create new orders
  const createdOrders = await db.PreMarketOrder.bulkCreate(ordersWithIds);

  return createdOrders;
};

/**
 * Get pre-market summary for a specific date
 * @param {string} tradingDate - Trading date (YYYY-MM-DD)
 * @param {Object} options - Query options (pagination, filters)
 * @returns {Promise<Object>} Pre-market summary with pagination
 */
const getPreMarketSummary = async (tradingDate, options = {}) => {
  const { limit = 50, page = 1, exchange = null, sector = null } = options;
  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = {
    tradingDate: tradingDate
  };

  // Build include conditions for filtering by exchange or sector
  const includeConditions = [
    {
      model: db.Stock,
      as: 'stock',
      attributes: ['symbol', 'companyName', 'exchangeId', 'sectorDetailedId'],
      where: {},
      include: [
        { model: db.Exchange, as: 'exchange', attributes: ['name', 'code'] },
        { model: db.DetailedSector, as: 'detailedSector', attributes: ['macroSector', 'sector'] }
      ]
    }
  ];

  // Apply exchange filter
  if (exchange) {
    includeConditions[0].where.exchangeId = exchange;
  }

  // Apply sector filter
  if (sector) {
    includeConditions[0].where.sectorDetailedId = sector;
  }

  const { rows, count } = await db.PreMarketData.findAndCountAll({
    where: whereConditions,
    include: includeConditions,
    limit,
    offset,
    order: [['totalTradedValue', 'DESC']]
  });

  return {
    tradingDate,
    preMarketSummary: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get pre-market data for multiple stocks on a date
 * @param {Array} stockIds - Array of stock IDs
 * @param {string} tradingDate - Trading date (YYYY-MM-DD)
 * @returns {Promise<Array>} Pre-market data for multiple stocks
 */
const getMultipleStocksPreMarketData = async (stockIds, tradingDate) => {
  const preMarketData = await db.PreMarketData.findAll({
    where: {
      stockId: { [Op.in]: stockIds },
      tradingDate: tradingDate
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName']
      }
    ],
    order: [['totalTradedValue', 'DESC']]
  });

  return preMarketData;
};

/**
 * Get historical pre-market data for a stock
 * @param {number} stockId - Stock ID
 * @param {Object} dateFilter - Date range filter
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Historical pre-market data with pagination
 */
const getHistoricalPreMarketData = async (stockId, dateFilter = {}, options = {}) => {
  const { limit = 30, page = 1, sortOrder = 'DESC' } = options;
  const { from: fromDate, to: toDate } = dateFilter;
  const offset = (page - 1) * limit;

  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Build where conditions
  const whereConditions = {
    stockId: stockId
  };

  // Add date range filtering if provided
  if (fromDate || toDate) {
    whereConditions.tradingDate = {};
    
    if (fromDate) {
      whereConditions.tradingDate[Op.gte] = fromDate;
    }
    
    if (toDate) {
      whereConditions.tradingDate[Op.lte] = toDate;
    }
  }

  const { rows, count } = await db.PreMarketData.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [['tradingDate', sortOrder]]
  });

  return {
    stock: {
      id: stock.id,
      symbol: stock.symbol,
      companyName: stock.companyName
    },
    preMarketHistory: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get top gainers/losers in pre-market
 * @param {string} tradingDate - Trading date (YYYY-MM-DD)
 * @param {string} type - 'gainers' or 'losers'
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Top gainers or losers
 */
const getPreMarketMovers = async (tradingDate, type = 'gainers', limit = 10) => {
  const sortOrder = type === 'gainers' ? 'DESC' : 'ASC';
  
  const preMarketData = await db.PreMarketData.findAll({
    where: {
      tradingDate: tradingDate,
      iepChangePercent: { [Op.ne]: null }
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName'],
        include: [
          { model: db.Exchange, as: 'exchange', attributes: ['name', 'code'] }
        ]
      }
    ],
    order: [['iepChangePercent', sortOrder]],
    limit: limit
  });

  return preMarketData;
};

/**
 * Update pre-market data with latest information
 * @param {number} preMarketDataId - Pre-market data ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated pre-market data
 */
const updatePreMarketData = async (preMarketDataId, updateData) => {
  const preMarketData = await db.PreMarketData.findByPk(preMarketDataId);
  
  if (!preMarketData) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pre-market data not found');
  }
  
  await preMarketData.update(updateData);
  
  return preMarketData;
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
  updatePreMarketData
};