/**
 * Technical Indicator Controller - handles HTTP requests for indicator operations
 */
const { StatusCodes } = require('http-status-codes');
const indicatorService = require('./indicator.service');
const indicatorCalculationJob = require('../../../jobs/indicatorCalculationJob');
const logger = require('../../../config/logger');
const db = require('../../../database/models');

/**
 * Get available indicator types
 * @route GET /api/v1/indicators/types
 */
const getIndicatorTypes = async (req, res) => {
  try {
    const indicatorTypes = await db.IndicatorType.findAll({
      attributes: ['id', 'name', 'description', 'defaultPeriod']
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: indicatorTypes
    });
  } catch (error) {
    logger.error('Error fetching indicator types:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch indicator types'
    });
  }
};

/**
 * Get available indicator conditions
 * @route GET /api/v1/indicators/conditions
 */
const getIndicatorConditions = async (req, res) => {
  try {
    const conditions = await db.IndicatorCondition.findAll({
      attributes: ['id', 'name', 'description']
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: conditions
    });
  } catch (error) {
    logger.error('Error fetching indicator conditions:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch indicator conditions'
    });
  }
};

/**
 * Calculate indicators for a specific stock
 * @route POST /api/v1/indicators/calculate/:stockId
 */
const calculateIndicatorsForStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { indicators } = req.body; // Array of indicator types to calculate
    
    // Validate stock exists
    const stock = await db.Stock.findByPk(stockId);
    if (!stock) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Stock not found'
      });
    }

    const results = {
      stockId: parseInt(stockId),
      symbol: stock.symbol,
      calculatedIndicators: [],
      errors: []
    };

    // Default indicators if none specified
    const indicatorsToCalculate = indicators || [
      { type: 'RSI', period: 14 },
      { type: 'SMA', period: 20 },
      { type: 'SMA', period: 50 },
      { type: 'SMA', period: 200 },
      { type: 'EMA', period: 12 },
      { type: 'EMA', period: 26 },
      { type: 'MACD', fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      { type: 'bollinger_bands', period: 20 }
    ];

    // Calculate each indicator
    for (const indicatorConfig of indicatorsToCalculate) {
      try {
        let indicator;
        
        switch (indicatorConfig.type) {
          case 'RSI':
            indicator = await indicatorService.calculateRSI(stockId, indicatorConfig.period);
            break;
          case 'SMA':
            indicator = await indicatorService.calculateSMA(stockId, indicatorConfig.period);
            break;
          case 'EMA':
            indicator = await indicatorService.calculateEMA(stockId, indicatorConfig.period);
            break;
          case 'MACD':
            indicator = await indicatorService.calculateMACD(
              stockId, 
              indicatorConfig.fastPeriod || 12,
              indicatorConfig.slowPeriod || 26,
              indicatorConfig.signalPeriod || 9
            );
            break;
          case 'bollinger_bands':
            indicator = await indicatorService.calculateBollingerBands(stockId, indicatorConfig.period);
            break;
          default:
            throw new Error(`Unknown indicator type: ${indicatorConfig.type}`);
        }

        if (indicator) {
          results.calculatedIndicators.push({
            type: indicatorConfig.type,
            period: indicatorConfig.period || indicatorConfig.fastPeriod,
            value: indicator.value,
            parameters: indicator.parameters,
            calculationDate: indicator.calculationDate
          });
        }
      } catch (error) {
        logger.error(`Error calculating ${indicatorConfig.type} for stock ${stockId}:`, error);
        results.errors.push({
          indicator: indicatorConfig.type,
          period: indicatorConfig.period,
          error: error.message
        });
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Error in calculateIndicatorsForStock:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to calculate indicators'
    });
  }
};

/**
 * Get historical indicator data for a stock
 * @route GET /api/v1/indicators/stock/:stockId
 */
const getStockIndicators = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { indicatorType, period, limit = 30 } = req.query;

    // Build query conditions
    const whereConditions = { stockId: parseInt(stockId) };
    
    if (indicatorType) {
      const indicatorTypeRecord = await db.IndicatorType.findOne({
        where: { name: indicatorType }
      });
      if (indicatorTypeRecord) {
        whereConditions.indicatorTypeId = indicatorTypeRecord.id;
      }
    }
    
    if (period) {
      whereConditions.timePeriod = parseInt(period);
    }

    const indicators = await db.TechnicalIndicator.findAll({
      where: whereConditions,
      include: [{
        model: db.IndicatorType,
        as: 'indicatorType',
        attributes: ['name', 'description']
      }],
      order: [['calculation_date', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: indicators.map(indicator => ({
        id: indicator.id,
        type: indicator.indicatorType.name,
        period: indicator.timePeriod,
        value: indicator.value,
        parameters: indicator.parameters,
        calculationDate: indicator.calculationDate,
        signalStrength: indicator.signalStrength,
        isBullish: indicator.isBullish,
        isBearish: indicator.isBearish
      }))
    });

  } catch (error) {
    logger.error('Error fetching stock indicators:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch stock indicators'
    });
  }
};

/**
 * Run manual indicator calculation for all stocks
 * @route POST /api/v1/indicators/calculate-all
 */
const calculateAllIndicators = async (req, res) => {
  try {
    logger.info('Manual indicator calculation requested');
    
    // Run the calculation job manually
    const results = await indicatorCalculationJob.runManually();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Indicator calculation completed',
      data: results
    });

  } catch (error) {
    logger.error('Error in manual indicator calculation:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to calculate indicators',
      error: error.message
    });
  }
};

/**
 * Get calculation summary and job status
 * @route GET /api/v1/indicators/status
 */
const getCalculationStatus = async (req, res) => {
  try {
    // Get today's calculation summary
    const summary = await indicatorCalculationJob.getCalculationSummary();
    
    // Get total indicator count
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
 * Delete old indicator data
 * @route DELETE /api/v1/indicators/cleanup
 */
const cleanupOldIndicators = async (req, res) => {
  try {
    const { days = 365 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await db.TechnicalIndicator.destroy({
      where: {
        calculationDate: {
          [db.Sequelize.Op.lt]: cutoffDate
        }
      }
    });

    logger.info(`Cleaned up ${deletedCount} old indicators (older than ${days} days)`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Cleaned up ${deletedCount} old indicators`,
      data: {
        deletedCount,
        cutoffDate: cutoffDate.toISOString().split('T')[0]
      }
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
  getIndicatorTypes,
  getIndicatorConditions,
  calculateIndicatorsForStock,
  getStockIndicators,
  calculateAllIndicators,
  getCalculationStatus,
  cleanupOldIndicators
};