/**
 * Technical Indicators controller
 */
const { StatusCodes } = require('http-status-codes');
const indicatorService = require('./indicator.service');
const indicatorCalculationJob = require('../../../jobs/indicatorCalculationJob');
const logger = require('../../../config/logger');

/**
 * Calculate indicators for a specific stock
 */
const calculateIndicators = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { period } = req.query;
    
    // Calculate all indicators for the stock
    const results = {
      rsi: await indicatorService.calculateRSI(parseInt(stockId), parseInt(period) || 14),
      sma: await indicatorService.calculateSMA(parseInt(stockId), parseInt(period) || 20),
      ema: await indicatorService.calculateEMA(parseInt(stockId), parseInt(period) || 20),
      macd: await indicatorService.calculateMACD(parseInt(stockId)),
      bollingerBands: await indicatorService.calculateBollingerBands(parseInt(stockId), parseInt(period) || 20)
    };
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error calculating indicators:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Process indicators for all stocks using the new automated job
 */
const processAllIndicators = async (req, res) => {
  try {
    logger.info('Manual indicator calculation requested via API');
    
    // Use the new automated calculation job
    const results = await indicatorCalculationJob.runManually();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Indicator calculation completed',
      data: results
    });
  } catch (error) {
    logger.error('Error processing all indicators:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get indicator types
 */
const getIndicatorTypes = async (req, res) => {
  try {
    const db = require('../../../database/models');
    const indicatorTypes = await db.IndicatorType.findAll();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: indicatorTypes
    });
  } catch (error) {
    logger.error('Error getting indicator types:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get indicator conditions
 */
const getIndicatorConditions = async (req, res) => {
  try {
    const db = require('../../../database/models');
    const conditions = await db.IndicatorCondition.findAll();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: conditions
    });
  } catch (error) {
    logger.error('Error getting indicator conditions:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get technical indicators data for a stock
 */
const getStockIndicators = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { indicator, period, limit = 50 } = req.query;
    
    const db = require('../../../database/models');
    const whereConditions = { stockId: parseInt(stockId) };
    
    if (indicator) {
      const indicatorType = await db.IndicatorType.findOne({
        where: { name: indicator }
      });
      if (indicatorType) {
        whereConditions.indicatorTypeId = indicatorType.id;
      }
    }
    
    if (period) {
      whereConditions.timePeriod = parseInt(period);
    }
    
    const indicators = await db.TechnicalIndicator.findAll({
      where: whereConditions,
      include: [
        { model: db.IndicatorType, as: 'indicatorType' },
        { model: db.Stock, as: 'stock', attributes: ['symbol', 'company_name'] }
      ],
      order: [['calculation_date', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: indicators
    });
  } catch (error) {
    logger.error('Error getting stock indicators:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get calculation status and job status
 */
const getCalculationStatus = async (req, res) => {
  try {
    // Get today's calculation summary
    const summary = await indicatorCalculationJob.getCalculationSummary();
    
    // Get total indicator count
    const db = require('../../../database/models');
    const totalIndicators = await db.TechnicalIndicator.count();
    
    // Get last calculation time
    const lastCalculation = await db.TechnicalIndicator.findOne({
      order: [['calculation_date', 'DESC']],
      attributes: ['calculation_date']
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        isRunning: indicatorCalculationJob.isRunning,
        todaysSummary: summary,
        totalIndicators,
        lastCalculation: lastCalculation?.calculation_date,
        nextScheduledRun: '16:00 IST (daily, weekdays only)'
      }
    });
  } catch (error) {
    logger.error('Error fetching calculation status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch calculation status'
    });
  }
};

/**
 * Clean up old indicator data
 */
const cleanupOldIndicators = async (req, res) => {
  try {
    const { days = 365 } = req.query;
    
    const deletedCount = await indicatorCalculationJob.cleanupOldIndicators();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Cleaned up ${deletedCount} old indicators`,
      data: { deletedCount }
    });
  } catch (error) {
    logger.error('Error cleaning up indicators:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to cleanup indicators'
    });
  }
};

module.exports = {
  calculateIndicators,
  processAllIndicators,
  getIndicatorTypes,
  getIndicatorConditions,
  getStockIndicators,
  getCalculationStatus,
  cleanupOldIndicators
};