/**
 * Alert Evaluator Service - Handles evaluation of technical indicator conditions
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const db = require('../../../database/models');
const logger = require('../../../config/logger');

/**
 * Evaluate technical indicator alert conditions
 * @param {Object} alert - Alert object with conditions
 * @returns {Promise<Object>} Evaluation result
 */
const evaluateTechnicalIndicatorAlert = async (alert) => {
  try {
    // Get the primary indicator condition
    const primaryResult = await evaluateSingleIndicatorCondition(
      alert.stockId,
      alert.indicatorTypeId,
      alert.indicatorPeriod || 14,
      alert.indicatorThreshold,
      alert.indicatorConditionId,
      alert.compareIndicatorTypeId,
      alert.compareIndicatorPeriod
    );

    // If there's a secondary condition, evaluate it
    let secondaryResult = null;
    if (alert.secondaryIndicatorTypeId) {
      secondaryResult = await evaluateSingleIndicatorCondition(
        alert.stockId,
        alert.secondaryIndicatorTypeId,
        alert.secondaryIndicatorPeriod || 14,
        alert.secondaryIndicatorThreshold,
        alert.secondaryIndicatorConditionId
      );
    }

    // Combine results using logic (AND/OR)
    const finalResult = combineConditionResults(
      primaryResult,
      secondaryResult,
      alert.conditionLogicId || 1 // Default to AND logic
    );

    return {
      triggered: finalResult.triggered,
      message: finalResult.message,
      triggerValue: finalResult.triggerValue,
      conditions: {
        primary: primaryResult,
        secondary: secondaryResult
      }
    };
  } catch (error) {
    logger.error('Error evaluating technical indicator alert:', error);
    throw error;
  }
};

/**
 * Evaluate a single indicator condition
 * @param {number} stockId - Stock ID
 * @param {number} indicatorTypeId - Indicator type ID
 * @param {number} period - Period for calculation
 * @param {number} threshold - Threshold value
 * @param {number} conditionId - Condition ID (above, below, crossover, crossunder)
 * @param {number} compareIndicatorTypeId - Compare indicator type ID (for crossover/crossunder)
 * @param {number} compareIndicatorPeriod - Compare indicator period
 * @returns {Promise<Object>} Evaluation result
 */
const evaluateSingleIndicatorCondition = async (
  stockId,
  indicatorTypeId,
  period,
  threshold,
  conditionId,
  compareIndicatorTypeId = null,
  compareIndicatorPeriod = null
) => {
  // Get the indicator type
  const indicatorType = await db.IndicatorType.findByPk(indicatorTypeId);
  if (!indicatorType) {
    throw new Error(`Indicator type ${indicatorTypeId} not found`);
  }

  // Get the condition
  const condition = await db.IndicatorCondition.findByPk(conditionId);
  if (!condition) {
    throw new Error(`Condition ${conditionId} not found`);
  }

  // Get the latest indicator value
  const latestIndicator = await db.TechnicalIndicator.findOne({
    where: {
      stockId,
      indicatorTypeId,
      timePeriod: period
    },
    order: [['calculation_date', 'DESC']]
  });

  if (!latestIndicator) {
    return {
      triggered: false,
      message: `No ${indicatorType.name} data available`,
      triggerValue: null
    };
  }

  const currentValue = parseFloat(latestIndicator.value);

  // Handle different condition types
  switch (condition.name) {
    case 'above':
      return evaluateAboveCondition(currentValue, threshold, indicatorType.name);
    
    case 'below':
      return evaluateBelowCondition(currentValue, threshold, indicatorType.name);
    
    case 'crossover':
      return await evaluateCrossoverCondition(
        stockId,
        indicatorTypeId,
        period,
        compareIndicatorTypeId,
        compareIndicatorPeriod,
        indicatorType.name
      );
    
    case 'crossunder':
      return await evaluateCrossunderCondition(
        stockId,
        indicatorTypeId,
        period,
        compareIndicatorTypeId,
        compareIndicatorPeriod,
        indicatorType.name
      );
    
    default:
      throw new Error(`Unknown condition: ${condition.name}`);
  }
};

/**
 * Evaluate above condition
 */
const evaluateAboveCondition = (currentValue, threshold, indicatorName) => {
  const triggered = currentValue > threshold;
  return {
    triggered,
    message: triggered 
      ? `${indicatorName} (${currentValue}) is above ${threshold}`
      : `${indicatorName} (${currentValue}) is not above ${threshold}`,
    triggerValue: currentValue
  };
};

/**
 * Evaluate below condition
 */
const evaluateBelowCondition = (currentValue, threshold, indicatorName) => {
  const triggered = currentValue < threshold;
  return {
    triggered,
    message: triggered 
      ? `${indicatorName} (${currentValue}) is below ${threshold}`
      : `${indicatorName} (${currentValue}) is not below ${threshold}`,
    triggerValue: currentValue
  };
};

/**
 * Evaluate crossover condition (indicator crosses above compare indicator)
 */
