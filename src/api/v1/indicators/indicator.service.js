/**
 * Technical Indicator service - handles business logic for calculating technical indicators
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Calculate and store RSI (Relative Strength Index)
 * @param {number} stockId - Stock ID
 * @param {number} period - Period length (default: 14)
 * @returns {Promise<Object>} Calculated RSI indicator
 */
const calculateRSI = async (stockId, period = 14) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get indicator type
  const indicatorType = await db.IndicatorType.findOne({
    where: { name: 'RSI' }
  });
  
  if (!indicatorType) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'RSI indicator type not found');
  }

  // Get historical prices for calculation
  const prices = await db.StockPrice.findAll({
    where: { stockId },
    attributes: ['priceDate', 'closePrice'],
    order: [['priceDate', 'ASC']],
    limit: period * 2 + 10 // Get enough data for calculation
  });
  
  if (prices.length < period + 1) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough price data for RSI calculation');
  }

  // Calculate RSI
  const rsiValue = calculateRSIValue(prices, period);
  
  // Store the calculated indicator
  const technicalIndicator = await db.TechnicalIndicator.create({
    stockId,
    indicatorTypeId: indicatorType.id,
    periodLength: period,
    value: rsiValue,
    calculationDate: new Date()
  });

  return technicalIndicator;
};

/**
 * Calculate RSI value from price data
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} period - Period length
 * @returns {number} RSI value
 */
const calculateRSIValue = (prices, period) => {
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i].closePrice - prices[i-1].closePrice;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    
    if (gains.length > period) {
      gains.shift();
      losses.shift();
    }
    
    if (gains.length === period) {
      const avgGain = gains.reduce((sum, value) => sum + value, 0) / period;
      const avgLoss = losses.reduce((sum, value) => sum + value, 0) / period;
      
      if (avgLoss === 0) {
        return 100; // If there are no losses, RSI is 100
      }
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      return parseFloat(rsi.toFixed(2));
    }
  }
  
  // Not enough data to calculate
  return null;
};

/**
 * Calculate and store SMA (Simple Moving Average)
 * @param {number} stockId - Stock ID
 * @param {number} period - Period length (default: 20)
 * @returns {Promise<Object>} Calculated SMA indicator
 */
const calculateSMA = async (stockId, period = 20) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get indicator type
  const indicatorType = await db.IndicatorType.findOne({
    where: { name: 'SMA' }
  });
  
  if (!indicatorType) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'SMA indicator type not found');
  }

  // Get historical prices for calculation
  const prices = await db.StockPrice.findAll({
    where: { stockId },
    attributes: ['priceDate', 'closePrice'],
    order: [['priceDate', 'ASC']],
    limit: period + 10 // Get enough data for calculation
  });
  
  if (prices.length < period) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough price data for SMA calculation');
  }

  // Calculate SMA
  const smaValue = calculateSMAValue(prices, period);
  
  // Store the calculated indicator
  const technicalIndicator = await db.TechnicalIndicator.create({
    stockId,
    indicatorTypeId: indicatorType.id,
    periodLength: period,
    value: smaValue,
    calculationDate: new Date()
  });

  return technicalIndicator;
};

/**
 * Calculate SMA value from price data
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} period - Period length
 * @returns {number} SMA value
 */
const calculateSMAValue = (prices, period) => {
  if (prices.length < period) {
    return null;
  }
  
  const pricesForCalculation = prices.slice(-period);
  const sum = pricesForCalculation.reduce((total, price) => total + price.closePrice, 0);
  const sma = sum / period;
  
  return parseFloat(sma.toFixed(2));
};

/**
 * Calculate and store EMA (Exponential Moving Average)
 * @param {number} stockId - Stock ID
 * @param {number} period - Period length (default: 20)
 * @returns {Promise<Object>} Calculated EMA indicator
 */
