/**
 * Technical Indicator routes
 */
const express = require('express');
const indicatorController = require('./indicator.controller');
const { authenticateToken } = require('../../../core/middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/v1/indicators/types
 * @desc Get all available indicator types
 * @access Private
 */
router.get('/types', indicatorController.getIndicatorTypes);

/**
 * @route GET /api/v1/indicators/conditions
 * @desc Get all available indicator conditions
 * @access Private
 */
router.get('/conditions', indicatorController.getIndicatorConditions);

/**
 * @route GET /api/v1/indicators/status
 * @desc Get calculation status and summary
 * @access Private
 */
router.get('/status', indicatorController.getCalculationStatus);

/**
 * @route GET /api/v1/indicators/stock/:stockId
 * @desc Get historical indicator data for a specific stock
 * @query indicatorType - Filter by indicator type (optional)
 * @query period - Filter by time period (optional)
 * @query limit - Number of records to return (default: 30)
 * @access Private
 */
router.get('/stock/:stockId', indicatorController.getStockIndicators);

/**
 * @route POST /api/v1/indicators/calculate/:stockId
 * @desc Calculate indicators for a specific stock
 * @body indicators - Array of indicators to calculate (optional)
 * @access Private
 */
router.post('/calculate/:stockId', indicatorController.calculateIndicatorsForStock);

/**
 * @route POST /api/v1/indicators/calculate-all
 * @desc Run manual calculation for all stocks
 * @access Private
 */
router.post('/calculate-all', indicatorController.calculateAllIndicators);

/**
 * @route DELETE /api/v1/indicators/cleanup
 * @desc Clean up old indicator data
 * @query days - Number of days to keep (default: 365)
 * @access Private
 */
router.delete('/cleanup', indicatorController.cleanupOldIndicators);

module.exports = router;