/**
 * Stock service - handles business logic for stock operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');
const { logger } = require('sequelize/lib/utils/logger');

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

  // Apply detailed sector filter
  if (filter.detailedSector) {
    whereConditions.detailedSectorId = filter.detailedSector;
  }

  // Apply ISIN filter
  if (filter.isin) {
    whereConditions.isin = filter.isin;
  }

  // Apply FNO enabled filter
  if (filter.fnoEnabled !== undefined) {
    whereConditions.isFnoEnabled = filter.fnoEnabled;
  }

  // Apply trading status filter
  if (filter.tradingStatus) {
    whereConditions.tradingStatus = filter.tradingStatus;
  }

  // Apply surveillance stage filter
  if (filter.surveillanceStage) {
    whereConditions.surveillanceStage = filter.surveillanceStage;
  }

  // Execute query with includes for related data
  const { rows, count } = await db.Stock.findAndCountAll({
    where: whereConditions,
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' },
      { model: db.DetailedSector, as: 'detailedSector' }
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
  const stock = await db.Stock.findByPk(id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' },
      { model: db.DetailedSector, as: 'detailedSector' }
    ]
  });

  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Calculate date for one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Get ticker prices for past month
  const tickerPrices = await db.TradingTicker.findAll({
    where: {
      stockId: id,
      lastUpdateTime: {
        [Op.gte]: oneMonthAgo
      }
    },
    order: [['lastUpdateTime', 'DESC']],
    limit: 1000 // Reasonable limit to prevent excessive data
  });

  // Attach ticker prices to stock response
  const stockWithTicker = stock.toJSON();
  stockWithTicker.tickerPrices = tickerPrices;

  return stockWithTicker;
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
 * Check if detailed sector exists and is active
 * @param {number} sectorDetailedId - Detailed Sector ID to validate
 * @param {Object} transaction - Database transaction
 * @returns {Promise<boolean>} True if detailed sector exists and is active
 */
const validateDetailedSectorExists = async (sectorDetailedId, transaction = null) => {
  if (!sectorDetailedId) return true; // null is allowed for optional fields

  const detailedSector = await db.DetailedSector.findOne({
    where: {
      id: sectorDetailedId,
      isActive: true
    },
    transaction
  });

  return !!detailedSector;
};

/**
 * Validate all foreign key dependencies
 * @param {Object} stockData - Stock data with foreign keys
 * @returns {Promise<void>} Throws error if any dependency is invalid
 */
