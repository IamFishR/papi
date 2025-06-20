/**
 * Price Service - handles stock price history updates and management
 * Manages bulk price inserts, updates, and historical data operations
 */
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const { Stock, StockPrice, sequelize } = require('../../database/models');

class PriceService {
  constructor() {
    this.batchSize = 100; // Process prices in batches
    this.stockSymbolCache = new Map(); // Cache stock symbols to IDs
  }

  /**
   * Initialize service and load stock cache
   */
  async initialize() {
    try {
      await this.loadStockCache();
      logger.info('Price Service initialized successfully', {
        cachedStocks: this.stockSymbolCache.size
      });
    } catch (error) {
      logger.error('Failed to initialize Price Service:', error);
      throw error;
    }
  }

  /**
   * Load stock symbol to ID cache
   */
  async loadStockCache() {
    const stocks = await Stock.findAll({
      attributes: ['id', 'symbol'],
      where: { isActive: true },
      raw: true
    });
    
    this.stockSymbolCache.clear();
    stocks.forEach(stock => {
      this.stockSymbolCache.set(stock.symbol, stock.id);
    });
    
    logger.info(`Loaded ${stocks.length} active stocks into cache`);
  }

  /**
   * Get stock ID by symbol
   * @param {string} symbol - Stock symbol
   * @returns {number|null} Stock ID or null if not found
   */
  getStockId(symbol) {
    return this.stockSymbolCache.get(symbol) || null;
  }

  /**
   * Transform API data to price format
   * @param {Object} apiData - Raw API stock data
   * @param {Date} priceDate - Date for the price data
   * @returns {Object|null} Transformed price data
   */
  transformApiDataToPrice(apiData, priceDate = new Date()) {
    try {
      // Skip index data
      if (apiData.symbol === 'NIFTY 50' && apiData.identifier === 'NIFTY 50') {
        return null;
      }

      const stockId = this.getStockId(apiData.symbol);
      if (!stockId) {
        logger.warn(`Stock ID not found for symbol: ${apiData.symbol}`);
        return null;
      }

      // Convert date to YYYY-MM-DD format for DATEONLY field
      const dateOnly = priceDate.toISOString().split('T')[0];

      const priceData = {
        stockId: stockId,
        priceDate: dateOnly,
        openPrice: apiData.open || null,
        closePrice: apiData.lastPrice || apiData.close || null,
        highPrice: apiData.dayHigh || apiData.high || null,
        lowPrice: apiData.dayLow || apiData.low || null,
        adjustedClose: null, // Not available in NSE API
        volume: apiData.totalTradedVolume || null,
        dataSource: 'NSE_API'
      };

      // Validate required fields
      if (!priceData.closePrice) {
        logger.warn(`No close price available for ${apiData.symbol}`);
        return null;
      }

      return priceData;
    } catch (error) {
      logger.error(`Error transforming price data for ${apiData.symbol}:`, error);
      return null;
    }
  }

