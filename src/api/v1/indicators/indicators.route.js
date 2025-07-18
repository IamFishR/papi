/**
 * Technical Indicators routes
 */
const express = require('express');
const indicatorsController = require('./indicators.controller');
const authenticate = require('../../../core/middlewares/authenticate');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get indicator types
router.get('/types', authenticate, catchAsync(indicatorsController.getIndicatorTypes));

// Get indicator conditions
router.get('/conditions', authenticate, catchAsync(indicatorsController.getIndicatorConditions));

// Calculate indicators for a specific stock
router.post('/calculate/:stockId', authenticate, catchAsync(indicatorsController.calculateIndicators));

// Process indicators for all stocks
router.post('/process-all', authenticate, catchAsync(indicatorsController.processAllIndicators));

// Get technical indicators data for a stock
router.get('/stock/:stockId', authenticate, catchAsync(indicatorsController.getStockIndicators));

// Get calculation status and job status
router.get('/status', authenticate, catchAsync(indicatorsController.getCalculationStatus));

// Clean up old indicator data
router.delete('/cleanup', authenticate, catchAsync(indicatorsController.cleanupOldIndicators));

module.exports = router;