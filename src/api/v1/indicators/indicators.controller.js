/**
 * Technical Indicators controller
 */
const { StatusCodes } = require('http-status-codes');
const indicatorService = require('./indicator.service');
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
 * Process indicators for all stocks
 */
const processAllIndicators = async (req, res) => {
  try {
    const results = await indicatorService.processIndicators();
    
    res.status(StatusCodes.OK).json({
      success: true,
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

module.exports = {
  calculateIndicators,
  processAllIndicators,
  getIndicatorTypes,
  getIndicatorConditions,
  getStockIndicators
};