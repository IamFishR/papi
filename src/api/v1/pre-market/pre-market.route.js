/**
 * Pre-Market Data routes
 */
const express = require('express');
const validate = require('../../../core/middleware/validate');
const auth = require('../../../core/middleware/auth');
const preMarketValidation = require('./pre-market.validation');
const preMarketController = require('./pre-market.controller');

const router = express.Router();

// Pre-market summary and movers (public read access)
router
  .route('/summary')
  .get(
    auth(),
    validate(preMarketValidation.getPreMarketSummary),
    preMarketController.getPreMarketSummary
  );

router
  .route('/movers')
  .get(
    auth(),
    validate(preMarketValidation.getPreMarketMovers),
    preMarketController.getPreMarketMovers
  );

// Pre-market data management (admin access for write operations)
router
  .route('/data')
  .post(
    auth('admin'),
    validate(preMarketValidation.addPreMarketData),
    preMarketController.addPreMarketData
  );

router
  .route('/data/:preMarketDataId')
  .put(
    auth('admin'),
    validate(preMarketValidation.updatePreMarketData),
    preMarketController.updatePreMarketData
  );

router
  .route('/data/:preMarketDataId/orders')
  .post(
    auth('admin'),
    validate(preMarketValidation.addPreMarketOrders),
    preMarketController.addPreMarketOrders
  );

// Multiple stocks data (authenticated users)
router
  .route('/multiple-stocks')
  .post(
    auth(),
    validate(preMarketValidation.getMultipleStocksPreMarketData),
    preMarketController.getMultipleStocksPreMarketData
  );

// Stock-specific pre-market data
router
  .route('/stocks/:stockId')
  .get(
    auth(),
    validate(preMarketValidation.getPreMarketData),
    preMarketController.getPreMarketData
  );

router
  .route('/stocks/:stockId/iep')
  .get(
    auth(),
    validate(preMarketValidation.getCurrentIEP),
    preMarketController.getCurrentIEP
  );

router
  .route('/stocks/:stockId/history')
  .get(
    auth(),
    validate(preMarketValidation.getHistoricalPreMarketData),
    preMarketController.getHistoricalPreMarketData
  );

module.exports = router;