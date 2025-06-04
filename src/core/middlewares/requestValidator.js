/**
 * Request validation middleware using Joi
 */
const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const errorMessages = require('../../constants/errorMessages');

/**
 * Middleware factory for validating requests using Joi schema
 * @param {object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      console.error('Invalid schema provided for validation:', property, schema);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Server configuration error',
      });
    }
    
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]/g, ''),
    }));
    
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: errorMessages.VALIDATION_ERROR,
      errors,
    });
  };
};

module.exports = validate;
