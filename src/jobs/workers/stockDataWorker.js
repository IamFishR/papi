/**
 * Stock Data Worker - executes data fetching and processing operations
 * Coordinates between NSE service, stock update service, and price service
 */
const logger = require('../../config/logger');
const nseService = require('../../services/external/nseService');
const stockUpdateService = require('../../services/stock/stockUpdateService');
const priceService = require('../../services/stock/priceService');

class StockDataWorker {
  constructor() {
    this.isProcessing = false;
    this.lastExecutionTime = null;
    this.executionCount = 0;
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      lastSuccess: null,
      lastFailure: null,
      totalStocksProcessed: 0,
      totalPricesProcessed: 0
    };
  }

  /**
   * Initialize worker services
   */
  async initialize() {
    try {
      logger.info('Initializing stock data worker...');
      
      // Initialize all services
      await stockUpdateService.initialize();
      await priceService.initialize();
      
      logger.info('Stock data worker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize stock data worker:', error);
      throw error;
    }
  }

  /**
   * Fetch and process stock data from all active endpoints
   * @returns {Promise<Object>} Processing results
   */
  async fetchStockData() {
    if (this.isProcessing) {
      logger.warn('Stock data fetch already in progress, skipping...');
      return { success: false, error: 'Already processing' };
    }

    const executionId = ++this.executionCount;
    const startTime = Date.now();
    
    this.isProcessing = true;
    this.lastExecutionTime = new Date();
    this.stats.totalExecutions++;

    try {
      logger.info(`Starting stock data fetch execution #${executionId}`);

      // Step 1: Fetch data from all active NSE endpoints
      logger.info('Step 1: Fetching data from NSE API endpoints...');
      const nseResults = await nseService.fetchFromAllEndpoints();
      
      if (!nseResults.successful || nseResults.successful.length === 0) {
        throw new Error('No successful data fetches from NSE endpoints');
      }

      logger.info(`Successfully fetched data from ${nseResults.successful.length} endpoints`);

      // Step 2: Process each endpoint's data for stocks
      let totalStocksProcessed = 0;
      const stockResults = [];

      for (const endpointResult of nseResults.successful) {
        try {
          logger.info(`Processing stock data from ${endpointResult.endpoint}...`);
          
          const stockUpdateResult = await stockUpdateService.processStockUpdates(endpointResult.data);
          stockResults.push({
            endpoint: endpointResult.endpoint,
            result: stockUpdateResult
          });
          
          totalStocksProcessed += stockUpdateResult.processed || 0;
          
          logger.info(`Stock processing completed for ${endpointResult.endpoint}`, {
            processed: stockUpdateResult.processed,
            created: stockUpdateResult.created,
            updated: stockUpdateResult.updated,
            errors: stockUpdateResult.errors
          });
          
        } catch (error) {
          logger.error(`Error processing stocks from ${endpointResult.endpoint}:`, error);
          stockResults.push({
            endpoint: endpointResult.endpoint,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      
      // Update statistics
      this.stats.successfulExecutions++;
      this.stats.lastSuccess = new Date();
      this.stats.totalStocksProcessed += totalStocksProcessed;

      const result = {
        success: true,
        executionId,
        duration,
        timestamp: new Date(),
        nseResults: {
          successful: nseResults.successful.length,
          failed: nseResults.failed.length,
          total: nseResults.summary.total
        },
        stockResults,
        totalStocksProcessed,
        summary: {
          endpointsProcessed: nseResults.successful.length,
          stocksProcessed: totalStocksProcessed,
          duration: `${duration}ms`
        }
      };

      logger.info(`Stock data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      logger.error(`Stock data fetch execution #${executionId} failed:`, {
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });

      return {
        success: false,
        executionId,
        duration,
        timestamp: new Date(),
        error: error.message
      };

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Fetch and process price data from all active endpoints
   * @returns {Promise<Object>} Processing results
   */
  async fetchPriceData() {
    if (this.isProcessing) {
      logger.warn('Price data fetch already in progress, skipping...');
      return { success: false, error: 'Already processing' };
    }

    const executionId = ++this.executionCount;
    const startTime = Date.now();
    
    this.isProcessing = true;
    this.lastExecutionTime = new Date();
    this.stats.totalExecutions++;

    try {
      logger.info(`Starting price data fetch execution #${executionId}`);

      // Step 1: Fetch data from all active NSE endpoints
      logger.info('Step 1: Fetching data from NSE API endpoints...');
      const nseResults = await nseService.fetchFromAllEndpoints();
      
      if (!nseResults.successful || nseResults.successful.length === 0) {
        throw new Error('No successful data fetches from NSE endpoints');
      }

      logger.info(`Successfully fetched data from ${nseResults.successful.length} endpoints`);

      // Step 2: Process each endpoint's data for prices
      let totalPricesProcessed = 0;
      const priceResults = [];

      for (const endpointResult of nseResults.successful) {
        try {
          logger.info(`Processing price data from ${endpointResult.endpoint}...`);
          
          const priceUpdateResult = await priceService.processPriceUpdates(endpointResult.data);
          priceResults.push({
            endpoint: endpointResult.endpoint,
            result: priceUpdateResult
          });
          
          totalPricesProcessed += priceUpdateResult.processed || 0;
          
          logger.info(`Price processing completed for ${endpointResult.endpoint}`, {
            processed: priceUpdateResult.processed,
            created: priceUpdateResult.created,
            updated: priceUpdateResult.updated,
            errors: priceUpdateResult.errors
          });
          
        } catch (error) {
          logger.error(`Error processing prices from ${endpointResult.endpoint}:`, error);
          priceResults.push({
            endpoint: endpointResult.endpoint,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      
      // Update statistics
      this.stats.successfulExecutions++;
      this.stats.lastSuccess = new Date();
      this.stats.totalPricesProcessed += totalPricesProcessed;

      const result = {
        success: true,
        executionId,
        duration,
        timestamp: new Date(),
        nseResults: {
          successful: nseResults.successful.length,
          failed: nseResults.failed.length,
          total: nseResults.summary.total
        },
        priceResults,
        totalPricesProcessed,
        summary: {
          endpointsProcessed: nseResults.successful.length,
          pricesProcessed: totalPricesProcessed,
          duration: `${duration}ms`
        }
      };

      logger.info(`Price data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      logger.error(`Price data fetch execution #${executionId} failed:`, {
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });

      return {
        success: false,
        executionId,
        duration,
        timestamp: new Date(),
        error: error.message
      };

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Fetch and process both stock and price data (full data sync)
   * @returns {Promise<Object>} Processing results
   */
  async fetchAllData() {
    if (this.isProcessing) {
      logger.warn('Data fetch already in progress, skipping...');
      return { success: false, error: 'Already processing' };
    }

    const executionId = ++this.executionCount;
    const startTime = Date.now();
    
    this.isProcessing = true;
    this.lastExecutionTime = new Date();
    this.stats.totalExecutions++;

    try {
      logger.info(`Starting full data fetch execution #${executionId}`);

      // Step 1: Fetch data from all active NSE endpoints
      logger.info('Step 1: Fetching data from NSE API endpoints...');
      const nseResults = await nseService.fetchFromAllEndpoints();
      
      if (!nseResults.successful || nseResults.successful.length === 0) {
        throw new Error('No successful data fetches from NSE endpoints');
      }

      logger.info(`Successfully fetched data from ${nseResults.successful.length} endpoints`);

      // Step 2: Process all data (stocks and prices)
      let totalStocksProcessed = 0;
      let totalPricesProcessed = 0;
      const stockResults = [];
      const priceResults = [];

      for (const endpointResult of nseResults.successful) {
        try {
          logger.info(`Processing all data from ${endpointResult.endpoint}...`);
          
          // Process stocks
          const stockUpdateResult = await stockUpdateService.processStockUpdates(endpointResult.data);
          stockResults.push({
            endpoint: endpointResult.endpoint,
            result: stockUpdateResult
          });
          totalStocksProcessed += stockUpdateResult.processed || 0;

          // Process prices
          const priceUpdateResult = await priceService.processPriceUpdates(endpointResult.data);
          priceResults.push({
            endpoint: endpointResult.endpoint,
            result: priceUpdateResult
          });
          totalPricesProcessed += priceUpdateResult.processed || 0;
          
          logger.info(`All data processing completed for ${endpointResult.endpoint}`, {
            stocks: { processed: stockUpdateResult.processed, created: stockUpdateResult.created, updated: stockUpdateResult.updated },
            prices: { processed: priceUpdateResult.processed, created: priceUpdateResult.created, updated: priceUpdateResult.updated }
          });
          
        } catch (error) {
          logger.error(`Error processing data from ${endpointResult.endpoint}:`, error);
          stockResults.push({
            endpoint: endpointResult.endpoint,
            error: error.message
          });
          priceResults.push({
            endpoint: endpointResult.endpoint,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      
      // Update statistics
      this.stats.successfulExecutions++;
      this.stats.lastSuccess = new Date();
      this.stats.totalStocksProcessed += totalStocksProcessed;
      this.stats.totalPricesProcessed += totalPricesProcessed;

      const result = {
        success: true,
        executionId,
        duration,
        timestamp: new Date(),
        nseResults: {
          successful: nseResults.successful.length,
          failed: nseResults.failed.length,
          total: nseResults.summary.total
        },
        stockResults,
        priceResults,
        totalStocksProcessed,
        totalPricesProcessed,
        summary: {
          endpointsProcessed: nseResults.successful.length,
          stocksProcessed: totalStocksProcessed,
          pricesProcessed: totalPricesProcessed,
          duration: `${duration}ms`
        }
      };

      logger.info(`Full data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      logger.error(`Full data fetch execution #${executionId} failed:`, {
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });

      return {
        success: false,
        executionId,
        duration,
        timestamp: new Date(),
        error: error.message
      };

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get worker statistics and status
   * @returns {Object} Worker status and statistics
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      lastExecutionTime: this.lastExecutionTime,
      executionCount: this.executionCount,
      stats: { ...this.stats },
      services: {
        nse: 'available',
        stockUpdate: 'available',
        price: 'available'
      }
    };
  }

  /**
   * Get detailed statistics from all services
   * @returns {Promise<Object>} Detailed service statistics
   */
  async getDetailedStats() {
    try {
      const [nseHealth, stockStats, priceStats] = await Promise.all([
        nseService.getHealthStatus(),
        stockUpdateService.getStats(),
        priceService.getStats()
      ]);

      return {
        worker: this.getStatus(),
        services: {
          nse: nseHealth,
          stockUpdate: stockStats,
          price: priceStats
        },
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error getting detailed stats:', error);
      return {
        worker: this.getStatus(),
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Reset worker statistics
   */
  resetStats() {
    logger.info('Resetting worker statistics');
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      lastSuccess: null,
      lastFailure: null,
      totalStocksProcessed: 0,
      totalPricesProcessed: 0
    };
    this.executionCount = 0;
  }

  /**
   * Health check for the worker
   * @returns {Promise<Object>} Health check result
   */
  async healthCheck() {
    try {
      // Check if services are responsive
      const healthChecks = await Promise.all([
        nseService.getHealthStatus(),
        stockUpdateService.getStats(),
        priceService.getStats()
      ]);

      const allHealthy = healthChecks.every(check => 
        check && !check.error && (check.status === 'healthy' || check.totalStocks !== undefined)
      );

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        isProcessing: this.isProcessing,
        lastExecution: this.lastExecutionTime,
        services: {
          nse: healthChecks[0]?.status || 'unknown',
          stockUpdate: healthChecks[1] ? 'healthy' : 'error',
          price: healthChecks[2] ? 'healthy' : 'error'
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// Create singleton instance
const stockDataWorker = new StockDataWorker();

module.exports = stockDataWorker;