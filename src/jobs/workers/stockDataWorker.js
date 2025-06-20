/**
 * Stock Data Worker - executes data fetching and processing operations
 * Coordinates between NSE service, stock update service, and price service
 */
const logger = require('../../config/logger');
const nseService = require('../../services/external/nseService');
const stockUpdateService = require('../../services/stock/stockUpdateService');
const priceService = require('../../services/stock/priceService');
const db = require('../../database/models');

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
    
    // Add per-bot-type statistics tracking
    this.botTypeStats = {
      stockBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      },
      priceBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      },
      fullDataBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      }
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
    const startedAt = new Date();
    
    this.isProcessing = true;
    this.lastExecutionTime = startedAt;
    this.stats.totalExecutions++;
    
    // Track this execution for the stockBot type
    this.botTypeStats.stockBot.executions++;
    this.botTypeStats.stockBot.lastExecution = startedAt;

    // Create database execution record
    let executionRecord = null;
    try {
      executionRecord = await db.BotExecution.create({
        executionId,
        botType: 'stockBot',
        executionType: 'stocks',
        status: 'success', // Will be updated based on result
        startedAt,
        isManual: false,
        memoryUsage: process.memoryUsage(),
      });
    } catch (dbError) {
      logger.error('Failed to create execution record:', dbError);
      // Continue execution even if DB logging fails
    }

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

      // Update bot-type specific statistics
      this.botTypeStats.stockBot.executions++;
      this.botTypeStats.stockBot.successes++;
      this.botTypeStats.stockBot.lastExecution = new Date();

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

      // Update database execution record
      if (executionRecord) {
        try {
          await executionRecord.markCompleted('success', {
            endpointsProcessed: nseResults.successful.length,
            stocksProcessed: totalStocksProcessed,
            stocksCreated: stockResults.reduce((sum, r) => sum + (r.result?.created || 0), 0),
            stocksUpdated: stockResults.reduce((sum, r) => sum + (r.result?.updated || 0), 0),
            nseResults: {
              successful: nseResults.successful.length,
              failed: nseResults.failed.length,
              total: nseResults.summary.total
            },
            processingResults: stockResults,
            executionSummary: result.summary,
          });
        } catch (dbError) {
          logger.error('Failed to update execution record:', dbError);
        }
      }

      logger.info(`Stock data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      // Update bot-type specific statistics
      this.botTypeStats.stockBot.executions++;
      this.botTypeStats.stockBot.failures++;
      this.botTypeStats.stockBot.lastExecution = new Date();

      // Update database execution record for failure
      if (executionRecord) {
        try {
          await executionRecord.markFailed(error);
        } catch (dbError) {
          logger.error('Failed to update execution record with error:', dbError);
        }
      }

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
    const startedAt = new Date();
    
    this.isProcessing = true;
    this.lastExecutionTime = startedAt;
    this.stats.totalExecutions++;

    // Create database execution record
    let executionRecord = null;
    try {
      executionRecord = await db.BotExecution.create({
        executionId,
        botType: 'priceBot',
        executionType: 'prices',
        status: 'success', // Will be updated based on result
        startedAt,
        isManual: false,
        memoryUsage: process.memoryUsage(),
      });
    } catch (dbError) {
      logger.error('Failed to create execution record:', dbError);
      // Continue execution even if DB logging fails
    }

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

      // Update bot-type specific statistics
      this.botTypeStats.priceBot.successes++;
      this.botTypeStats.priceBot.lastExecution = new Date();

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

      // Update database execution record
      if (executionRecord) {
        try {
          await executionRecord.markCompleted('success', {
            endpointsProcessed: nseResults.successful.length,
            pricesProcessed: totalPricesProcessed,
            pricesCreated: priceResults.reduce((sum, r) => sum + (r.result?.created || 0), 0),
            pricesUpdated: priceResults.reduce((sum, r) => sum + (r.result?.updated || 0), 0),
            nseResults: {
              successful: nseResults.successful.length,
              failed: nseResults.failed.length,
              total: nseResults.summary.total
            },
            processingResults: priceResults,
            executionSummary: result.summary,
          });
        } catch (dbError) {
          logger.error('Failed to update execution record:', dbError);
        }
      }

      logger.info(`Price data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      // Update bot-type specific statistics
      this.botTypeStats.priceBot.failures++;
      this.botTypeStats.priceBot.lastExecution = new Date();

      // Update database execution record for failure
      if (executionRecord) {
        try {
          await executionRecord.markFailed(error);
        } catch (dbError) {
          logger.error('Failed to update execution record with error:', dbError);
        }
      }

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
    const startedAt = new Date();
    
    this.isProcessing = true;
    this.lastExecutionTime = startedAt;
    this.stats.totalExecutions++;

    // Create database execution record
    let executionRecord = null;
    try {
      executionRecord = await db.BotExecution.create({
        executionId,
        botType: 'fullDataBot',
        executionType: 'all',
        status: 'success', // Will be updated based on result
        startedAt,
        isManual: false,
        memoryUsage: process.memoryUsage(),
      });
    } catch (dbError) {
      logger.error('Failed to create execution record:', dbError);
      // Continue execution even if DB logging fails
    }

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

      // Update bot-type specific statistics
      this.botTypeStats.fullDataBot.successes++;
      this.botTypeStats.fullDataBot.lastExecution = new Date();

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

      // Update database execution record
      if (executionRecord) {
        try {
          await executionRecord.markCompleted('success', {
            endpointsProcessed: nseResults.successful.length,
            stocksProcessed: totalStocksProcessed,
            stocksCreated: stockResults.reduce((sum, r) => sum + (r.result?.created || 0), 0),
            stocksUpdated: stockResults.reduce((sum, r) => sum + (r.result?.updated || 0), 0),
            pricesProcessed: totalPricesProcessed,
            pricesCreated: priceResults.reduce((sum, r) => sum + (r.result?.created || 0), 0),
            pricesUpdated: priceResults.reduce((sum, r) => sum + (r.result?.updated || 0), 0),
            nseResults: {
              successful: nseResults.successful.length,
              failed: nseResults.failed.length,
              total: nseResults.summary.total
            },
            processingResults: { stockResults, priceResults },
            executionSummary: result.summary,
          });
        } catch (dbError) {
          logger.error('Failed to update execution record:', dbError);
        }
      }

      logger.info(`Full data fetch execution #${executionId} completed successfully`, result.summary);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update error statistics
      this.stats.failedExecutions++;
      this.stats.lastFailure = new Date();

      // Update bot-type specific statistics
      this.botTypeStats.fullDataBot.failures++;
      this.botTypeStats.fullDataBot.lastExecution = new Date();

      // Update database execution record for failure
      if (executionRecord) {
        try {
          await executionRecord.markFailed(error);
        } catch (dbError) {
          logger.error('Failed to update execution record with error:', dbError);
        }
      }

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
      botStats: { ...this.botTypeStats },
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
   * Get historical execution data from database
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Historical execution data
   */
  async getHistoricalStats(options = {}) {
    try {
      const { botType = null, days = 30, limit = 100 } = options;
      
      // Get overall statistics
      const stats = await db.BotExecution.getStats({ botType, days });
      
      // Get success rates for each bot type
      const botTypes = ['stockBot', 'priceBot', 'fullDataBot'];
      const successRates = {};
      
      for (const type of botTypes) {
        if (!botType || botType === type) {
          successRates[type] = await db.BotExecution.getSuccessRate(type, days);
        }
      }
      
      // Get recent executions
      const recentExecutions = await db.BotExecution.getRecentExecutions(botType, limit);
      
      // Get execution trends
      const trends = botType ? 
        await db.BotExecution.getExecutionTrends(botType, days) : 
        {};
      
      // Get performance metrics
      const performanceMetrics = {};
      for (const type of botTypes) {
        if (!botType || botType === type) {
          performanceMetrics[type] = await db.BotExecution.getPerformanceMetrics(type, days);
        }
      }
      
      return {
        summary: {
          queryOptions: { botType, days, limit },
          period: `Last ${days} days`,
          timestamp: new Date()
        },
        statistics: stats,
        successRates,
        recentExecutions,
        trends,
        performanceMetrics,
        currentStats: this.getStatus()
      };
    } catch (error) {
      logger.error('Error getting historical stats:', error);
      return {
        error: error.message,
        currentStats: this.getStatus(),
        timestamp: new Date()
      };
    }
  }

  /**
   * Trigger manual job execution with database logging
   * @param {string} jobType - Type of job to trigger ('stocks', 'prices', 'all')
   * @returns {Promise<Object>} Operation result
   */
  async triggerManualJob(jobType) {
    try {
      let result;
      
      switch (jobType) {
        case 'stocks':
          result = await this.fetchStockData();
          if (result.success) {
            // Update the database record to mark as manual
            try {
              await db.BotExecution.update(
                { isManual: true, executionType: 'manual' },
                {
                  where: {
                    executionId: result.executionId,
                    botType: 'stockBot'
                  },
                  order: [['created_at', 'DESC']],
                  limit: 1
                }
              );
            } catch (dbError) {
              logger.error('Failed to mark execution as manual:', dbError);
            }
          }
          break;
        case 'prices':
          result = await this.fetchPriceData();
          if (result.success) {
            try {
              await db.BotExecution.update(
                { isManual: true, executionType: 'manual' },
                {
                  where: {
                    executionId: result.executionId,
                    botType: 'priceBot'
                  },
                  order: [['created_at', 'DESC']],
                  limit: 1
                }
              );
            } catch (dbError) {
              logger.error('Failed to mark execution as manual:', dbError);
            }
          }
          break;
        case 'all':
          result = await this.fetchAllData();
          if (result.success) {
            try {
              await db.BotExecution.update(
                { isManual: true, executionType: 'manual' },
                {
                  where: {
                    executionId: result.executionId,
                    botType: 'fullDataBot'
                  },
                  order: [['created_at', 'DESC']],
                  limit: 1
                }
              );
            } catch (dbError) {
              logger.error('Failed to mark execution as manual:', dbError);
            }
          }
          break;
        default:
          throw new Error('Invalid job type');
      }
      
      return result;
    } catch (error) {
      logger.error('Error in manual job execution:', error);
      throw error;
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

    // Reset per-bot-type statistics
    this.botTypeStats = {
      stockBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      },
      priceBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      },
      fullDataBot: {
        executions: 0,
        successes: 0,
        failures: 0,
        lastExecution: null
      }
    };
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