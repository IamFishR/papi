/**
 * Stock Update Service - handles batch stock updates from external APIs
 * Manages stock creation, updates, and data synchronization
 */
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const { Stock, Exchange, Sector, Currency, sequelize } = require('../../database/models');

class StockUpdateService {
  constructor() {
    this.batchSize = 50; // Process stocks in batches
    this.defaultExchangeId = null;
    this.defaultCurrencyId = null;
    this.exchangeCache = new Map();
    this.sectorCache = new Map();
    this.currencyCache = new Map();
  }

  /**
   * Initialize service with default values and caches
   */
  async initialize() {
    try {
      await this.loadExchangeCache();
      await this.loadSectorCache();
      await this.loadCurrencyCache();
      
      // Set defaults for NSE and INR
      this.defaultExchangeId = this.getExchangeId('NSE') || 1;
      this.defaultCurrencyId = this.getCurrencyId('INR') || 1;
      
      logger.info('Stock Update Service initialized successfully', {
        defaultExchangeId: this.defaultExchangeId,
        defaultCurrencyId: this.defaultCurrencyId,
        cacheStats: {
          exchanges: this.exchangeCache.size,
          sectors: this.sectorCache.size,
          currencies: this.currencyCache.size
        }
      });
    } catch (error) {
      logger.error('Failed to initialize Stock Update Service:', error);
      throw error;
    }
  }

  /**
   * Load exchange cache
   */
  async loadExchangeCache() {
    const exchanges = await Exchange.findAll();
    this.exchangeCache.clear();
    exchanges.forEach(exchange => {
      this.exchangeCache.set(exchange.code, exchange.id);
      this.exchangeCache.set(exchange.name, exchange.id);
    });
    logger.info(`Loaded ${exchanges.length} exchanges into cache`);
  }

  /**
   * Load sector cache
   */
  async loadSectorCache() {
    const sectors = await Sector.findAll();
    this.sectorCache.clear();
    sectors.forEach(sector => {
      this.sectorCache.set(sector.name, sector.id);
    });
    logger.info(`Loaded ${sectors.length} sectors into cache`);
  }

  /**
   * Load currency cache
   */
  async loadCurrencyCache() {
    const currencies = await Currency.findAll();
    this.currencyCache.clear();
    currencies.forEach(currency => {
      this.currencyCache.set(currency.code, currency.id);
      this.currencyCache.set(currency.name, currency.id);
    });
    logger.info(`Loaded ${currencies.length} currencies into cache`);
  }

  /**
   * Get exchange ID by code or name
   */
  getExchangeId(codeOrName) {
    return this.exchangeCache.get(codeOrName);
  }

  /**
   * Get sector ID by name
   */
  getSectorId(name) {
    return this.sectorCache.get(name);
  }

  /**
   * Get currency ID by code or name
   */
  getCurrencyId(codeOrName) {
    return this.currencyCache.get(codeOrName);
  }

  /**
   * Transform API data to stock model format
   * @param {Object} apiData - Raw API data from NSE
   * @returns {Object} Transformed stock data
   */
  transformApiDataToStock(apiData) {
    try {
      // Handle both index summary and individual stock data
      if (apiData.symbol === 'NIFTY 50' && apiData.identifier === 'NIFTY 50') {
        // This is the index summary, skip it
        return null;
      }

      // Extract company information from meta if available
      const meta = apiData.meta || {};
      const companyName = meta.companyName || apiData.symbol;
      const industry = meta.industry;
      
      const stockData = {
        symbol: apiData.symbol,
        companyName: companyName.substring(0, 100), // Ensure max length
        description: meta.industry || null,
        exchangeId: this.defaultExchangeId,
        sectorId: industry ? this.getSectorId(industry) : null,
        currencyId: this.defaultCurrencyId,
        marketCap: apiData.ffmc || null, // Free float market cap
        peRatio: null, // Not available in this API
        dividendYield: null, // Not available in this API
        beta: null, // Not available in this API
        isActive: true,
        lastUpdated: new Date()
      };

      return stockData;
    } catch (error) {
      logger.error(`Error transforming API data for ${apiData.symbol}:`, error);
      return null;
    }
  }

  /**
   * Extract stock symbols from existing database
   * @returns {Promise<Set>} Set of existing stock symbols
   */
  async getExistingStockSymbols() {
    try {
      const stocks = await Stock.findAll({
        attributes: ['symbol'],
        raw: true
      });
      return new Set(stocks.map(stock => stock.symbol));
    } catch (error) {
      logger.error('Error fetching existing stock symbols:', error);
      throw error;
    }
  }

