/**
 * Stocks routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const authorize = require('../../../core/middlewares/authorize');
const validate = require('../../../core/middlewares/requestValidator');
const stocksValidation = require('./stocks.validation');
const stocksController = require('./stocks.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get all stocks with search, exchange, sector filtering
router.get(
  '/',
  authenticate,
  validate(stocksValidation.listStocks.query, 'query'),
  catchAsync(stocksController.getStocks)
);

// Bulk update prices from NSE JSON data (admin only)
router.post(
  '/bulk/prices',
  authenticate,
  authorize('admin'),
  validate(stocksValidation.bulkUpdatePrices.body),
  catchAsync(stocksController.bulkUpdatePrices)
);

// Get stock by ID
router.get(
  '/:id',
  authenticate,
  validate(stocksValidation.getStockById.params, 'params'),
  catchAsync(stocksController.getStockById)
);

// Get stock prices with date range filtering
router.get(
  '/:id/prices',
  authenticate,
  validate(stocksValidation.getStockPrices.params, 'params'),
  validate(stocksValidation.getStockPrices.query, 'query'),
  catchAsync(stocksController.getStockPrices)
);

// Add stock prices (data ingestion)
router.post(
  '/:id/prices',
  authenticate,
  validate(stocksValidation.addStockPrices.params, 'params'),
  validate(stocksValidation.addStockPrices.body),
  catchAsync(stocksController.addStockPrices)
);

// Get stock news with sentiment and date filtering
router.get(
  '/:id/news',
  authenticate,
  validate(stocksValidation.getStockNews.params, 'params'),
  validate(stocksValidation.getStockNews.query, 'query'),
  catchAsync(stocksController.getStockNews)
);

// Get stock technical indicators with type and period filtering
router.get(
  '/:id/indicators',
  authenticate,
  validate(stocksValidation.getStockIndicators.params, 'params'),
  validate(stocksValidation.getStockIndicators.query, 'query'),
  catchAsync(stocksController.getStockIndicators)
);

// Create stock (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(stocksValidation.createStock.body),
  catchAsync(stocksController.createStock)
);

// Update stock (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(stocksValidation.updateStock.params, 'params'),
  validate(stocksValidation.updateStock.body),
  catchAsync(stocksController.updateStock)
);

// Soft delete stock (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(stocksValidation.deleteStock.params, 'params'),
  catchAsync(stocksController.deleteStock)
);

module.exports = router;
