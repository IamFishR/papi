/**
 * Alert validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing alerts with filters
 */
const listAlerts = {
  query: Joi.object().keys({
    active: Joi.boolean(),
    type: Joi.number().integer(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('name', 'created_at', 'last_triggered_at').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Schema for creating a new alert
 */
const createAlert = {
  body: Joi.object().keys({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().allow('', null),
    
    // Alert trigger configuration
    trigger_type_id: Joi.number().integer().required(),
    stock_id: Joi.string().uuid(),
    
    // Price alert fields - required if trigger_type is 'stock_price'
    threshold_value: Joi.number().when('trigger_type_id', {
      is: 1, // stock_price trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    threshold_condition_id: Joi.number().integer().when('trigger_type_id', {
      is: 1, // stock_price trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    percentage_change: Joi.number().precision(2),
    
    // Volume alert fields - required if trigger_type is 'volume'
    volume_threshold: Joi.number().integer().when('trigger_type_id', {
      is: 2, // volume trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    volume_condition_id: Joi.number().integer().when('trigger_type_id', {
      is: 2, // volume trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    // Technical indicator fields - required if trigger_type is 'technical_indicator'
    indicator_type_id: Joi.number().integer().when('trigger_type_id', {
      is: 3, // technical_indicator trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    indicator_period: Joi.number().integer().min(1).max(200).default(14),
    indicator_threshold: Joi.number().precision(4).when('trigger_type_id', {
      is: 3, // technical_indicator trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    indicator_condition_id: Joi.number().integer().when('trigger_type_id', {
      is: 3, // technical_indicator trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    // News alert fields - required if trigger_type is 'news'
    news_keywords: Joi.string().when('trigger_type_id', {
      is: 4, // news trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    sentiment_type_id: Joi.number().integer().when('trigger_type_id', {
      is: 4, // news trigger type ID
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    
    // Alert behavior
    alert_frequency_id: Joi.number().integer().required(),
    is_active: Joi.boolean().default(true),
    cooldown_minutes: Joi.number().integer().min(0).default(0),
    
    // Conditional logic for multi-condition alerts
    condition_logic_id: Joi.number().integer(),
    parent_alert_id: Joi.string().uuid().allow(null),
    
    // Scheduling
    schedule_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    schedule_days: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ),
  }).custom((value, helpers) => {
    // Custom validation to ensure required fields are present based on trigger type
    const { trigger_type_id, stock_id } = value;
    
    // Stock ID is required for all trigger types except portfolio
    if (trigger_type_id !== 5 && !stock_id) { // 5 = portfolio trigger type ID
      return helpers.error('any.custom', { message: 'stock_id is required for this trigger type' });
    }
    
    return value;
  }),
};

/**
 * Schema for getting an alert by ID
 */
const getAlertById = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for updating an alert
 */
const updateAlert = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().min(1).max(255),
    description: Joi.string().allow('', null),
    
    // Alert trigger configuration
    trigger_type_id: Joi.number().integer(),
    stock_id: Joi.string().uuid(),
    
    // Price alert fields
    threshold_value: Joi.number(),
    threshold_condition_id: Joi.number().integer(),
    percentage_change: Joi.number().precision(2),
    
    // Volume alert fields
    volume_threshold: Joi.number().integer(),
    volume_condition_id: Joi.number().integer(),
    
    // Technical indicator fields
    indicator_type_id: Joi.number().integer(),
    indicator_period: Joi.number().integer().min(1).max(200),
    indicator_threshold: Joi.number().precision(4),
    indicator_condition_id: Joi.number().integer(),
    
    // News alert fields
    news_keywords: Joi.string(),
    sentiment_type_id: Joi.number().integer(),
    
    // Alert behavior
    alert_frequency_id: Joi.number().integer(),
    is_active: Joi.boolean(),
    cooldown_minutes: Joi.number().integer().min(0),
    
    // Conditional logic for multi-condition alerts
    condition_logic_id: Joi.number().integer(),
    parent_alert_id: Joi.string().uuid().allow(null),
    
    // Scheduling
    schedule_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    schedule_days: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ),
  }).min(1),
};

/**
 * Schema for deleting an alert
 */
const deleteAlert = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * Schema for getting alert history
 */
const getAlertHistory = {
  query: Joi.object().keys({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    alert_id: Joi.string().uuid(),
    stock_id: Joi.string().uuid(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('triggered_at').default('triggered_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

module.exports = {
  listAlerts,
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertHistory,
};
