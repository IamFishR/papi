/**
 * Reference service - handles business logic for reference data operations
 */
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../../core/utils/ApiError');
const db = require('../../../database/models');

/**
 * Get reference data by type
 * @param {string} type - Reference data type
 * @returns {Promise<Array>} Reference data items
 */
const getReferenceData = async (type) => {
  // Map type to model and table
  const typeModelMap = {
    'trigger-types': { model: db.TriggerType, table: 'st_trigger_types' },
    'threshold-conditions': { model: db.ThresholdCondition, table: 'st_threshold_conditions' },
    'volume-conditions': { model: db.VolumeCondition, table: 'st_volume_conditions' },
    'indicator-types': { model: db.IndicatorType, table: 'st_indicator_types' },
    'indicator-conditions': { model: db.IndicatorCondition, table: 'st_indicator_conditions' },
    'sentiment-types': { model: db.SentimentType, table: 'st_sentiment_types' },
    'alert-frequencies': { model: db.AlertFrequency, table: 'st_alert_frequencies' },
    'condition-logic-types': { model: db.ConditionLogicType, table: 'st_condition_logic_types' },
    'alert-statuses': { model: db.AlertStatus, table: 'st_alert_statuses' },
    'notification-methods': { model: db.NotificationMethod, table: 'st_notification_methods' },
    'risk-tolerance-levels': { model: db.RiskToleranceLevel, table: 'st_risk_tolerance_levels' },
    'notification-statuses': { model: db.NotificationStatus, table: 'st_notification_statuses' },
    'exchanges': { model: db.Exchange, table: 'st_exchanges' },
    'detailed-sectors': { model: db.DetailedSector, table: 'st_detailed_sectors' },
    'currencies': { model: db.Currency, table: 'st_currencies' },
    'news-sources': { model: db.NewsSource, table: 'st_news_sources' },
    'priority-levels': { model: db.PriorityLevel, table: 'st_priority_levels' }
  };

  // Check if type is valid
  if (!typeModelMap[type]) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid reference type: ${type}`);
  }

  // Get model for the type
  const { model } = typeModelMap[type];

  // Get reference data
  const data = await model.findAll({
    order: [['id', 'ASC']]
  });

  return data;
};

/**
 * Get all reference data types
 * @returns {Promise<Object>} All reference data types
 */
const getAllReferenceData = async () => {
  // Get all reference data types
  const types = [
    'trigger-types',
    'threshold-conditions',
    'volume-conditions',
    'indicator-types',
    'indicator-conditions',
    'sentiment-types',
    'alert-frequencies',
    'condition-logic-types',
    'alert-statuses',
    'notification-methods',
    'risk-tolerance-levels',
    'notification-statuses',
    'exchanges',
    'detailed-sectors',
    'currencies',
    'news-sources',
    'priority-levels'
  ];

  // Get reference data for each type
  const result = {};

  for (const type of types) {
    result[type] = await getReferenceData(type);
  }

  return result;
};

module.exports = {
  getReferenceData,
  getAllReferenceData
};
