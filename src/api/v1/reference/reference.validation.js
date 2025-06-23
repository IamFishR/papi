/**
 * Reference data validation schemas
 */
const Joi = require('joi');

/**
 * Schema for getting reference data by type
 */
const getReferenceData = {
  query: Joi.object().keys({
    type: Joi.string().required().valid(
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
    ),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(100),
    sortBy: Joi.string().valid('id', 'name').default('id'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

module.exports = {
  getReferenceData,
};