const calculateEMA = async (stockId, period = 20) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get indicator type
  const indicatorType = await db.IndicatorType.findOne({
    where: { name: 'EMA' }
  });
  
  if (!indicatorType) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'EMA indicator type not found');
  }

  // Get historical prices for calculation
  const prices = await db.StockPrice.findAll({
    where: { stockId },
    attributes: ['priceDate', 'closePrice'],
    order: [['priceDate', 'ASC']],
    limit: period * 3 // Get enough data for calculation
  });
  
  if (prices.length < period) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough price data for EMA calculation');
  }

  // Calculate EMA
  const emaValue = calculateEMAValue(prices, period);
  
  // Store the calculated indicator
  const technicalIndicator = await db.TechnicalIndicator.create({
    stockId,
    indicatorTypeId: indicatorType.id,
    periodLength: period,
    value: emaValue,
    calculationDate: new Date()
  });

  return technicalIndicator;
};

/**
 * Calculate EMA value from price data
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} period - Period length
 * @returns {number} EMA value
 */
const calculateEMAValue = (prices, period) => {
  if (prices.length < period) {
    return null;
  }
  
  // Calculate SMA for the first EMA value
  const sma = calculateSMAValue(prices.slice(0, period), period);
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA
  let ema = sma;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i].closePrice - ema) * multiplier + ema;
  }
  
  return parseFloat(ema.toFixed(2));
};

/**
 * Calculate and store MACD (Moving Average Convergence Divergence)
 * @param {number} stockId - Stock ID
 * @param {number} fastPeriod - Fast period (default: 12)
 * @param {number} slowPeriod - Slow period (default: 26)
 * @param {number} signalPeriod - Signal period (default: 9)
 * @returns {Promise<Object>} Calculated MACD indicator
 */
const calculateMACD = async (stockId, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get indicator type
  const indicatorType = await db.IndicatorType.findOne({
    where: { name: 'MACD' }
  });
  
  if (!indicatorType) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'MACD indicator type not found');
  }

  // Get historical prices for calculation
  const prices = await db.StockPrice.findAll({
    where: { stockId },
    attributes: ['priceDate', 'closePrice'],
    order: [['priceDate', 'ASC']],
    limit: slowPeriod + signalPeriod + 10 // Get enough data for calculation
  });
  
  if (prices.length < slowPeriod + signalPeriod) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough price data for MACD calculation');
  }

  // Calculate MACD
  const macdValue = calculateMACDValue(prices, fastPeriod, slowPeriod, signalPeriod);
  
  // Store the calculated indicator
  const technicalIndicator = await db.TechnicalIndicator.create({
    stockId,
    indicatorTypeId: indicatorType.id,
    periodLength: fastPeriod, // Store the fast period as the main period
    value: macdValue,
    calculationDate: new Date(),
    additionalData: JSON.stringify({
      fastPeriod,
      slowPeriod,
      signalPeriod
    })
  });

  return technicalIndicator;
};

/**
 * Calculate MACD value from price data
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} fastPeriod - Fast period
 * @param {number} slowPeriod - Slow period
 * @param {number} signalPeriod - Signal period
 * @returns {number} MACD line value
 */
const calculateMACDValue = (prices, fastPeriod, slowPeriod, signalPeriod) => {
  // Calculate fast EMA
  const fastEMA = calculateEMAFromPrices(prices, fastPeriod);
  
  // Calculate slow EMA
  const slowEMA = calculateEMAFromPrices(prices, slowPeriod);
  
  // MACD Line = Fast EMA - Slow EMA
  const macdLine = fastEMA - slowEMA;
  
  return parseFloat(macdLine.toFixed(2));
};

/**
 * Helper function to calculate EMA from an array of prices
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} period - Period length
 * @returns {number} EMA value
 */
const calculateEMAFromPrices = (prices, period) => {
  if (prices.length < period) {
    return null;
  }
  
  // Calculate SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i].closePrice;
  }
  let sma = sum / period;
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA
  let ema = sma;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i].closePrice - ema) * multiplier + ema;
  }
  
  return ema;
};