const validateStockDependencies = async (stockData, transaction = null) => {
  const { exchangeId, currencyId, detailedSectorId } = stockData;

  // Validate exchange (required)
  if (exchangeId && !(await validateExchangeExists(exchangeId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid exchange ID. Exchange not found or inactive.');
  }

  // Validate detailed sector (optional)
  if (detailedSectorId && !(await validateDetailedSectorExists(detailedSectorId, transaction))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid detailed sector ID. Detailed sector not found or inactive.');
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

  // Check if ISIN already exists (if provided)
  if (stockData.isin) {
    const existingISIN = await db.Stock.findOne({
      where: { isin: stockData.isin }
    });

    if (existingISIN) {
      throw new ApiError(StatusCodes.CONFLICT, 'Stock with this ISIN already exists');
    }
  }

  // Create the stock
  const stock = await db.Stock.create(stockData);

  // Return stock with associations
  return await db.Stock.findByPk(stock.id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' },
      { model: db.DetailedSector, as: 'detailedSector' }
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

  // Check if ISIN is being updated and already exists
  if (updateData.isin && updateData.isin !== stock.isin) {
    const existingISIN = await db.Stock.findOne({
      where: {
        isin: updateData.isin,
        id: { [Op.ne]: id } // Exclude current stock
      }
    });

    if (existingISIN) {
      throw new ApiError(StatusCodes.CONFLICT, 'Stock with this ISIN already exists');
    }
  }

  // Update the stock
  await stock.update(updateData);

  // Return updated stock with associations
  return await db.Stock.findByPk(id, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' },
      { model: db.DetailedSector, as: 'detailedSector' }
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
 * Get stock by ISIN
 * @param {string} isin - Stock ISIN
 * @returns {Promise<Object>} Stock with related data
 */
const getStockByISIN = async (isin) => {
  const stock = await db.Stock.findOne({
    where: {
      isin: isin,
      isActive: true
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' },
      { model: db.DetailedSector, as: 'detailedSector' }
    ]
  });

  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  return stock;
};

/**
 * Get stocks by detailed sector
 * @param {number} sectorDetailedId - Detailed sector ID
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated stocks list for detailed sector
 */
const getStocksByDetailedSector = async (sectorDetailedId, options = {}) => {
  const { limit = 50, page = 1, sortBy = 'symbol', sortOrder = 'ASC' } = options;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.Stock.findAndCountAll({
    where: {
      sectorDetailedId: sectorDetailedId,
      isActive: true
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.DetailedSector, as: 'detailedSector' },
      { model: db.Currency, as: 'currency' }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

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
 * Get FNO enabled stocks
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated list of FNO enabled stocks
 */
const getFNOEnabledStocks = async (options = {}) => {
  const { limit = 50, page = 1, sortBy = 'symbol', sortOrder = 'ASC' } = options;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.Stock.findAndCountAll({
    where: {
      isFnoEnabled: true,
      isActive: true
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.DetailedSector, as: 'detailedSector' },
      { model: db.Currency, as: 'currency' }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

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
 * Get stocks by surveillance stage
 * @param {string} surveillanceStage - Surveillance stage
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated list of stocks in surveillance stage
 */
const getStocksBySurveillanceStage = async (surveillanceStage, options = {}) => {
  const { limit = 50, page = 1, sortBy = 'symbol', sortOrder = 'ASC' } = options;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.Stock.findAndCountAll({
    where: {
      surveillanceStage: surveillanceStage,
      isActive: true
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.DetailedSector, as: 'detailedSector' },
      { model: db.Currency, as: 'currency' }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

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
 * Update stock with Indian-specific fields
 * @param {number} stockId - Stock ID
 * @param {Object} indianData - Indian-specific data to update
 * @returns {Promise<Object>} Updated stock
 */
const updateStockIndianFields = async (stockId, indianData) => {
  const stock = await db.Stock.findByPk(stockId);

  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Validate detailed sector if provided
  if (indianData.sectorDetailedId) {
    await validateStockDependencies({ sectorDetailedId: indianData.sectorDetailedId });
  }

  // Update the stock with Indian fields
  await stock.update(indianData);

  // Return updated stock with associations
  return await db.Stock.findByPk(stockId, {
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.DetailedSector, as: 'detailedSector' },
      { model: db.Currency, as: 'currency' }
    ]
  });
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

      // Transform NSE data to our price format (enhanced for Indian market)
      const priceRecord = {
        stockId: stockId,
        priceDate: priceDate,
        openPrice: item.open || null,
        closePrice: item.lastPrice || null,
        highPrice: item.dayHigh || null,
        lowPrice: item.dayLow || null,
        lastPrice: item.lastPrice || null,
        previousClose: item.previousClose || null,
        priceChange: item.change || null,
        priceChangePercent: item.pChange || null,
        volume: item.totalTradedVolume || null,
        vwap: item.averagePrice || null,
        basePrice: item.basePrice || null,
        lowerCircuitPrice: item.lowerCP || null,
        upperCircuitPrice: item.upperCP || null,
        intradayMin: item.intraDayHighLow?.min || null,
        intradayMax: item.intraDayHighLow?.max || null,
        weekHigh: item.weekHighLow?.max || null,
        weekLow: item.weekHighLow?.min || null,
        weekHighDate: item.weekHighLow?.maxDate || null,
        weekLowDate: item.weekHighLow?.minDate || null,
        sessionType: item.sessionType || 'Regular',
        marketType: item.marketType || 'NM',
        series: item.series || 'EQ',
        priceBand: item.priceBand || null,
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
          'lastPrice',
          'previousClose',
          'priceChange',
          'priceChangePercent',
          'volume',
          'vwap',
          'basePrice',
          'lowerCircuitPrice',
          'upperCircuitPrice',
          'intradayMin',
          'intradayMax',
          'weekHigh',
          'weekLow',
          'weekHighDate',
          'weekLowDate',
          'sessionType',
          'marketType',
          'series',
          'priceBand',
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

/**
 * Get NSE exchange ID from database
 * @returns {Promise<number>} NSE exchange ID
 */
const getNSEExchangeId = async () => {
  const nseExchange = await db.Exchange.findOne({
    where: {
      code: 'NSE',
      isActive: true
    }
  });

  if (!nseExchange) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'NSE exchange not found in database');
  }

  return nseExchange.id;
};

/**
 * Get INR currency ID from database
 * @returns {Promise<number>} INR currency ID
 */
const getINRCurrencyId = async () => {
  const inrCurrency = await db.Currency.findOne({
    where: {
      code: 'INR',
      isActive: true
    }
  });

  if (!inrCurrency) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'INR currency not found in database');
  }

  return inrCurrency.id;
};

/**
 * Find or create detailed sector based on industry info
 * @param {Object} industryInfo - Industry information with macro, sector, industry, basicIndustry
 * @param {Object} transaction - Database transaction
 * @returns {Promise<Object>} DetailedSector record
 */
const findOrCreateDetailedSector = async (industryInfo, transaction = null) => {
  if (!industryInfo || !industryInfo.macro || !industryInfo.sector || !industryInfo.industry || !industryInfo.basicIndustry) {
    return null;
  }

  // Create a unique code from the basic industry
  const code = industryInfo.basicIndustry
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // Try to find existing detailed sector by code
  let detailedSector = await db.DetailedSector.findOne({
    where: { code: code },
    transaction
  });

  if (!detailedSector) {
    // Create new detailed sector
    detailedSector = await db.DetailedSector.create({
      macroSector: industryInfo.macro,
      sector: industryInfo.sector, 
      industry: industryInfo.industry,
      basicIndustry: industryInfo.basicIndustry,
      code: code,
      description: `${industryInfo.macro} > ${industryInfo.sector} > ${industryInfo.industry} > ${industryInfo.basicIndustry}`,
      isActive: true
    }, { transaction });
  }

  return detailedSector;
};

/**
 * Process complete market data - strategically reusing existing validations and services
 * @param {Object} data - Complete market data object
 * @returns {Promise<Object>} Processing result with all created/updated entities
 */
const processCompleteMarketData = async (data) => {
  const { stockInfo, priceInfo, preMarketData, preMarketOrders, valuationMetrics, indexMemberships, industryInfo } = data;

  // Use database transaction to ensure atomicity
  const transaction = await db.sequelize.transaction();

  try {
    let result = {
      stock: null,
      priceData: null,
      additionalData: {
        preMarketProcessed: false,
        valuationProcessed: false,
        indexMembershipsProcessed: 0
      },
      summary: {
        created: false,
        updated: false
      }
    };

    // Step 1: Handle stock creation/update using existing createStock/updateStock logic
    // Dynamically resolve NSE exchange ID and INR currency ID if not provided or invalid
    let validExchangeId = stockInfo.exchange_id;
    let validCurrencyId = stockInfo.currency_id;

    // If exchange_id is not provided or doesn't exist, get NSE exchange ID
    if (!validExchangeId || !(await validateExchangeExists(validExchangeId))) {
      validExchangeId = await getNSEExchangeId();
    }

    // If currency_id is not provided or doesn't exist, get INR currency ID
    if (!validCurrencyId || !(await validateCurrencyExists(validCurrencyId))) {
      validCurrencyId = await getINRCurrencyId();
    }

    // Handle detailed sector - either from stockInfo.sector_detailed_id or industryInfo
    let detailedSectorId = stockInfo.sector_detailed_id;
    
    // If industryInfo is provided, find or create detailed sector
    if (industryInfo) {
      const detailedSector = await findOrCreateDetailedSector(industryInfo, transaction);
      if (detailedSector) {
        detailedSectorId = detailedSector.id;
        result.additionalData.detailedSectorProcessed = true;
        result.additionalData.detailedSectorCreated = detailedSector.isNewRecord !== false;
      }
    }

    // Transform field names from snake_case to camelCase for existing validation
    const stockDataForValidation = {
      symbol: stockInfo.symbol,
      companyName: stockInfo.company_name,
      description: stockInfo.description,
      exchangeId: validExchangeId,
      detailedSectorId: detailedSectorId,
      currencyId: validCurrencyId,
      isin: stockInfo.isin,
      faceValue: stockInfo.face_value,
      issuedSize: stockInfo.issued_size,
      listingDate: stockInfo.listing_date,
      isFnoEnabled: stockInfo.is_fno_enabled,
      isCasEnabled: stockInfo.is_cas_enabled,
      isSlbEnabled: stockInfo.is_slb_enabled,
      isDebtSec: stockInfo.is_debt_sec,
      isEtfSec: stockInfo.is_etf_sec,
      isDelisted: stockInfo.is_delisted,
      isSuspended: stockInfo.is_suspended,
      isMunicipalBond: stockInfo.is_municipal_bond,
      isHybridSymbol: stockInfo.is_hybrid_symbol,
      isTop10: stockInfo.is_top10,
      identifier: stockInfo.identifier,
      tradingStatus: stockInfo.trading_status,
      tradingSegment: stockInfo.trading_segment,
      boardStatus: stockInfo.board_status,
      classOfShare: stockInfo.class_of_share,
      derivativesAvailable: stockInfo.derivatives_available,
      surveillanceStage: stockInfo.surveillance_stage,
      surveillanceDescription: stockInfo.surveillance_description,
      tickSize: stockInfo.tick_size,
      tempSuspendedSeries: stockInfo.temp_suspended_series,
      activeSeries: stockInfo.active_series,
      debtSeries: stockInfo.debt_series,
      isActive: stockInfo.is_active !== false
    };

    // Validate all dependencies before creating/updating
    await validateStockDependencies(stockDataForValidation, transaction);

    // Check if stock exists by symbol
    let existingStock = await db.Stock.findOne({
      where: { symbol: stockInfo.symbol },
      transaction
    });

    if (existingStock) {
      // Check for symbol/ISIN conflicts before updating
      if (stockDataForValidation.symbol !== existingStock.symbol) {
        const symbolConflict = await db.Stock.findOne({
          where: { 
            symbol: stockDataForValidation.symbol,
            id: { [Op.ne]: existingStock.id }
          },
          transaction
        });
        if (symbolConflict) {
          throw new ApiError(StatusCodes.CONFLICT, 'Stock with this symbol already exists');
        }
      }

      if (stockDataForValidation.isin && stockDataForValidation.isin !== existingStock.isin) {
        const isinConflict = await db.Stock.findOne({
          where: { 
            isin: stockDataForValidation.isin,
            id: { [Op.ne]: existingStock.id }
          },
          transaction
        });
        if (isinConflict) {
          throw new ApiError(StatusCodes.CONFLICT, 'Stock with this ISIN already exists');
        }
      }

      // Update existing stock within transaction
      await existingStock.update(stockDataForValidation, { transaction });
      result.stock = await db.Stock.findByPk(existingStock.id, {
        include: [
          { model: db.Exchange, as: 'exchange' },
          { model: db.Currency, as: 'currency' },
          { model: db.DetailedSector, as: 'detailedSector' }
        ],
        transaction
      });
      result.summary.updated = true;
    } else {
      // Check for symbol/ISIN conflicts before creating
      if (stockDataForValidation.symbol) {
        const symbolConflict = await db.Stock.findOne({
          where: { symbol: stockDataForValidation.symbol },
          transaction
        });
        if (symbolConflict) {
          throw new ApiError(StatusCodes.CONFLICT, 'Stock with this symbol already exists');
        }
      }

      if (stockDataForValidation.isin) {
        const isinConflict = await db.Stock.findOne({
          where: { isin: stockDataForValidation.isin },
          transaction
        });
        if (isinConflict) {
          throw new ApiError(StatusCodes.CONFLICT, 'Stock with this ISIN already exists');
        }
      }

      // Create new stock within transaction
      const createdStock = await db.Stock.create(stockDataForValidation, { transaction });
      result.stock = await db.Stock.findByPk(createdStock.id, {
        include: [
          { model: db.Exchange, as: 'exchange' },
          { model: db.Currency, as: 'currency' },
          { model: db.DetailedSector, as: 'detailedSector' }
        ],
        transaction
      });
      result.summary.created = true;
    }

    // Step 2: Handle price data using existing addStockPrices logic pattern
    // Transform price data to match existing StockPrice model
    const priceDataForDB = {
      priceDate: priceInfo.price_date,
      openPrice: priceInfo.open_price,
      closePrice: priceInfo.close_price,
      highPrice: priceInfo.high_price,
      lowPrice: priceInfo.low_price,
      volume: priceInfo.volume,
      dataSource: priceInfo.data_source || 'NSE'
    };

    // Check if price data exists for this date (unique constraint is stock_id + price_date)
    const existingPrice = await db.StockPrice.findOne({
      where: {
        stockId: result.stock.id,
        priceDate: priceInfo.price_date
      },
      transaction
    });

    if (existingPrice) {
      // Update existing price record - merge data intelligently
      const updateData = {
        stockId: result.stock.id,
        priceDate: priceDataForDB.priceDate,
        // Keep existing values if new ones are null/undefined, otherwise use new values
        openPrice: priceDataForDB.openPrice ?? existingPrice.openPrice,
        closePrice: priceDataForDB.closePrice ?? existingPrice.closePrice,
        highPrice: priceDataForDB.highPrice ?? existingPrice.highPrice,
        lowPrice: priceDataForDB.lowPrice ?? existingPrice.lowPrice,
        volume: priceDataForDB.volume ?? existingPrice.volume,
        // Update data source to indicate multiple sources if different
        dataSource: existingPrice.dataSource !== priceDataForDB.dataSource 
          ? `${existingPrice.dataSource},${priceDataForDB.dataSource}`
          : priceDataForDB.dataSource
      };
      
      result.priceData = await existingPrice.update(updateData, { transaction });
      result.summary.priceUpdated = true;
    } else {
      // Use upsert to handle race conditions
      try {
        const [priceRecord, created] = await db.StockPrice.upsert({
          ...priceDataForDB,
          stockId: result.stock.id
        }, {
          transaction,
          returning: true
        });
        
        result.priceData = priceRecord;
        result.summary[created ? 'priceCreated' : 'priceUpdated'] = true;
      } catch (upsertError) {
        // If upsert fails, try one more time to find and update
        const retryExisting = await db.StockPrice.findOne({
          where: {
            stockId: result.stock.id,
            priceDate: priceInfo.price_date
          },
          transaction
        });
        
        if (retryExisting) {
          result.priceData = await retryExisting.update({
            ...priceDataForDB,
            stockId: result.stock.id
          }, { transaction });
          result.summary.priceUpdated = true;
        } else {
          throw upsertError; // Re-throw if we still can't handle it
        }
      }
    }

    // Step 3: Handle additional data using extended StockPrice records or JSON fields
    // Since we don't have separate models for pre-market, valuation, etc., 
    // we'll store them as extended price information or in additional fields

    // For pre-market data, we can create additional price records with different session types
    if (preMarketData) {
      const preMarketPriceData = {
        stockId: result.stock.id,
        priceDate: preMarketData.trading_date,
        openPrice: preMarketData.iep,
        closePrice: preMarketData.final_iep || preMarketData.iep,
        volume: preMarketData.total_traded_volume,
        dataSource: 'NSE_PREMARKET'
      };

      // Use upsert to handle potential duplicates more robustly
      try {
        const [preMarketRecord, created] = await db.StockPrice.upsert(preMarketPriceData, {
          transaction,
          returning: true
        });
        
        result.additionalData.preMarketProcessed = true;
        result.additionalData.preMarketCreated = created;
      } catch (preMarketError) {
        // If upsert fails, try to find and update existing record
        const existingPreMarket = await db.StockPrice.findOne({
          where: {
            stockId: result.stock.id,
            priceDate: preMarketData.trading_date,
            dataSource: 'NSE_PREMARKET'
          },
          transaction
        });

        if (existingPreMarket) {
          await existingPreMarket.update(preMarketPriceData, { transaction });
          result.additionalData.preMarketProcessed = true;
          result.additionalData.preMarketCreated = false;
        } else {
          // Check if there's a conflict with regular price data for same date
          const conflictingPrice = await db.StockPrice.findOne({
            where: {
              stockId: result.stock.id,
              priceDate: preMarketData.trading_date
            },
            transaction
          });

          if (conflictingPrice && conflictingPrice.dataSource !== 'NSE_PREMARKET') {
            // If there's a regular price record for the same date, update it to include pre-market data
            const mergedData = {
              ...preMarketPriceData,
              // Preserve existing regular market data, add pre-market info
              openPrice: preMarketPriceData.openPrice || conflictingPrice.openPrice,
              dataSource: `${conflictingPrice.dataSource},NSE_PREMARKET`
            };
            await conflictingPrice.update(mergedData, { transaction });
            result.additionalData.preMarketProcessed = true;
            result.additionalData.preMarketMerged = true;
          } else {
            throw preMarketError; // Re-throw if we can't handle it
          }
        }
      }
    }

    // For valuation metrics, we can store them in the stock record or create price records with specific flags
    if (valuationMetrics) {
      // Update stock with PE ratio if available
      if (valuationMetrics.symbol_pe) {
        await result.stock.update({
          peRatio: valuationMetrics.symbol_pe
        }, { transaction });
      }
      result.additionalData.valuationProcessed = true;
    }

    // For index memberships, since we don't have a separate model, we'll log them
    // In a real implementation, you'd want to create the index membership models
    if (indexMemberships && indexMemberships.length > 0) {
      // For now, we'll just count them as processed
      // In the future, when index models are created, this would create actual relationships
      result.additionalData.indexMembershipsProcessed = indexMemberships.length;
    }

    await transaction.commit();
    return result;

  } catch (error) {
    await transaction.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to process complete market data: ${error.message}`);
  }
};


/**
 * Bulk insert/update ticker data for multiple stocks
 * @param {Array} tickerData - Array of ticker data objects
 * @returns {Promise<Object>} Processing results with counts of created, updated, and skipped records
 */
const bulkInsertTickerData = async (tickerData) => {
  if (!Array.isArray(tickerData) || tickerData.length === 0) {
    return {
      totalSubmitted: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: [],
      errors: []
    };
  }

  const result = {
    totalSubmitted: tickerData.length,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: [],
    errors: []
  };

  try {
    // Get all unique symbols from ticker data that don't have stockId
    const symbolsToLookup = [...new Set(
      tickerData
        .filter(td => !td.stockId && td.symbol)
        .map(td => td.symbol)
    )];
    
    // Create symbol to stockId mapping for missing stockIds
    let symbolToIdMap = {};
    if (symbolsToLookup.length > 0) {
      const stocks = await db.Stock.findAll({
        where: {
          symbol: {
            [Op.in]: symbolsToLookup
          }
        }
      });
      
      stocks.forEach(stock => {
        symbolToIdMap[stock.symbol] = stock.id;
      });
    }

    // Process ticker data to ensure each item has a valid stockId
    const validTickerData = [];
    tickerData.forEach(td => {
      let stockId = td.stockId;
      
      // If no stockId provided, try to find it by symbol
      if (!stockId && td.symbol && symbolToIdMap[td.symbol]) {
        stockId = symbolToIdMap[td.symbol];
      }
      
      if (stockId) {
        validTickerData.push({
          ...td,
          stockId: stockId,
          // Use the timestamp from the payload if it exists, otherwise use the current time
          lastUpdateTime: td.lastUpdateTime && td.lastUpdateTime !== 'null' && td.lastUpdateTime !== '' 
            ? td.lastUpdateTime 
            : (td.timestamp && td.timestamp !== 'null' && td.timestamp !== '' 
               ? td.timestamp 
               : new Date().toISOString())
        });
      } else {
        // Skip this ticker data if no stockId can be determined
        result.skipped.push({
          symbol: td.symbol || 'unknown',
          reason: 'Stock not found in database'
        });
      }
    });

    if (validTickerData.length === 0) {
      return result;
    }

    // Use bulkCreate to insert new ticker records
    // Each ticker is unique based on stockId + lastUpdateTime
    const processedRecords = await db.TradingTicker.bulkCreate(validTickerData, {
      ignoreDuplicates: true // Skip duplicates instead of updating
    });

    // Count created records (no updates since we only insert)
    result.created = processedRecords.length;
    result.updated = 0; // No updates in ticker data
    result.processed = processedRecords.length;
    
    return result;
  } catch (error) {
    // Log error but don't throw it
    console.error('Error in bulkInsertTickerData:', error);
    
    // Return partial results with error information
    result.errors.push({
      message: error.message,
      stack: error.stack,
      details: 'Column lastUpdateTime cannot be null - ensure each ticker has a timestamp'
    });
    
    return result;
  }
};

module.exports = {
  getStocks,
  getStockById,
  getStockByISIN,
  getStocksByDetailedSector,
  getFNOEnabledStocks,
  getStocksBySurveillanceStage,
  getStockPrices,
  addStockPrices,
  getStockIndicators,
  getStockNews,
  createStock,
  updateStock,
  updateStockIndianFields,
  deleteStock,
  validateStockDependencies,
  validateDetailedSectorExists,
  bulkUpdatePrices,
  processCompleteMarketData,
  getNSEExchangeId,
  getINRCurrencyId,
  findOrCreateDetailedSector,
  bulkInsertTickerData
};
