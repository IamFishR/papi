/**
 * System operations validation schemas
 */
const Joi = require('joi');

/**
 * Schema for manually triggering alert processing
 */
const processAlerts = {
  body: Joi.object().keys({
    alert_ids: Joi.array().items(Joi.string().uuid()),
    stock_ids: Joi.array().items(Joi.string().uuid()),
    force: Joi.boolean().default(false),
  }),
};

module.exports = {
  processAlerts,
};