  /**
   * Check if price data exists for a specific date and stock
   * @param {number} stockId - Stock ID
   * @param {string} priceDate - Price date (YYYY-MM-DD)
   * @returns {Promise<boolean>} True if price exists
   */
  async priceExists(stockId, priceDate) {
    try {
      const count = await StockPrice.count({
        where: {
          stockId: stockId,
          priceDate: priceDate
        }
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking price existence for stock ${stockId}:`, error);
      return false;
    }
  }

  /**
   * Get existing price dates for today
   * @returns {Promise<Set>} Set of existing price date-stock combinations
   */
  async getTodayExistingPrices() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingPrices = await StockPrice.findAll({
        attributes: ['stockId', 'priceDate'],
        where: {
          priceDate: today
        },
        raw: true
      });

      return new Set(existingPrices.map(p => `${p.stockId}-${p.priceDate}`));
    } catch (error) {
      logger.error('Error fetching existing prices:', error);
      return new Set();
    }
  }

  /**
   * Process and save price updates from API data
   * @param {Array} apiDataArray - Array of stock data from API
   * @param {Date} priceDate - Date for the price data (defaults to today)
   * @returns {Promise<Object>} Processing results
   */
  async processPriceUpdates(apiDataArray, priceDate = new Date()) {
    if (!Array.isArray(apiDataArray)) {
      throw new Error('API data must be an array');
    }

    const startTime = Date.now();
    const results = {
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };

    try {
      // Ensure service is initialized
      if (this.stockSymbolCache.size === 0) {
        await this.initialize();
      }

      // Get existing prices for today to avoid duplicates
      const existingPrices = await this.getTodayExistingPrices();
      const dateString = priceDate.toISOString().split('T')[0];

      // Transform API data to price format
      const priceDataArray = [];
      for (const apiItem of apiDataArray) {
        results.total++;
        
        const priceData = this.transformApiDataToPrice(apiItem, priceDate);
        if (priceData) {
          const key = `${priceData.stockId}-${priceData.priceDate}`;
          priceData.isExisting = existingPrices.has(key);
          priceDataArray.push(priceData);
          results.processed++;
        } else {
          results.skipped++;
        }
      }

      logger.info(`Processing ${priceDataArray.length} price records for date ${dateString}`);

      // Process in batches
      for (let i = 0; i < priceDataArray.length; i += this.batchSize) {
        const batch = priceDataArray.slice(i, i + this.batchSize);
        const batchResults = await this.processPriceBatch(batch);
        
        results.created += batchResults.created;
        results.updated += batchResults.updated;
        results.errors += batchResults.errors;
        results.errorDetails.push(...batchResults.errorDetails);
      }

      const duration = Date.now() - startTime;
      
      logger.info('Price update processing completed', {
        ...results,
        duration: `${duration}ms`,
        date: dateString
      });

      return {
        ...results,
        duration,
        priceDate: dateString,
        success: true
      };

    } catch (error) {
      logger.error('Error processing price updates:', error);
      return {
        ...results,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Process a batch of price data
   * @param {Array} batch - Batch of price data to process
   * @returns {Promise<Object>} Batch processing results
   */
  async processPriceBatch(batch) {
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: []
    };

    const transaction = await sequelize.transaction();

    try {
      for (const priceData of batch) {
        try {
          const { isExisting, ...dataToSave } = priceData;
          
          if (isExisting) {
            // Update existing price
            await StockPrice.update(dataToSave, {
              where: {
                stockId: priceData.stockId,
                priceDate: priceData.priceDate
              },
              transaction
            });
            results.updated++;
          } else {
            // Create new price
            await StockPrice.create(dataToSave, { transaction });
            results.created++;
          }
        } catch (error) {
          results.errors++;
          results.errorDetails.push({
            stockId: priceData.stockId,
            priceDate: priceData.priceDate,
            error: error.message
          });
          logger.error(`Error processing price for stock ${priceData.stockId}:`, error);
        }
      }

      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return results;
  }

  /**
   * Bulk upsert price data (create or update)
   * @param {Array} priceDataArray - Array of price data
   * @returns {Promise<Object>} Upsert results
   */
  async bulkUpsertPrices(priceDataArray) {
    const startTime = Date.now();
    
    try {
      // Use Sequelize bulkCreate with updateOnDuplicate
      const result = await StockPrice.bulkCreate(priceDataArray, {
        updateOnDuplicate: [
          'openPrice',
          'closePrice',
          'highPrice',
          'lowPrice',
          'adjustedClose',
          'volume',
          'dataSource',
          'updatedAt'
        ],
        returning: true
      });

      const duration = Date.now() - startTime;
      
      logger.info(`Bulk price upsert completed: ${result.length} prices processed in ${duration}ms`);
      
      return {
        success: true,
        processed: result.length,
        duration,
        records: result
      };
      
    } catch (error) {
      logger.error('Error in bulk price upsert:', error);
      throw error;
    }
  }

  /**
   * Get latest prices for all stocks
   * @param {number} limit - Limit number of results
   * @returns {Promise<Array>} Latest stock prices
   */
  async getLatestPrices(limit = 50) {
    try {
      const latestPrices = await StockPrice.findAll({
        include: [{
          model: Stock,
          as: 'stock',
          attributes: ['symbol', 'companyName']
        }],
        order: [['priceDate', 'DESC'], ['updated_at', 'DESC']],
        limit: limit
      });

      return latestPrices.map(price => ({
        symbol: price.stock.symbol,
        companyName: price.stock.companyName,
        priceDate: price.priceDate,
        closePrice: parseFloat(price.closePrice),
        volume: price.volume ? parseFloat(price.volume) : null,
        dataSource: price.dataSource
      }));
    } catch (error) {
      logger.error('Error fetching latest prices:', error);
      throw error;
    }
  }

  /**
   * Get price history for a specific stock
   * @param {string} symbol - Stock symbol
   * @param {number} days - Number of days of history
   * @returns {Promise<Array>} Price history
   */
  async getPriceHistory(symbol, days = 30) {
    try {
      const stockId = this.getStockId(symbol);
      if (!stockId) {
        throw new Error(`Stock not found: ${symbol}`);
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const prices = await StockPrice.findAll({
        where: {
          stockId: stockId,
          priceDate: {
            [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
          }
        },
        order: [['priceDate', 'ASC']]
      });

      return prices.map(price => ({
        priceDate: price.priceDate,
        openPrice: price.openPrice ? parseFloat(price.openPrice) : null,
        closePrice: parseFloat(price.closePrice),
        highPrice: price.highPrice ? parseFloat(price.highPrice) : null,
        lowPrice: price.lowPrice ? parseFloat(price.lowPrice) : null,
        volume: price.volume ? parseFloat(price.volume) : null
      }));
    } catch (error) {
      logger.error(`Error fetching price history for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get service statistics
   * @returns {Promise<Object>} Service statistics
   */
  async getStats() {
    try {
      const totalPrices = await StockPrice.count();
      const uniqueStocks = await StockPrice.count({
        distinct: true,
        col: 'stock_id'
      });
      
      const today = new Date().toISOString().split('T')[0];
      const todayPrices = await StockPrice.count({
        where: { priceDate: today }
      });

      const latestPriceDate = await StockPrice.max('priceDate');
      
      return {
        totalPrices,
        uniqueStocksWithPrices: uniqueStocks,
        todayPrices,
        latestPriceDate,
        cachedStocks: this.stockSymbolCache.size,
        batchSize: this.batchSize
      };
    } catch (error) {
      logger.error('Error getting price service stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old price data (older than specified days)
   * @param {number} retentionDays - Number of days to retain
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupOldPrices(retentionDays = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const deletedCount = await StockPrice.destroy({
        where: {
          priceDate: {
            [Op.lt]: cutoffDateString
          }
        }
      });

      logger.info(`Cleaned up ${deletedCount} price records older than ${cutoffDateString}`);
      
      return {
        success: true,
        deletedCount,
        cutoffDate: cutoffDateString,
        retentionDays
      };
    } catch (error) {
      logger.error('Error cleaning up old prices:', error);
      throw error;
    }
  }

  /**
   * Refresh stock cache
   */
  async refreshStockCache() {
    logger.info('Refreshing stock cache...');
    await this.loadStockCache();
    logger.info('Stock cache refreshed successfully');
  }
}

// Create singleton instance
const priceService = new PriceService();

module.exports = priceService;