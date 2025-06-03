/**
 * Express application setup
 */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { StatusCodes } = require('http-status-codes');

// Configuration
const config = require('./config/config');
const logger = require('./config/logger');

// Middlewares
const requestLogger = require('./core/middlewares/requestLogger');
const setupSecurity = require('./core/middlewares/security');
const errorHandler = require('./core/middlewares/errorHandler');
const { basicLimiter } = require('./config/rateLimit');

// Routes
const apiRoutes = require('./api');

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Security middlewares (helmet, cors, xss)
setupSecurity(app);

// Rate limiting
app.use(basicLimiter);

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// API routes
app.use(config.apiPrefix, apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok', timestamp: new Date() });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
