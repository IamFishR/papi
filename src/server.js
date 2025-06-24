/**
 * Server initialization
 */
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const db = require('./database/models');
const alertScheduler = require('./jobs/alertScheduler');
const moment = require('moment-timezone');

// Set timezone for the application
moment.tz.setDefault(config.timezone);

// Normalize port
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  
  if (isNaN(port)) {
    return val;
  }
  
  if (port >= 0) {
    return port;
  }
  
  return false;
};

// Get port from environment and store in Express
const port = normalizePort(config.port);
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  
  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Server listening event handler
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  logger.info(`Server listening on ${bind}`);
  logger.info(`Environment: ${config.env}`);
  // logger.info(`API URL: http://localhost:${port}${config.apiPrefix}`);
};

// Sync database and start server
const startServer = async () => {
  try {    
    // Skip database sync as we already have migrations
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Start the server
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    
    // Start alert scheduler
    alertScheduler.start();
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  alertScheduler.stop();
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  alertScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  alertScheduler.stop();
  process.exit(0);
});

// Start the server
startServer();
