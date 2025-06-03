/**
 * API response formatter utility
 */

/**
 * Format success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object|array} [data=null] - Response data
 * @param {object} [meta=null] - Metadata like pagination
 * @returns {object} Formatted response
 */
const success = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array} [errors=null] - Validation errors
 * @returns {object} Formatted response
 */
const error = (res, statusCode, message, errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  error,
};
