/**
 * Alerts routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const alertsValidation = require('./alerts.validation');
const alertsController = require('./alerts.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get all alerts with filtering options
router.get(
  '/',
  authenticate,
  validate(alertsValidation.getAlerts, 'query'),
  catchAsync(alertsController.getAlerts)
);

// Create new alert
router.post(
  '/',
  authenticate,
  validate(alertsValidation.createAlert),
  catchAsync(alertsController.createAlert)
);

// Get alert by ID
router.get(
  '/:id',
  authenticate,
  validate(alertsValidation.getAlertById, 'params'),
  catchAsync(alertsController.getAlertById)
);

// Update alert
router.put(
  '/:id',
  authenticate,
  validate(alertsValidation.updateAlertParams, 'params'),
  validate(alertsValidation.updateAlert),
  catchAsync(alertsController.updateAlert)
);

// Delete alert
router.delete(
  '/:id',
  authenticate,
  validate(alertsValidation.deleteAlert, 'params'),
  catchAsync(alertsController.deleteAlert)
);

// Get alert history with date filtering
router.get(
  '/history',
  authenticate,
  validate(alertsValidation.getAlertHistory, 'query'),
  catchAsync(alertsController.getAlertHistory)
);

module.exports = router;
