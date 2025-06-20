/**
 * Bot Management Service - handles business logic for trading bot operations
 */
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../../core/utils/ApiError');
const logger = require('../../../config/logger');
const { ApiEndpoint } = require('../../../database/models');

// Import bot components
let stockDataScheduler, stockDataWorker;
try {
  stockDataScheduler = require('../../../jobs/schedulers/stockDataScheduler');
  stockDataWorker = require('../../../jobs/workers/stockDataWorker');
} catch (error) {
  logger.error('Failed to load bot components:', error);
}

/**
 * Get comprehensive bot status
 * @returns {Promise<Object>} Bot status information
 */
const getBotStatus = async () => {
  try {
    if (!stockDataScheduler || !stockDataWorker) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot services not available');
    }

    const schedulerStatus = stockDataScheduler.getStatus();
    const workerStatus = stockDataWorker.getStatus();
    const marketStatus = stockDataScheduler.getMarketStatus();

    return {
      scheduler: {
        isRunning: schedulerStatus.isRunning,
        enabled: schedulerStatus.enabled,
        config: schedulerStatus.config,
        jobCount: schedulerStatus.jobCount,
        lastExecution: schedulerStatus.lastExecution
      },
      worker: {
        executionCount: workerStatus.executionCount,
        lastExecution: workerStatus.lastExecution,
        isExecuting: workerStatus.isExecuting,
        stats: workerStatus.stats
      },
      market: {
        isOpen: marketStatus.isOpen,
        currentTime: marketStatus.currentTime,
        nextOpenTime: marketStatus.nextOpenTime,
        nextCloseTime: marketStatus.nextCloseTime,
        timezone: marketStatus.timezone
      },
      systemInfo: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error getting bot status:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve bot status',
      null,
      error.stack
    );
  }
};

/**
 * Start bot services
 * @returns {Promise<Object>} Operation result
 */
const startBot = async () => {
  try {
    if (!stockDataScheduler) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot scheduler not available');
    }

    const currentStatus = stockDataScheduler.getStatus();
    if (currentStatus.isRunning) {
      return {
        success: true,
        message: 'Bot is already running',
        data: { status: 'already_running', ...currentStatus }
      };
    }

    await stockDataScheduler.start();
    logger.info('Trading bot started successfully');

    return {
      success: true,
      message: 'Trading bot started successfully',
      data: { 
        status: 'started',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error starting bot:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to start trading bot',
      null,
      error.stack
    );
  }
};

/**
 * Stop bot services
 * @returns {Promise<Object>} Operation result
 */
const stopBot = async () => {
  try {
    if (!stockDataScheduler) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot scheduler not available');
    }

    const currentStatus = stockDataScheduler.getStatus();
    if (!currentStatus.isRunning) {
      return {
        success: true,
        message: 'Bot is already stopped',
        data: { status: 'already_stopped', ...currentStatus }
      };
    }

    await stockDataScheduler.stop();
    logger.info('Trading bot stopped successfully');

    return {
      success: true,
      message: 'Trading bot stopped successfully',
      data: { 
        status: 'stopped',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error stopping bot:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to stop trading bot',
      null,
      error.stack
    );
  }
};

/**
 * Restart bot services
 * @returns {Promise<Object>} Operation result
 */
const restartBot = async () => {
  try {
    if (!stockDataScheduler) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot scheduler not available');
    }

    await stockDataScheduler.restart();
    logger.info('Trading bot restarted successfully');

    return {
      success: true,
      message: 'Trading bot restarted successfully',
      data: { 
        status: 'restarted',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error restarting bot:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to restart trading bot',
      null,
      error.stack
    );
  }
};

/**
 * Trigger manual job execution
 * @param {string} jobType - Type of job to trigger ('stocks', 'prices', 'all')
 * @returns {Promise<Object>} Operation result
 */