  /**
   * Process and update stocks from API data
   * @param {Array} apiDataArray - Array of stock data from API
   * @returns {Promise<Object>} Processing results
   */
  async processStockUpdates(apiDataArray) {
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
      if (this.exchangeCache.size === 0) {
        await this.initialize();
      }

      // Get existing stocks for comparison
      const existingSymbols = await this.getExistingStockSymbols();
      
      // Transform API data to stock format
      const stockDataArray = [];
      for (const apiItem of apiDataArray) {
        results.total++;
        
        const stockData = this.transformApiDataToStock(apiItem);
        if (stockData) {
          stockDataArray.push({
            ...stockData,
            isExisting: existingSymbols.has(stockData.symbol)
          });
          results.processed++;
        } else {
          results.skipped++;
        }
      }

      logger.info(`Processing ${stockDataArray.length} stocks (${existingSymbols.size} existing stocks in DB)`);

      // Process in batches
      for (let i = 0; i < stockDataArray.length; i += this.batchSize) {
        const batch = stockDataArray.slice(i, i + this.batchSize);
        const batchResults = await this.processBatch(batch);
        
        results.created += batchResults.created;
        results.updated += batchResults.updated;
        results.errors += batchResults.errors;
        results.errorDetails.push(...batchResults.errorDetails);
      }

      const duration = Date.now() - startTime;
      
      logger.info('Stock update processing completed', {
        ...results,
        duration: `${duration}ms`,
        processingRate: `${Math.round(results.processed / (duration / 1000))} stocks/sec`
      });

      return {
        ...results,
        duration,
        success: true
      };

    } catch (error) {
      logger.error('Error processing stock updates:', error);
      return {
        ...results,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Process a batch of stocks
   * @param {Array} batch - Batch of stock data to process
   * @returns {Promise<Object>} Batch processing results
   */
  async processBatch(batch) {
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: []
    };

    const transaction = await sequelize.transaction();

    try {
      for (const stockData of batch) {
        try {
          const { isExisting, ...dataToSave } = stockData;
          
          if (isExisting) {
            // Update existing stock
            await Stock.update(dataToSave, {
              where: { symbol: stockData.symbol },
              transaction
            });
            results.updated++;
          } else {
            // Create new stock
            await Stock.create(dataToSave, { transaction });
            results.created++;
          }
        } catch (error) {
          results.errors++;
          results.errorDetails.push({
            symbol: stockData.symbol,
            error: error.message
          });
          logger.error(`Error processing stock ${stockData.symbol}:`, error);
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
   * Bulk upsert stocks (create or update)
   * @param {Array} stockDataArray - Array of stock data
   * @returns {Promise<Object>} Upsert results
   */
  async bulkUpsertStocks(stockDataArray) {
    const startTime = Date.now();
    
    try {
      // Use Sequelize bulkCreate with updateOnDuplicate
      const result = await Stock.bulkCreate(stockDataArray, {
        updateOnDuplicate: [
          'companyName',
          'description',
          'sectorId',
          'marketCap',
          'peRatio',
          'dividendYield',
          'beta',
          'isActive',
          'lastUpdated',
          'updatedAt'
        ],
        returning: true
      });

      const duration = Date.now() - startTime;
      
      logger.info(`Bulk upsert completed: ${result.length} stocks processed in ${duration}ms`);
      
      return {
        success: true,
        processed: result.length,
        duration,
        records: result
      };
      
    } catch (error) {
      logger.error('Error in bulk upsert:', error);
      throw error;
    }
  }

  /**
   * Update market cap for specific stocks
   * @param {Array} updates - Array of {symbol, marketCap} objects
   * @returns {Promise<Object>} Update results
   */
  async updateMarketCaps(updates) {
    const results = {
      updated: 0,
      errors: 0,
      errorDetails: []
    };

    try {
      for (const update of updates) {
        try {
          const [updatedCount] = await Stock.update(
            { 
              marketCap: update.marketCap,
              lastUpdated: new Date()
            },
            { 
              where: { symbol: update.symbol }
            }
          );
          
          if (updatedCount > 0) {
            results.updated++;
          }
        } catch (error) {
          results.errors++;
          results.errorDetails.push({
            symbol: update.symbol,
            error: error.message
          });
        }
      }

      logger.info(`Market cap updates completed: ${results.updated} updated, ${results.errors} errors`);
      return results;
      
    } catch (error) {
      logger.error('Error updating market caps:', error);
      throw error;
    }
  }

  /**
   * Get processing statistics
   * @returns {Promise<Object>} Service statistics
   */
  async getStats() {
    try {
      const totalStocks = await Stock.count();
      const activeStocks = await Stock.count({ where: { isActive: true } });
      const recentlyUpdated = await Stock.count({
        where: {
          lastUpdated: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return {
        totalStocks,
        activeStocks,
        inactiveStocks: totalStocks - activeStocks,
        recentlyUpdated,
        cacheStats: {
          exchanges: this.exchangeCache.size,
          sectors: this.sectorCache.size,
          currencies: this.currencyCache.size
        },
        defaultIds: {
          exchangeId: this.defaultExchangeId,
          currencyId: this.defaultCurrencyId
        }
      };
    } catch (error) {
      logger.error('Error getting service stats:', error);
      throw error;
    }
  }

  /**
   * Refresh all caches
   */
  async refreshCaches() {
    logger.info('Refreshing all caches...');
    await this.loadExchangeCache();
    await this.loadSectorCache();
    await this.loadCurrencyCache();
    logger.info('All caches refreshed successfully');
  }
}

// Create singleton instance
const stockUpdateService = new StockUpdateService();

module.exports = stockUpdateService;