/**
 * Calculate and store Bollinger Bands
 * @param {number} stockId - Stock ID
 * @param {number} period - Period length (default: 20)
 * @param {number} standardDeviations - Number of standard deviations (default: 2)
 * @returns {Promise<Object>} Calculated Bollinger Bands indicator
 */
const calculateBollingerBands = async (stockId, period = 20, standardDeviations = 2) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Get indicator type
  const indicatorType = await db.IndicatorType.findOne({
    where: { name: 'bollinger_bands' }
  });
  
  if (!indicatorType) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Bollinger Bands indicator type not found');
  }

  // Get historical prices for calculation
  const prices = await db.StockPrice.findAll({
    where: { stockId },
    attributes: ['priceDate', 'closePrice'],
    order: [['priceDate', 'ASC']],
    limit: period + 10 // Get enough data for calculation
  });
  
  if (prices.length < period) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Not enough price data for Bollinger Bands calculation');
  }

  // Calculate Bollinger Bands
  const { middle, upper, lower } = calculateBollingerBandsValue(prices, period, standardDeviations);
  
  // Store the calculated indicator
  const technicalIndicator = await db.TechnicalIndicator.create({
    stockId,
    indicatorTypeId: indicatorType.id,
    periodLength: period,
    value: middle, // Store the middle band as the main value
    calculationDate: new Date(),
    additionalData: JSON.stringify({
      upper,
      lower,
      standardDeviations
    })
  });

  return technicalIndicator;
};

/**
 * Calculate Bollinger Bands value from price data
 * @param {Array} prices - Array of price objects with closePrice
 * @param {number} period - Period length
 * @param {number} standardDeviations - Number of standard deviations
 * @returns {Object} Bollinger Bands values (middle, upper, lower)
 */
const calculateBollingerBandsValue = (prices, period, standardDeviations) => {
  if (prices.length < period) {
    return {
      middle: null,
      upper: null,
      lower: null
    };
  }
  
  // Calculate SMA (middle band)
  const pricesForCalculation = prices.slice(-period);
  const closePrices = pricesForCalculation.map(price => price.closePrice);
  
  const sum = closePrices.reduce((total, price) => total + price, 0);
  const middle = sum / period;
  
  // Calculate standard deviation
  const squaredDifferences = closePrices.map(price => Math.pow(price - middle, 2));
  const variance = squaredDifferences.reduce((total, diff) => total + diff, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate upper and lower bands
  const upper = middle + (standardDeviation * standardDeviations);
  const lower = middle - (standardDeviation * standardDeviations);
  
  return {
    middle: parseFloat(middle.toFixed(2)),
    upper: parseFloat(upper.toFixed(2)),
    lower: parseFloat(lower.toFixed(2))
  };
};

/**
 * Process technical indicators calculation for all stocks
 * This is used by the background job to calculate indicators
 * @returns {Promise<Object>} Processing results
 */
const processIndicators = async () => {
  // Get all active stocks
  const stocks = await db.Stock.findAll({
    where: { isActive: true }
  });

  const successfulCalculations = [];
  const failedCalculations = [];
  
  // Process each stock
  for (const stock of stocks) {
    try {
      // Calculate RSI
      const rsi = await calculateRSI(stock.id);
      
      // Calculate SMA
      const sma = await calculateSMA(stock.id);
      
      // Calculate EMA
      const ema = await calculateEMA(stock.id);
      
      // Calculate MACD
      const macd = await calculateMACD(stock.id);
      
      // Calculate Bollinger Bands
      const bollingerBands = await calculateBollingerBands(stock.id);
      
      successfulCalculations.push({
        stock,
        indicators: {
          rsi,
          sma,
          ema,
          macd,
          bollingerBands
        }
      });
    } catch (error) {
      failedCalculations.push({
        stock,
        error: error.message
      });
    }
  }

  return {
    processedCount: stocks.length,
    successCount: successfulCalculations.length,
    failedCount: failedCalculations.length,
    successfulCalculations,
    failedCalculations
  };
};

module.exports = {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  processIndicators
};
