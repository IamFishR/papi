/**
 * Stocks routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const stocksValidation = require('./stocks.validation');
const stocksController = require('./stocks.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get all stocks with search, exchange, sector filtering
router.get(
  '/',
  authenticate,
  validate(stocksValidation.getStocks, 'query'),
  catchAsync(stocksController.getStocks)
);

// Get stock by ID
router.get(
  '/:id',
  authenticate,
  validate(stocksValidation.getStockById, 'params'),
  catchAsync(stocksController.getStockById)
);

// Get stock prices with date range filtering
router.get(
  '/:id/prices',
  authenticate,
  validate(stocksValidation.getStockPricesParams, 'params'),
  validate(stocksValidation.getStockPrices, 'query'),
  catchAsync(stocksController.getStockPrices)
);

// Add stock prices (data ingestion)
router.post(
  '/:id/prices',
  authenticate,
  validate(stocksValidation.addStockPricesParams, 'params'),
  validate(stocksValidation.addStockPrices),
  catchAsync(stocksController.addStockPrices)
);

// Get stock news with sentiment and date filtering
router.get(
  '/:id/news',
  authenticate,
  validate(stocksValidation.getStockNewsParams, 'params'),
  validate(stocksValidation.getStockNews, 'query'),
  catchAsync(stocksController.getStockNews)
);

// Get stock technical indicators with type and period filtering
router.get(
  '/:id/indicators',
  authenticate,
  validate(stocksValidation.getStockIndicatorsParams, 'params'),
  validate(stocksValidation.getStockIndicators, 'query'),
  catchAsync(stocksController.getStockIndicators)
);

module.exports = router;
