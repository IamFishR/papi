/**
 * Request logging middleware with Morgan
 */
const morgan = require('morgan');
const logger = require('../../config/logger');
const config = require('../../config/config');

// Custom token for request body logging (only in development)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Mask sensitive data before logging
    const body = { ...req.body };
    
    // Mask password fields
    if (body.password) body.password = '[HIDDEN]';
    if (body.newPassword) body.newPassword = '[HIDDEN]';
    if (body.confirmPassword) body.confirmPassword = '[HIDDEN]';
    
    return JSON.stringify(body);
  }
  return '';
});

// Custom format based on environment
const format = config.env === 'development' 
  ? ':method :url :status :response-time ms - :res[content-length] :body' 
  : ':remote-addr - :method :url :status :response-time ms - :res[content-length]';

// Create Morgan middleware using Winston for logging
const requestLogger = morgan(format, {
  stream: logger.stream,
  skip: (req) => {
    // Skip logging for health check and static assets
    return req.url.includes('/health') || req.url.includes('/public');
  },
});

module.exports = requestLogger;
