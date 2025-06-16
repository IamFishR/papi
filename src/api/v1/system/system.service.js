/**
 * System service - handles internal operations
 */
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../../core/utils/ApiError');
const logger = require('../../../config/logger');
const alertService = require('../alerts/alert.service');
const notificationService = require('../notifications/notification.service');
const indicatorService = require('../indicators/indicator.service');

/**
 * Process alerts to check conditions and generate notifications
 * @returns {Promise<Object>} Processing results
 */
const processAlerts = async () => {
  try {
    logger.info('Starting alert processing job');
    
    const startTime = Date.now();
    const results = await alertService.processAlerts();
    const endTime = Date.now();
    
    logger.info(`Alert processing completed in ${endTime - startTime}ms`, {
      processedCount: results.processedCount,
      triggeredCount: results.triggeredCount,
      failedCount: results.failedCount
    });
    
    // If there are failed alerts, log them
    if (results.failedCount > 0) {
      results.failedAlerts.forEach(failure => {
        logger.error(`Failed to process alert ${failure.alert.id}: ${failure.error}`);
      });
    }
    
    return {
      success: true,
      message: 'Alert processing completed successfully',
      data: {
        processedCount: results.processedCount,
        triggeredCount: results.triggeredCount,
        failedCount: results.failedCount,
        executionTimeMs: endTime - startTime
      }
    };
  } catch (error) {
    logger.error('Error in alert processing job', { error: error.message, stack: error.stack });
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Alert processing failed',
      null,
      error.stack
    );
  }
};

/**
 * Process notification queue to send pending notifications
 * @returns {Promise<Object>} Processing results
 */
const processNotifications = async () => {
  try {
    logger.info('Starting notification processing job');
    
    const startTime = Date.now();
    const results = await notificationService.processNotificationQueue();
    const endTime = Date.now();
    
    logger.info(`Notification processing completed in ${endTime - startTime}ms`, {
      processedCount: results.processedCount,
      successCount: results.successCount,
      failedCount: results.failedCount
    });
    
    // If there are failed notifications, log them
    if (results.failedCount > 0) {
      results.failedNotifications.forEach(failure => {
        logger.error(`Failed to send notification ${failure.notification.id}: ${failure.error}`);
      });
    }
    
    return {
      success: true,
      message: 'Notification processing completed successfully',
      data: {
        processedCount: results.processedCount,
        successCount: results.successCount,
        failedCount: results.failedCount,
        executionTimeMs: endTime - startTime
      }
    };
  } catch (error) {
    logger.error('Error in notification processing job', { error: error.message, stack: error.stack });
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Notification processing failed',
      null,
      error.stack
    );
  }
};

/**
 * Calculate technical indicators for all stocks
 * @returns {Promise<Object>} Processing results
 */
const calculateIndicators = async () => {
  try {
    logger.info('Starting indicator calculation job');
    
    const startTime = Date.now();
    const results = await indicatorService.processIndicators();
    const endTime = Date.now();
    
    logger.info(`Indicator calculation completed in ${endTime - startTime}ms`, {
      processedCount: results.processedCount,
      successCount: results.successCount,
      failedCount: results.failedCount
    });
    
    // If there are failed calculations, log them
    if (results.failedCount > 0) {
      results.failedCalculations.forEach(failure => {
        logger.error(`Failed to calculate indicators for stock ${failure.stock.symbol}: ${failure.error}`);
      });
    }
    
    return {
      success: true,
      message: 'Indicator calculation completed successfully',
      data: {
        processedCount: results.processedCount,
        successCount: results.successCount,
        failedCount: results.failedCount,
        executionTimeMs: endTime - startTime
      }
    };
  } catch (error) {
    logger.error('Error in indicator calculation job', { error: error.message, stack: error.stack });
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Indicator calculation failed',
      null,
      error.stack
    );
  }
};

/**
 * Process all jobs in sequence
 * @returns {Promise<Object>} Processing results
 */
const processAllJobs = async () => {
  try {
    logger.info('Starting full system processing job');
    
    const startTime = Date.now();
    
    // First calculate indicators
    const indicatorResults = await calculateIndicators();
    
    // Then process alerts
    const alertResults = await processAlerts();
    
    // Finally process notifications
    const notificationResults = await processNotifications();
    
    const endTime = Date.now();
    
    logger.info(`Full system processing completed in ${endTime - startTime}ms`);
    
    return {
      success: true,
      message: 'Full system processing completed successfully',
      data: {
        indicators: indicatorResults.data,
        alerts: alertResults.data,
        notifications: notificationResults.data,
        totalExecutionTimeMs: endTime - startTime
      }
    };
  } catch (error) {
    logger.error('Error in full system processing job', { error: error.message, stack: error.stack });
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Full system processing failed',
      null,
      error.stack
    );
  }
};

module.exports = {
  processAlerts,
  processNotifications,
  calculateIndicators,
  processAllJobs
};