const triggerJob = async (jobType) => {
  try {
    if (!stockDataScheduler || !stockDataWorker) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot services not available');
    }

    if (!jobType || !['stocks', 'prices', 'all'].includes(jobType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid job type. Must be: stocks, prices, or all');
    }

    const startTime = Date.now();
    let result;

    switch (jobType) {
      case 'stocks':
        result = await stockDataWorker.fetchStockData();
        break;
      case 'prices':
        result = await stockDataWorker.fetchPriceData();
        break;
      case 'all':
        result = await stockDataWorker.fetchAllData();
        break;
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid job type');
    }

    const executionTime = Date.now() - startTime;
    logger.info(`Manual job execution completed: ${jobType}`, { executionTime, result });

    return {
      success: true,
      message: `Manual ${jobType} job executed successfully`,
      data: {
        jobType,
        executionTime,
        result,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error(`Error triggering manual job (${jobType}):`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to trigger ${jobType} job`,
      null,
      error.stack
    );
  }
};

/**
 * Get bot performance statistics
 * @returns {Promise<Object>} Performance statistics
 */
const getBotStats = async () => {
  try {
    if (!stockDataScheduler || !stockDataWorker) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot services not available');
    }

    const schedulerStatus = stockDataScheduler.getStatus();
    const workerStatus = stockDataWorker.getStatus();
    const detailedStats = await stockDataWorker.getDetailedStats();

    return {
      overview: {
        totalExecutions: workerStatus.executionCount,
        successRate: workerStatus.stats.successfulExecutions / Math.max(workerStatus.stats.totalExecutions, 1),
        lastExecution: workerStatus.lastExecution,
        uptime: process.uptime()
      },
      scheduler: {
        jobCount: schedulerStatus.jobCount,
        isRunning: schedulerStatus.isRunning,
        enabled: schedulerStatus.enabled
      },
      worker: {
        totalStocksProcessed: workerStatus.stats.totalStocksProcessed,
        totalPricesProcessed: workerStatus.stats.totalPricesProcessed,
        successfulExecutions: workerStatus.stats.successfulExecutions,
        failedExecutions: workerStatus.stats.failedExecutions,
        averageExecutionTime: workerStatus.stats.averageExecutionTime
      },
      detailed: detailedStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting bot statistics:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve bot statistics',
      null,
      error.stack
    );
  }
};

/**
 * Get bot health check
 * @returns {Promise<Object>} Health check results
 */
const getBotHealth = async () => {
  try {
    if (!stockDataWorker) {
      return {
        status: 'unhealthy',
        message: 'Bot worker not available',
        checks: {
          worker: { status: 'failed', message: 'Worker not loaded' },
          scheduler: { status: 'failed', message: 'Scheduler not loaded' }
        }
      };
    }

    const healthCheck = await stockDataWorker.healthCheck();
    
    return {
      status: healthCheck.status,
      message: healthCheck.message,
      checks: healthCheck.services,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error performing health check:', error);
    return {
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Update bot configuration
 * @param {Object} config - Configuration updates
 * @returns {Promise<Object>} Operation result
 */
const updateBotConfig = async (config) => {
  try {
    if (!stockDataScheduler) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot scheduler not available');
    }

    // Validate config
    const validKeys = ['enabled', 'stockInterval', 'priceInterval', 'marketHoursOnly'];
    const invalidKeys = Object.keys(config).filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid configuration keys: ${invalidKeys.join(', ')}`);
    }

    // Update configuration
    const updatedConfig = await stockDataScheduler.updateConfig(config);
    logger.info('Bot configuration updated successfully', config);

    return {
      success: true,
      message: 'Bot configuration updated successfully',
      data: {
        previousConfig: stockDataScheduler.getStatus().config,
        updatedConfig,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error updating bot configuration:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update bot configuration',
      null,
      error.stack
    );
  }
};

/**
 * Get market status
 * @returns {Promise<Object>} Market status information
 */
const getMarketStatus = async () => {
  try {
    if (!stockDataScheduler) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Bot scheduler not available');
    }

    const marketStatus = stockDataScheduler.getMarketStatus();
    
    return {
      ...marketStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting market status:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve market status',
      null,
      error.stack
    );
  }
};

/**
 * Get API endpoints configuration
 * @returns {Promise<Object>} API endpoints list
 */
const getApiEndpoints = async () => {
  try {
    const endpoints = await ApiEndpoint.findAll({
      attributes: ['id', 'url', 'purpose', 'description', 'isActive', 'requestInfo', 'responseInfo', 'createdAt', 'updatedAt'],
      order: [['purpose', 'ASC']]
    });

    return {
      endpoints: endpoints.map(endpoint => ({
        ...endpoint.toJSON(),
        requestInfo: typeof endpoint.requestInfo === 'string' ? JSON.parse(endpoint.requestInfo) : endpoint.requestInfo,
        responseInfo: typeof endpoint.responseInfo === 'string' ? JSON.parse(endpoint.responseInfo) : endpoint.responseInfo
      })),
      total: endpoints.length,
      active: endpoints.filter(e => e.isActive).length,
      inactive: endpoints.filter(e => !e.isActive).length
    };
  } catch (error) {
    logger.error('Error getting API endpoints:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve API endpoints',
      null,
      error.stack
    );
  }
};

/**
 * Update API endpoint
 * @param {number} id - Endpoint ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Operation result
 */
const updateApiEndpoint = async (id, updates) => {
  try {
    const endpoint = await ApiEndpoint.findByPk(id);
    if (!endpoint) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'API endpoint not found');
    }

    // Validate updates
    const allowedFields = ['url', 'purpose', 'description', 'isActive', 'requestInfo', 'responseInfo'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid fields: ${invalidFields.join(', ')}`);
    }

    // Validate JSON fields
    if (updates.requestInfo && typeof updates.requestInfo === 'object') {
      updates.requestInfo = JSON.stringify(updates.requestInfo);
    }
    if (updates.responseInfo && typeof updates.responseInfo === 'object') {
      updates.responseInfo = JSON.stringify(updates.responseInfo);
    }

    const updatedEndpoint = await endpoint.update(updates);
    logger.info(`API endpoint ${id} updated successfully`, updates);

    return {
      success: true,
      message: 'API endpoint updated successfully',
      data: {
        ...updatedEndpoint.toJSON(),
        requestInfo: typeof updatedEndpoint.requestInfo === 'string' ? JSON.parse(updatedEndpoint.requestInfo) : updatedEndpoint.requestInfo,
        responseInfo: typeof updatedEndpoint.responseInfo === 'string' ? JSON.parse(updatedEndpoint.responseInfo) : updatedEndpoint.responseInfo
      }
    };
  } catch (error) {
    logger.error(`Error updating API endpoint ${id}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update API endpoint',
      null,
      error.stack
    );
  }
};

module.exports = {
  getBotStatus,
  startBot,
  stopBot,
  restartBot,
  triggerJob,
  getBotStats,
  getBotHealth,
  updateBotConfig,
  getMarketStatus,
  getApiEndpoints,
  updateApiEndpoint
};