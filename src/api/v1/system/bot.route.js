/**
 * Bot Management Routes - defines HTTP endpoints for trading bot operations
 */
const express = require('express');
const botController = require('./bot.controller');
const authenticate = require('../../../core/middlewares/authenticate');
const botValidation = require('./bot.validation');
const requestValidator = require('../../../core/middlewares/requestValidator');

const router = express.Router();

// Apply authentication to all bot routes
router.use(authenticate);

/**
 * Bot Status and Control Routes
 */

// GET /api/v1/system/bot/status - Get comprehensive bot status
router.get('/status', botController.getBotStatus);

// POST /api/v1/system/bot/start - Start bot services
router.post('/start', botController.startBot);

// POST /api/v1/system/bot/stop - Stop bot services
router.post('/stop', botController.stopBot);

// POST /api/v1/system/bot/restart - Restart bot services
router.post('/restart', botController.restartBot);

// POST /api/v1/system/bot/trigger - Trigger manual job execution
router.post('/trigger', 
  requestValidator(botValidation.triggerJob),
  botController.triggerJob
);

/**
 * Bot Monitoring and Statistics Routes
 */

// GET /api/v1/system/bot/stats - Get bot performance statistics
router.get('/stats', botController.getBotStats);

// GET /api/v1/system/bot/stats/historical - Get historical bot execution statistics
router.get('/stats/historical', botController.getHistoricalStats);

// GET /api/v1/system/bot/stats/history/:botType - Get execution history for specific bot type
router.get('/stats/history/:botType', botController.getBotExecutionHistory);

// GET /api/v1/system/bot/health - Get bot health check
router.get('/health', botController.getBotHealth);

// GET /api/v1/system/bot/market-status - Get market status
router.get('/market-status', botController.getMarketStatus);

/**
 * Bot Configuration Routes
 */

// PUT /api/v1/system/bot/config - Update bot configuration
router.put('/config', 
  requestValidator(botValidation.updateConfig),
  botController.updateBotConfig
);

/**
 * API Endpoints Management Routes
 */

// GET /api/v1/system/bot/endpoints - Get API endpoints configuration
router.get('/endpoints', botController.getApiEndpoints);

// PUT /api/v1/system/bot/endpoints/:id - Update specific API endpoint
router.put('/endpoints/:id', 
  requestValidator(botValidation.updateEndpoint),
  botController.updateApiEndpoint
);

module.exports = router;