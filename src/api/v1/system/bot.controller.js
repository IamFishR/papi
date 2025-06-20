/**
 * Bot Management Controller - handles HTTP requests for trading bot operations
 */
const { StatusCodes } = require('http-status-codes');
const { catchAsync } = require('../../../core/utils/catchAsync');
const apiResponse = require('../../../core/utils/apiResponse');
const botService = require('./bot.service');

/**
 * Get bot status and configuration
 * GET /api/v1/system/bot/status
 */
const getBotStatus = catchAsync(async (req, res) => {
  const status = await botService.getBotStatus();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Bot status retrieved successfully',
    status
  );
});

/**
 * Start bot services
 * POST /api/v1/system/bot/start
 */
const startBot = catchAsync(async (req, res) => {
  const result = await botService.startBot();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

/**
 * Stop bot services
 * POST /api/v1/system/bot/stop
 */
const stopBot = catchAsync(async (req, res) => {
  const result = await botService.stopBot();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

/**
 * Restart bot services
 * POST /api/v1/system/bot/restart
 */
const restartBot = catchAsync(async (req, res) => {
  const result = await botService.restartBot();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

/**
 * Trigger manual job execution
 * POST /api/v1/system/bot/trigger
 * Body: { jobType: 'stocks' | 'prices' | 'all' }
 */
const triggerJob = catchAsync(async (req, res) => {
  const { jobType } = req.body;
  const result = await botService.triggerJob(jobType);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

/**
 * Get bot performance statistics
 * GET /api/v1/system/bot/stats
 */
const getBotStats = catchAsync(async (req, res) => {
  const stats = await botService.getBotStats();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Bot statistics retrieved successfully',
    stats
  );
});

/**
 * Get bot health check
 * GET /api/v1/system/bot/health
 */
const getBotHealth = catchAsync(async (req, res) => {
  const health = await botService.getBotHealth();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Bot health check completed',
    health
  );
});

/**
 * Update bot configuration
 * PUT /api/v1/system/bot/config
 * Body: { enabled, stockInterval, priceInterval, marketHoursOnly }
 */
const updateBotConfig = catchAsync(async (req, res) => {
  const config = req.body;
  const result = await botService.updateBotConfig(config);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

/**
 * Get market status
 * GET /api/v1/system/bot/market-status
 */
const getMarketStatus = catchAsync(async (req, res) => {
  const marketStatus = await botService.getMarketStatus();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'Market status retrieved successfully',
    marketStatus
  );
});

/**
 * Get API endpoints status
 * GET /api/v1/system/bot/endpoints
 */
const getApiEndpoints = catchAsync(async (req, res) => {
  const endpoints = await botService.getApiEndpoints();
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    'API endpoints retrieved successfully',
    endpoints
  );
});

/**
 * Update API endpoint
 * PUT /api/v1/system/bot/endpoints/:id
 */
const updateApiEndpoint = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const result = await botService.updateApiEndpoint(id, updates);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    result.message,
    result.data
  );
});

module.exports = {
  getBotStatus,
  startBot,
  stopBot,
  restartBot,
  triggerJob,
  getBotStats,
  getBotHealth,
  updateBotConfig,
  getMarketStatus,
  getApiEndpoints,
  updateApiEndpoint
};