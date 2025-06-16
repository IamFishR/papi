/**
 * Stock service - handles business logic for stock operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get stocks with pagination, filtering and search
 * @param {Object} filter - Filter options (symbol, exchange, sector)
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated stocks list with metadata
 */
const getStocks = async (filter, options) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = {};
  
  // Apply search filter for symbol or company name
  if (filter.search) {
    whereConditions[Op.or] = [
      { symbol: { [Op.like]: `%${filter.search}%` } },
      { companyName: { [Op.like]: `%${filter.search}%` } }
    ];
  }
  
  // Apply exchange filter
  if (filter.exchange) {
    whereConditions.exchangeId = filter.exchange;
  }
  
  // Apply sector filter
  if (filter.sector) {
    whereConditions.sectorId = filter.sector;
  }

  // Execute query with includes for related data
  const { rows, count } = await db.Stock.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'symbol', sortOrder || 'ASC']],
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Sector, as: 'sector' }
    ]
  });

  // Return paginated result
  return {
    results: rows,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit
  };
};

/**
 * Get stock by ID
 * @param {number} id - Stock ID
 * @returns {Promise<Object>} Stock with related data
 */
const getStockById = async (id) => {
  const stock = await db.Stock.findByPk(id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Sector, as: 'sector' }
    ]
  });

  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  return stock;
};

/**
 * Get stock prices with date range filtering
 * @param {number} stockId - Stock ID
 * @param {Date} fromDate - Start date for price data
 * @param {Date} toDate - End date for price data
 * @returns {Promise<Array>} Stock price data within date range
 */
const getStockPrices = async (stockId, fromDate, toDate) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Prepare filter conditions
  const whereConditions = { 
    stockId: stockId 
  };
  
  // Add date range filtering if provided
  if (fromDate || toDate) {
    whereConditions.priceDate = {};
    
    if (fromDate) {
      whereConditions.priceDate[Op.gte] = fromDate;
    }
    
    if (toDate) {
      whereConditions.priceDate[Op.lte] = toDate;
    }
  }

  // Get stock prices
  const stockPrices = await db.StockPrice.findAll({
    where: whereConditions,
    order: [['priceDate', 'ASC']]
  });

  return stockPrices;
};

/**
 * Add stock prices (for data ingestion)
 * @param {number} stockId - Stock ID
 * @param {Array} priceData - Array of price data objects
 * @returns {Promise<Array>} Created stock price records
 */
const addStockPrices = async (stockId, priceData) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Add stock ID to each price data item
  const pricesWithStockId = priceData.map(price => ({
    ...price,
    stockId
  }));

  // Use bulkCreate with updateOnDuplicate to handle existing records
  const createdPrices = await db.StockPrice.bulkCreate(pricesWithStockId, {
    updateOnDuplicate: [
      'price', 'volume', 'high', 'low', 'openPrice', 
      'closePrice', 'priceTimestamp'
    ]
  });

  return createdPrices;
};

/**
 * Get stock technical indicators
 * @param {number} stockId - Stock ID
 * @param {string} type - Indicator type
 * @param {number} period - Period for calculation
 * @returns {Promise<Array>} Technical indicator data
 */
const getStockIndicators = async (stockId, type, period) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Prepare filter conditions
  const whereConditions = { 
    stockId: stockId 
  };
  
  // Add indicator type filter if provided
  if (type) {
    // Get the indicator type ID
    const indicatorType = await db.IndicatorType.findOne({
      where: { name: type }
    });
    
    if (indicatorType) {
      whereConditions.indicatorTypeId = indicatorType.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid indicator type');
    }
  }
  
  // Add period filter if provided
  if (period) {
    whereConditions.periodLength = period;
  }

  // Get technical indicators
  const indicators = await db.TechnicalIndicator.findAll({
    where: whereConditions,
    include: [
      { model: db.IndicatorType, as: 'indicatorType' }
    ],
    order: [['calculationDate', 'ASC']]
  });

  return indicators;
};

/**
 * Get stock news with sentiment filtering
 * @param {number} stockId - Stock ID
 * @param {string} sentiment - Sentiment type
 * @param {Date} fromDate - Start date for news
 * @returns {Promise<Array>} News mentions for the stock
 */
const getStockNews = async (stockId, sentiment, fromDate) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Prepare filter conditions
  const whereConditions = { 
    stockId: stockId 
  };
  
  // Add sentiment filter if provided
  if (sentiment && sentiment !== 'any') {
    // Get the sentiment type ID
    const sentimentType = await db.SentimentType.findOne({
      where: { name: sentiment }
    });
    
    if (sentimentType) {
      whereConditions.sentimentTypeId = sentimentType.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid sentiment type');
    }
  }
  
  // Add date filter if provided
  if (fromDate) {
    whereConditions.publicationDate = {
      [Op.gte]: fromDate
    };
  }

  // Get news mentions
  const news = await db.NewsMention.findAll({
    where: whereConditions,
    include: [
      { model: db.NewsSource, as: 'newsSource' },
      { model: db.SentimentType, as: 'sentimentType' }
    ],
    order: [['publicationDate', 'DESC']]
  });

  return news;
};

module.exports = {
  getStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockIndicators,
  getStockNews
};
