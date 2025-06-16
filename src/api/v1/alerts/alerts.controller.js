/**
 * Alert controller - handles HTTP requests for alert operations
 */
const { StatusCodes } = require('http-status-codes');
const pick = require('../../../core/utils/pick');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const alertService = require('./alert.service');
const { catchAsync } = require('../../../core/utils/catchAsync');

/**
 * Get all alerts with filtering options
 * @route GET /api/v1/alerts
 */
const getAlerts = catchAsync(async (req, res) => {
  // Extract filter parameters from query
  const filter = pick(req.query, [
    'active',
    'type',
    'stock',
  ]);

  // Set user context for the filter
  filter.userId = req.user.id;

  // Extract pagination and sorting options
  const options = pick(req.query, [
    'sortBy',
    'sortOrder',
    'limit',
    'page',
  ]);

  // Convert string values to appropriate types
  options.limit = options.limit ? parseInt(options.limit, 10) : 10;
  options.page = options.page ? parseInt(options.page, 10) : 1;
  if (filter.active !== undefined) {
    filter.active = filter.active === 'true';
  }

  const { alerts, pagination } = await alertService.getAlerts(filter, options);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.ALERTS_FETCHED,
    alerts,
    pagination
  );
});

/**
 * Create a new alert
 * @route POST /api/v1/alerts
 */
const createAlert = catchAsync(async (req, res) => {
  // Add user ID to the alert data
  const alertData = {
    ...req.body,
    user_id: req.user.id
  };
  
  const alert = await alertService.createAlert(alertData);
  
  return apiResponse.success(
    res,
    StatusCodes.CREATED,
    successMessages.ALERT_CREATED,
    alert
  );
});

/**
 * Get alert by ID
 * @route GET /api/v1/alerts/:id
 */
const getAlertById = catchAsync(async (req, res) => {
  const alert = await alertService.getAlertById(req.params.id, req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.ALERT_FETCHED,
    alert
  );
});

/**
 * Update an alert
 * @route PUT /api/v1/alerts/:id
 */
const updateAlert = catchAsync(async (req, res) => {
  const alertId = req.params.id;
  const updateData = req.body;
  
  const alert = await alertService.updateAlert(alertId, req.user.id, updateData);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.ALERT_UPDATED,
    alert
  );
});

/**
 * Delete an alert
 * @route DELETE /api/v1/alerts/:id
 */
const deleteAlert = catchAsync(async (req, res) => {
  await alertService.deleteAlert(req.params.id, req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.ALERT_DELETED
  );
});

/**
 * Get alert history with date filtering
 * @route GET /api/v1/alerts/history
 */
const getAlertHistory = catchAsync(async (req, res) => {
  // Extract filter parameters from query
  const filter = pick(req.query, ['from', 'to']);
  
  // Set user context for the filter
  filter.userId = req.user.id;
  
  // Extract pagination and sorting options
  const options = pick(req.query, [
    'sortBy',
    'sortOrder',
    'limit',
    'page',
  ]);
  
  // Convert string values to appropriate types
  options.limit = options.limit ? parseInt(options.limit, 10) : 10;
  options.page = options.page ? parseInt(options.page, 10) : 1;
  
  const { history, pagination } = await alertService.getAlertHistory(filter, options);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.ALERT_HISTORY_FETCHED,
    history,
    pagination
  );
});

module.exports = {
  getAlerts,
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
  getAlertHistory
};
