/**
 * Notifications routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const notificationsValidation = require('./notifications.validation');
const notificationsController = require('./notifications.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get all notifications with status/method filtering
router.get(
  '/',
  authenticate,
  validate(notificationsValidation.listNotifications.query, 'query'),
  catchAsync(notificationsController.getNotifications)
);

// Acknowledge notification
router.put(
  '/:id/acknowledge',
  authenticate,
  validate(notificationsValidation.acknowledgeNotification.params, 'params'),
  catchAsync(notificationsController.acknowledgeNotification)
);

module.exports = router;
