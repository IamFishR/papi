/**
 * Notification controller - handles HTTP requests for notification operations
 */
const { StatusCodes } = require('http-status-codes');
const pick = require('../../../core/utils/pick');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const notificationService = require('./notification.service');
const { catchAsync } = require('../../../core/utils/catchAsync');

/**
 * Get notifications with status/method filtering
 * @route GET /api/v1/notifications
 */
const getNotifications = catchAsync(async (req, res) => {
  // Extract filter parameters from query
  const filter = pick(req.query, [
    'status',
    'method',
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
  
  const { notifications, pagination } = await notificationService.getNotifications(filter, options);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.NOTIFICATIONS_FETCHED,
    notifications,
    pagination
  );
});

/**
 * Acknowledge a notification
 * @route PUT /api/v1/notifications/:id/acknowledge
 */
const acknowledgeNotification = catchAsync(async (req, res) => {
  const notificationId = req.params.id;
  
  await notificationService.acknowledgeNotification(notificationId, req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.NOTIFICATION_ACKNOWLEDGED
  );
});

module.exports = {
  getNotifications,
  acknowledgeNotification
};
