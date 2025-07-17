/**
 * Notification validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing notifications with filtering
 */
const listNotifications = {
  query: Joi.object().keys({
    status: Joi.number().integer(),
    method: Joi.number().integer(),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'scheduled_for').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Schema for acknowledging a notification
 */
const acknowledgeNotification = {
  params: Joi.object().keys({
    id: Joi.alternatives().try(
      Joi.string().uuid(),
      Joi.string().pattern(/^\d+$/).message('id must be a valid number or GUID')
    ).required(),
  }),
};

module.exports = {
  listNotifications,
  acknowledgeNotification,
};
