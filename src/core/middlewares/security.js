/**
 * Security middleware setup
 */
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');

/**
 * Configure and apply security middlewares
 * @param {object} app - Express application instance
 */
const setupSecurity = (app) => {
  // Use Helmet for setting various HTTP headers
  app.use(helmet());
  
  // Enable CORS
  app.use(cors());
  
  // Create XSS sanitizer middleware
  const sanitizeXSS = (req, res, next) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      });
    }
    
    // Sanitize request query
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = xss(req.query[key]);
        }
      });
    }
    
    // Sanitize request params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = xss(req.params[key]);
        }
      });
    }
    
    next();
  };
  
  // Apply XSS sanitizer
  app.use(sanitizeXSS);
};

module.exports = setupSecurity;
