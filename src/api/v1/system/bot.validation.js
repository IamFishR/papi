/**
 * Bot Management Validation Schemas
 */
const Joi = require('joi');

/**
 * Validation for manual job triggering
 */
const triggerJob = {
  body: Joi.object({
    jobType: Joi.string()
      .valid('stocks', 'prices', 'all')
      .required()
      .messages({
        'any.only': 'Job type must be one of: stocks, prices, all',
        'any.required': 'Job type is required'
      })
  })
};

/**
 * Validation for bot configuration updates
 */
const updateConfig = {
  body: Joi.object({
    enabled: Joi.boolean()
      .messages({
        'boolean.base': 'Enabled must be a boolean value'
      }),
    
    stockInterval: Joi.number()
      .integer()
      .min(1)
      .max(1440) // Max 24 hours
      .messages({
        'number.base': 'Stock interval must be a number',
        'number.integer': 'Stock interval must be an integer',
        'number.min': 'Stock interval must be at least 1 minute',
        'number.max': 'Stock interval cannot exceed 1440 minutes (24 hours)'
      }),
    
    priceInterval: Joi.number()
      .integer()
      .min(1)
      .max(1440) // Max 24 hours
      .messages({
        'number.base': 'Price interval must be a number',
        'number.integer': 'Price interval must be an integer',
        'number.min': 'Price interval must be at least 1 minute',
        'number.max': 'Price interval cannot exceed 1440 minutes (24 hours)'
      }),
    
    marketHoursOnly: Joi.boolean()
      .messages({
        'boolean.base': 'Market hours only must be a boolean value'
      })
  })
  .min(1) // At least one field must be provided
  .messages({
    'object.min': 'At least one configuration field must be provided'
  })
};

/**
 * Validation for API endpoint updates
 */
const updateEndpoint = {
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Endpoint ID must be a number',
        'number.integer': 'Endpoint ID must be an integer',
        'number.positive': 'Endpoint ID must be positive',
        'any.required': 'Endpoint ID is required'
      })
  }),
  
  body: Joi.object({
    url: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .messages({
        'string.uri': 'URL must be a valid HTTP/HTTPS URL'
      }),
    
    purpose: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'string.base': 'Purpose must be a string',
        'string.empty': 'Purpose cannot be empty',
        'string.min': 'Purpose must be at least 1 character',
        'string.max': 'Purpose cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    isActive: Joi.boolean()
      .messages({
        'boolean.base': 'Active status must be a boolean value'
      }),
    
    requestInfo: Joi.object({
      method: Joi.string()
        .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
        .default('GET'),
      
      headers: Joi.object()
        .pattern(Joi.string(), Joi.string()),
      
      timeout: Joi.number()
        .integer()
        .min(1000)
        .max(60000)
        .default(10000)
        .messages({
          'number.min': 'Timeout must be at least 1000ms (1 second)',
          'number.max': 'Timeout cannot exceed 60000ms (60 seconds)'
        }),
      
      retryAttempts: Joi.number()
        .integer()
        .min(0)
        .max(10)
        .default(3)
        .messages({
          'number.min': 'Retry attempts cannot be negative',
          'number.max': 'Retry attempts cannot exceed 10'
        }),
      
      rateLimitPerMinute: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .default(12)
        .messages({
          'number.min': 'Rate limit must be at least 1 request per minute',
          'number.max': 'Rate limit cannot exceed 1000 requests per minute'
        })
    })
    .messages({
      'object.base': 'Request info must be an object'
    }),
    
    responseInfo: Joi.object({
      expectedStatus: Joi.number()
        .integer()
        .min(200)
        .max(599)
        .default(200)
        .messages({
          'number.min': 'Expected status must be at least 200',
          'number.max': 'Expected status cannot exceed 599'
        }),
      
      contentType: Joi.string()
        .default('application/json')
        .messages({
          'string.base': 'Content type must be a string'
        }),
      
      dataPath: Joi.string()
        .allow('')
        .messages({
          'string.base': 'Data path must be a string'
        }),
      
      keyFields: Joi.array()
        .items(Joi.string())
        .messages({
          'array.base': 'Key fields must be an array of strings'
        })
    })
    .messages({
      'object.base': 'Response info must be an object'
    })
  })
  .min(1) // At least one field must be provided
  .messages({
    'object.min': 'At least one field must be provided for update'
  })
};

module.exports = {
  triggerJob,
  updateConfig,
  updateEndpoint
};