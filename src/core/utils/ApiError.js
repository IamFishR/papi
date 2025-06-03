/**
 * Custom error class extending Error
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {array} [errors=null] - Validation errors
   * @param {string} [stack=null] - Error stack trace
   */
  constructor(statusCode, message, errors = null, stack = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
