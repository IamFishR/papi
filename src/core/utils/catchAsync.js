/**
 * Async handler wrapper to avoid try-catch blocks in route handlers
 */

/**
 * Wraps an async function to automatically catch errors and pass them to Express error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { catchAsync };
