/**
 * Payload Transformer Middleware
 * Transforms incoming payloads to match expected API schema formats
 */

const logger = require('../../config/logger');

/**
 * Generic payload transformer middleware
 * @param {Function} transformerFn - Function that transforms the payload
 * @returns {Function} Express middleware function
 */
const payloadTransformer = (transformerFn) => {
  return (req, res, next) => {
    try {
      // Only transform if there's a body
      if (!req.body || Object.keys(req.body).length === 0) {
        return next();
      }

      // Apply the transformation
      const transformedPayload = transformerFn(req.body);
      // Replace the original body with transformed payload
      req.body = transformedPayload;
      
      next();
    } catch (error) {
      logger.error('Payload transformation failed', {
        error: error.message,
        stack: error.stack,
        originalPayload: req.body,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payload format - transformation failed',
        details: error.message
      });
    }
  };
};

module.exports = payloadTransformer;
