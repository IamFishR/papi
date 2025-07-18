/**
 * Daily Technical Indicator Calculation Job
 * Runs after market close to calculate all technical indicators for active stocks
 */
const cron = require('node-cron');
const indicatorService = require('../api/v1/indicators/indicator.service');
const logger = require('../config/logger');
const db = require('../database/models');

class IndicatorCalculationJob {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  /**
   * Calculate indicators for all stocks with required periods
   * @returns {Promise<Object>} Calculation results
   */
  async calculateAllIndicators() {
    if (this.isRunning) {
      logger.warn('Indicator calculation already running, skipping...');
      return { message: 'Already running' };
    }

    try {
      this.isRunning = true;
      logger.info('Starting daily technical indicator calculations...');

      // Get all active stocks that have price data
      const stocks = await db.Stock.findAll({
        where: { isActive: true },
        include: [{
          model: db.StockPrice,
          as: 'stockPrices',
          required: true,
          limit: 1
        }]
      });

      logger.info(`Found ${stocks.length} active stocks with price data`);

      const results = {
        processedStocks: 0,
        successfulCalculations: 0,
        failedCalculations: 0,
        stockResults: [],
        errors: []
      };

      // Process each stock
      for (const stock of stocks) {
        try {
          results.processedStocks++;
          logger.debug(`Processing indicators for ${stock.symbol} (ID: ${stock.id})`);

          const stockResult = {
            stockId: stock.id,
            symbol: stock.symbol,
            indicators: {},
            errors: []
          };

          // Calculate standard indicators with common periods
          const indicatorTypes = [
            { name: 'RSI', periods: [14] },
            { name: 'SMA', periods: [20, 50, 200] },
            { name: 'EMA', periods: [12, 20, 26, 50] },
            { name: 'MACD', periods: [12] }, // MACD uses fastPeriod as main period
            { name: 'bollinger_bands', periods: [20] }
          ];

          for (const indicatorType of indicatorTypes) {
            for (const period of indicatorType.periods) {
              try {
                let indicator;
                
                switch (indicatorType.name) {
                  case 'RSI':
                    indicator = await this.calculateSingleIndicator('RSI', stock.id, period);
                    break;
                  case 'SMA':
                    indicator = await this.calculateSingleIndicator('SMA', stock.id, period);
                    break;
                  case 'EMA':
                    indicator = await this.calculateSingleIndicator('EMA', stock.id, period);
                    break;
                  case 'MACD':
                    indicator = await this.calculateSingleIndicator('MACD', stock.id, 12, 26, 9);
                    break;
                  case 'bollinger_bands':
                    indicator = await this.calculateSingleIndicator('bollinger_bands', stock.id, period);
                    break;
                }

                if (indicator) {
                  if (!stockResult.indicators[indicatorType.name]) {
                    stockResult.indicators[indicatorType.name] = [];
                  }
                  stockResult.indicators[indicatorType.name].push({
                    period,
                    value: indicator.value,
                    calculationDate: indicator.calculationDate
                  });
                  results.successfulCalculations++;
                }
              } catch (error) {
                logger.error(`Failed to calculate ${indicatorType.name}(${period}) for ${stock.symbol}:`, error.message);
                stockResult.errors.push({
                  indicator: `${indicatorType.name}(${period})`,
                  error: error.message
                });
                results.failedCalculations++;
              }
            }
          }

          results.stockResults.push(stockResult);

        } catch (error) {
          logger.error(`Failed to process stock ${stock.symbol}:`, error);
          results.errors.push({
            stock: stock.symbol,
            error: error.message
          });
          results.failedCalculations++;
        }
      }

      logger.info(`Indicator calculation completed. Processed: ${results.processedStocks}, Success: ${results.successfulCalculations}, Failed: ${results.failedCalculations}`);

      return results;

    } catch (error) {
      logger.error('Error in daily indicator calculation:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Calculate a single technical indicator
   * @param {string} type - Indicator type
   * @param {number} stockId - Stock ID
   * @param {number} period - Primary period
   * @param {number} slowPeriod - Secondary period (for MACD)
   * @param {number} signalPeriod - Signal period (for MACD)
   * @returns {Promise<Object>} Calculated indicator
   */
  async calculateSingleIndicator(type, stockId, period, slowPeriod = null, signalPeriod = null) {
    // Check if indicator already exists for today
    const today = new Date().toISOString().split('T')[0];
    
    const indicatorType = await db.IndicatorType.findOne({
      where: { name: type }
    });

    if (!indicatorType) {
      throw new Error(`Indicator type ${type} not found`);
    }

    const existingIndicator = await db.TechnicalIndicator.findOne({
      where: {
        stockId,
        indicatorTypeId: indicatorType.id,
        timePeriod: period,
        calculationDate: {
          [db.Sequelize.Op.gte]: today
        }
      }
    });

    if (existingIndicator) {
      logger.debug(`${type}(${period}) already calculated for stock ${stockId} today`);
      return existingIndicator;
    }

    // Calculate new indicator
    switch (type) {
      case 'RSI':
        return await indicatorService.calculateRSI(stockId, period);
      case 'SMA':
        return await indicatorService.calculateSMA(stockId, period);
      case 'EMA':
        return await indicatorService.calculateEMA(stockId, period);
      case 'MACD':
        return await indicatorService.calculateMACD(stockId, period, slowPeriod, signalPeriod);
      case 'bollinger_bands':
        return await indicatorService.calculateBollingerBands(stockId, period);
      default:
        throw new Error(`Unknown indicator type: ${type}`);
    }
  }

  /**
   * Clean up old indicator data (keep last 365 days)
   */
  async cleanupOldIndicators() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);

      const deletedCount = await db.TechnicalIndicator.destroy({
        where: {
          calculationDate: {
            [db.Sequelize.Op.lt]: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${deletedCount} old technical indicators (older than 365 days)`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old indicators:', error);
      throw error;
    }
  }

  /**
   * Get calculation summary for monitoring
   */
  async getCalculationSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const summary = await db.TechnicalIndicator.findAll({
        attributes: [
          [db.Sequelize.fn('COUNT', db.Sequelize.col('TechnicalIndicator.id')), 'count'],
          'indicatorTypeId',
          'timePeriod'
        ],
        where: {
          calculationDate: {
            [db.Sequelize.Op.gte]: today
          }
        },
        include: [{
          model: db.IndicatorType,
          as: 'indicatorType',
          attributes: ['name']
        }],
        group: ['indicatorTypeId', 'timePeriod'],
        raw: false
      });

      return summary.map(item => ({
        indicator: item.indicatorType.name,
        period: item.timePeriod,
        count: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      logger.error('Error getting calculation summary:', error);
      throw error;
    }
  }

  /**
   * Start the daily calculation job
   * Runs at 4:00 PM IST (after market close at 3:30 PM)
   */
  start() {
    if (this.job) {
      logger.warn('Indicator calculation job already running');
      return;
    }

    // Run at 4:00 PM IST every weekday (Monday to Friday)
    // Cron format: minute hour day month day-of-week
    this.job = cron.schedule('0 16 * * 1-5', async () => {
      try {
        logger.info('Starting scheduled technical indicator calculation...');
        
        // Calculate all indicators
        const results = await this.calculateAllIndicators();
        
        // Clean up old data weekly (only on Fridays)
        const today = new Date();
        if (today.getDay() === 5) { // Friday
          await this.cleanupOldIndicators();
        }
        
        // Log summary
        const summary = await this.getCalculationSummary();
        logger.info('Today\'s indicator calculation summary:', summary);
        
      } catch (error) {
        logger.error('Error in scheduled indicator calculation:', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'Asia/Kolkata'
    });

    logger.info('Technical indicator calculation job started - runs daily at 4:00 PM IST (after market close)');
  }

  /**
   * Stop the calculation job
   */
  stop() {
    if (this.job) {
      this.job.destroy();
      this.job = null;
      logger.info('Technical indicator calculation job stopped');
    }
  }

  /**
   * Run calculation manually (for testing or one-time runs)
   */
  async runManually() {
    logger.info('Running manual technical indicator calculation...');
    return await this.calculateAllIndicators();
  }
}

module.exports = new IndicatorCalculationJob();