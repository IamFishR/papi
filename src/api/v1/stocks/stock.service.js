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
  const whereConditions = {
    isActive: true  // Only return active stocks
  };
  
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
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Sector, as: 'sector' },
      { model: db.Currency, as: 'currency' }
    ],
    limit,
    offset,
    order: [[sortBy || 'symbol', sortOrder || 'ASC']]
  });

  // Return paginated result
  return {
    stocks: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get stock by ID
 * @param {number} id - Stock ID
 * @returns {Promise<Object>} Stock with related data
 */
const getStockById = async (id) => {
  const stock = await db.Stock.findByPk(id);

  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  return stock;
};

/**
 * Get stock prices with date range filtering
 * @param {number} stockId - Stock ID
 * @param {Object} dateFilter - Date filter object with from/to properties
 * @returns {Promise<Array>} Stock price data within date range
 */
const getStockPrices = async (stockId, dateFilter) => {
  const { from: fromDate, to: toDate } = dateFilter || {};
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
 * @param {Object} filter - Filter object with type and period properties
 * @returns {Promise<Array>} Technical indicator data
 */
const getStockIndicators = async (stockId, filter) => {
  const { type, period } = filter || {};
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
 * @param {Object} filter - Filter object with sentiment, from, to properties
 * @returns {Promise<Array>} News mentions for the stock
 */
const getStockNews = async (stockId, filter) => {
  const { sentiment, from: fromDate, to: toDate } = filter || {};
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
  
  // Add date range filtering if provided
  if (fromDate || toDate) {
    whereConditions.publicationDate = {};
    
    if (fromDate) {
      whereConditions.publicationDate[Op.gte] = fromDate;
    }
    
    if (toDate) {
      whereConditions.publicationDate[Op.lte] = toDate;
    }
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

/**
 * Validation helpers for foreign key existence
 */

/**
 * Check if exchange exists and is active
 * @param {number} exchangeId - Exchange ID to validate
 * @returns {Promise<boolean>} True if exchange exists and is active
 */
const validateExchangeExists = async (exchangeId) => {
  if (!exchangeId) return true; // null is allowed for optional fields
  
  const exchange = await db.Exchange.findOne({
    where: { 
      id: exchangeId,
      isActive: true 
    }
  });
  
  return !!exchange;
};

/**
 * Check if sector exists and is active
 * @param {number} sectorId - Sector ID to validate
 * @returns {Promise<boolean>} True if sector exists and is active
 */
const validateSectorExists = async (sectorId) => {
  if (!sectorId) return true; // null is allowed for optional fields
  
  const sector = await db.Sector.findOne({
    where: { 
      id: sectorId,
      isActive: true 
    }
  });
  
  return !!sector;
};

/**
 * Check if currency exists and is active
 * @param {number} currencyId - Currency ID to validate
 * @returns {Promise<boolean>} True if currency exists and is active
 */
const validateCurrencyExists = async (currencyId) => {
  if (!currencyId) return true; // null is allowed for optional fields
  
  const currency = await db.Currency.findOne({
    where: { 
      id: currencyId,
      isActive: true 
    }
  });
  
  return !!currency;
};

/**
 * Validate all foreign key dependencies
 * @param {Object} stockData - Stock data with foreign keys
 * @returns {Promise<void>} Throws error if any dependency is invalid
 */
const validateStockDependencies = async (stockData) => {
  const { exchangeId, sectorId, currencyId } = stockData;
  
  // Validate exchange (required)
  if (exchangeId && !(await validateExchangeExists(exchangeId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid exchange ID. Exchange not found or inactive.');
  }
  
  // Validate sector (optional)
  if (sectorId && !(await validateSectorExists(sectorId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid sector ID. Sector not found or inactive.');
  }
  
  // Validate currency (required)
  if (currencyId && !(await validateCurrencyExists(currencyId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid currency ID. Currency not found or inactive.');
  }
};

/**
 * Create a new stock
 * @param {Object} stockData - Stock data to create
 * @returns {Promise<Object>} Created stock
 */
const createStock = async (stockData) => {
  // Validate foreign key dependencies
  await validateStockDependencies(stockData);
  
  // Check if stock symbol already exists
  const existingStock = await db.Stock.findOne({
    where: { symbol: stockData.symbol }
  });
  
  if (existingStock) {
    throw new ApiError(StatusCodes.CONFLICT, 'Stock with this symbol already exists');
  }
  
  // Create the stock
  const stock = await db.Stock.create(stockData);
  
  // Return stock with associations
  return await db.Stock.findByPk(stock.id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Sector, as: 'sector' },
      { model: db.Currency, as: 'currency' }
    ]
  });
};

/**
 * Update an existing stock
 * @param {number} id - Stock ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated stock
 */
const updateStock = async (id, updateData) => {
  // Check if stock exists
  const stock = await db.Stock.findByPk(id);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }
  
  // Validate foreign key dependencies
  await validateStockDependencies(updateData);
  
  // Check if symbol is being updated and already exists
  if (updateData.symbol && updateData.symbol !== stock.symbol) {
    const existingStock = await db.Stock.findOne({
      where: { 
        symbol: updateData.symbol,
        id: { [Op.ne]: id } // Exclude current stock
      }
    });
    
    if (existingStock) {
      throw new ApiError(StatusCodes.CONFLICT, 'Stock with this symbol already exists');
    }
  }
  
  // Update the stock
  await stock.update(updateData);
  
  // Return updated stock with associations
  return await db.Stock.findByPk(id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Sector, as: 'sector' },
      { model: db.Currency, as: 'currency' }
    ]
  });
};

/**
 * Soft delete a stock
 * @param {number} id - Stock ID
 * @returns {Promise<Object>} Deleted stock
 */
const deleteStock = async (id) => {
  // Check if stock exists
  const stock = await db.Stock.findByPk(id);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }
  
  // Soft delete by setting isActive to false
  await stock.update({ isActive: false });
  
  return stock;
};

/**
 * Bulk update stock prices from NSE JSON data
 * @param {Array} priceData - Array of NSE price data objects
 * @param {string} priceDate - Date for the price data (YYYY-MM-DD)
 * @returns {Promise<Object>} Results of bulk update operation
 */
const bulkUpdatePrices = async (priceData, priceDate) => {
  const results = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: [],
    skipped: []
  };

  // Get all active stocks to map symbols to IDs
  const stocks = await db.Stock.findAll({
    where: { isActive: true },
    attributes: ['id', 'symbol'],
    raw: true
  });

  const symbolToIdMap = {};
  stocks.forEach(stock => {
    symbolToIdMap[stock.symbol] = stock.id;
  });

  // Process each price data item
  const priceRecords = [];
  
  for (const item of priceData) {
    try {
      const stockId = symbolToIdMap[item.symbol];
      
      if (!stockId) {
        results.skipped.push({
          symbol: item.symbol,
          reason: 'Stock not found in database'
        });
        continue;
      }

      // Transform NSE data to our price format
      const priceRecord = {
        stockId: stockId,
        priceDate: priceDate,
        openPrice: item.open || null,
        closePrice: item.lastPrice || null,
        highPrice: item.dayHigh || null,
        lowPrice: item.dayLow || null,
        volume: item.totalTradedVolume || null,
        dataSource: 'NSE_MANUAL',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      priceRecords.push(priceRecord);
      results.processed++;
      
    } catch (error) {
      results.errors.push({
        symbol: item.symbol,
        error: error.message
      });
    }
  }

  // Bulk upsert to database
  if (priceRecords.length > 0) {
    try {
      const bulkResult = await db.StockPrice.bulkCreate(priceRecords, {
        updateOnDuplicate: [
          'openPrice', 
          'closePrice', 
          'highPrice', 
          'lowPrice', 
          'volume', 
          'dataSource', 
          'updatedAt'
        ],
        returning: true
      });

      // Count created vs updated (approximate - Sequelize doesn't provide exact counts)
      results.created = bulkResult.length;
      
    } catch (error) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR, 
        `Bulk price update failed: ${error.message}`
      );
    }
  }

  return {
    summary: {
      totalSubmitted: priceData.length,
      processed: results.processed,
      created: results.created,
      updated: results.updated,
      skipped: results.skipped.length,
      errors: results.errors.length
    },
    details: {
      skipped: results.skipped,
      errors: results.errors
    },
    priceDate: priceDate
  };
};

module.exports = {
  getStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockIndicators,
  getStockNews,
  createStock,
  updateStock,
  deleteStock,
  validateStockDependencies,
  bulkUpdatePrices
};
