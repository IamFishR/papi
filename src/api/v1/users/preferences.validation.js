/**
 * User Preferences validation schema
 */
const Joi = require('joi');

/**
 * Schema for getting user preferences
 */
const getUserPreferences = {
  // No additional validation needed - user ID comes from authenticated user
};

/**
 * Schema for updating user preferences
 */
const updateUserPreferences = {
  body: Joi.object().keys({
    // Alert preferences
    default_alert_frequency_id: Joi.number().integer(),
    default_cooldown_minutes: Joi.number().integer().min(0),
    
    // Notification preferences
    notification_methods: Joi.array().items(Joi.number().integer()),
    email_notifications_enabled: Joi.boolean(),
    sms_notifications_enabled: Joi.boolean(),
    push_notifications_enabled: Joi.boolean(),
    webhook_notifications_enabled: Joi.boolean(),
    webhook_url: Joi.string().uri().when('webhook_notifications_enabled', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow('', null)
    }),
    
    // Email notification settings
    email_digest_frequency: Joi.string().valid('immediate', 'hourly', 'daily', 'weekly'),
    
    // Risk preferences
    risk_tolerance_level_id: Joi.number().integer(),
    
    // Display preferences
    default_chart_timeframe: Joi.string().valid('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'),
    show_extended_hours: Joi.boolean(),
    default_currency_id: Joi.number().integer(),
    
    // Time and date preferences
    timezone: Joi.string(),
    date_format: Joi.string(),
    time_format: Joi.string().valid('12h', '24h'),
    
    // Mobile app preferences
    mobile_notifications_quiet_hours_start: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    mobile_notifications_quiet_hours_end: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    mobile_biometric_login_enabled: Joi.boolean(),
  }).min(1),
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
};