const evaluateCrossoverCondition = async (
  stockId,
  indicatorTypeId,
  period,
  compareIndicatorTypeId,
  compareIndicatorPeriod,
  indicatorName
) => {
  // Get the two latest values for both indicators
  const [primaryIndicators, compareIndicators] = await Promise.all([
    db.TechnicalIndicator.findAll({
      where: { stockId, indicatorTypeId, timePeriod: period },
      order: [['calculation_date', 'DESC']],
      limit: 2
    }),
    db.TechnicalIndicator.findAll({
      where: { stockId, indicatorTypeId: compareIndicatorTypeId, timePeriod: compareIndicatorPeriod },
      order: [['calculation_date', 'DESC']],
      limit: 2
    })
  ]);

  if (primaryIndicators.length < 2 || compareIndicators.length < 2) {
    return {
      triggered: false,
      message: 'Not enough data for crossover analysis',
      triggerValue: null
    };
  }

  const [primaryCurrent, primaryPrevious] = primaryIndicators.map(i => parseFloat(i.value));
  const [compareCurrent, comparePrevious] = compareIndicators.map(i => parseFloat(i.value));

  // Check if crossover occurred (was below, now above)
  const wasBelowNowAbove = primaryPrevious <= comparePrevious && primaryCurrent > compareCurrent;

  const compareIndicatorType = await db.IndicatorType.findByPk(compareIndicatorTypeId);
  const compareIndicatorName = compareIndicatorType?.name || 'Unknown';

  return {
    triggered: wasBelowNowAbove,
    message: wasBelowNowAbove 
      ? `${indicatorName} (${primaryCurrent}) crossed above ${compareIndicatorName} (${compareCurrent})`
      : `${indicatorName} (${primaryCurrent}) did not cross above ${compareIndicatorName} (${compareCurrent})`,
    triggerValue: primaryCurrent
  };
};

/**
 * Evaluate crossunder condition (indicator crosses below compare indicator)
 */
const evaluateCrossunderCondition = async (
  stockId,
  indicatorTypeId,
  period,
  compareIndicatorTypeId,
  compareIndicatorPeriod,
  indicatorName
) => {
  // Get the two latest values for both indicators
  const [primaryIndicators, compareIndicators] = await Promise.all([
    db.TechnicalIndicator.findAll({
      where: { stockId, indicatorTypeId, timePeriod: period },
      order: [['calculation_date', 'DESC']],
      limit: 2
    }),
    db.TechnicalIndicator.findAll({
      where: { stockId, indicatorTypeId: compareIndicatorTypeId, timePeriod: compareIndicatorPeriod },
      order: [['calculation_date', 'DESC']],
      limit: 2
    })
  ]);

  if (primaryIndicators.length < 2 || compareIndicators.length < 2) {
    return {
      triggered: false,
      message: 'Not enough data for crossunder analysis',
      triggerValue: null
    };
  }

  const [primaryCurrent, primaryPrevious] = primaryIndicators.map(i => parseFloat(i.value));
  const [compareCurrent, comparePrevious] = compareIndicators.map(i => parseFloat(i.value));

  // Check if crossunder occurred (was above, now below)
  const wasAboveNowBelow = primaryPrevious >= comparePrevious && primaryCurrent < compareCurrent;

  const compareIndicatorType = await db.IndicatorType.findByPk(compareIndicatorTypeId);
  const compareIndicatorName = compareIndicatorType?.name || 'Unknown';

  return {
    triggered: wasAboveNowBelow,
    message: wasAboveNowBelow 
      ? `${indicatorName} (${primaryCurrent}) crossed below ${compareIndicatorName} (${compareCurrent})`
      : `${indicatorName} (${primaryCurrent}) did not cross below ${compareIndicatorName} (${compareCurrent})`,
    triggerValue: primaryCurrent
  };
};

/**
 * Combine multiple condition results using logical operators
 */
const combineConditionResults = (primaryResult, secondaryResult, logicId) => {
  // If no secondary condition, return primary result
  if (!secondaryResult) {
    return primaryResult;
  }

  // Logic ID: 1 = AND, 2 = OR
  const isAndLogic = logicId === 1;
  
  let triggered;
  let message;
  
  if (isAndLogic) {
    triggered = primaryResult.triggered && secondaryResult.triggered;
    message = `${primaryResult.message} AND ${secondaryResult.message}`;
  } else {
    triggered = primaryResult.triggered || secondaryResult.triggered;
    message = `${primaryResult.message} OR ${secondaryResult.message}`;
  }

  return {
    triggered,
    message,
    triggerValue: primaryResult.triggerValue // Use primary trigger value
  };
};

/**
 * Get common technical indicator patterns
 */
const getCommonIndicatorPatterns = () => {
  return {
    goldenCross: {
      name: 'Golden Cross',
      description: 'SMA 50 crosses above SMA 200',
      primaryIndicator: 'SMA',
      primaryPeriod: 50,
      compareIndicator: 'SMA',
      comparePeriod: 200,
      condition: 'crossover'
    },
    deathCross: {
      name: 'Death Cross',
      description: 'SMA 50 crosses below SMA 200',
      primaryIndicator: 'SMA',
      primaryPeriod: 50,
      compareIndicator: 'SMA',
      comparePeriod: 200,
      condition: 'crossunder'
    },
    rsiOverbought: {
      name: 'RSI Overbought',
      description: 'RSI above 70',
      primaryIndicator: 'RSI',
      primaryPeriod: 14,
      threshold: 70,
      condition: 'above'
    },
    rsiOversold: {
      name: 'RSI Oversold',
      description: 'RSI below 30',
      primaryIndicator: 'RSI',
      primaryPeriod: 14,
      threshold: 30,
      condition: 'below'
    },
    macdBullish: {
      name: 'MACD Bullish Signal',
      description: 'MACD crosses above signal line',
      primaryIndicator: 'MACD',
      primaryPeriod: 12,
      condition: 'crossover'
    }
  };
};

module.exports = {
  evaluateTechnicalIndicatorAlert,
  evaluateSingleIndicatorCondition,
  getCommonIndicatorPatterns
};