/**
 * Watchlists routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const watchlistsValidation = require('./watchlists.validation');
const watchlistsController = require('./watchlists.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get all watchlists
router.get(
  '/',
  authenticate,
  validate(watchlistsValidation.listWatchlists.query, 'query'),
  catchAsync(watchlistsController.getWatchlists)
);

// Create new watchlist
router.post(
  '/',
  authenticate,
  validate(watchlistsValidation.createWatchlist.body),
  catchAsync(watchlistsController.createWatchlist)
);

// Update watchlist
router.put(
  '/:id',
  authenticate,
  validate(watchlistsValidation.updateWatchlist.params, 'params'),
  validate(watchlistsValidation.updateWatchlist.body),
  catchAsync(watchlistsController.updateWatchlist)
);

// Delete watchlist
router.delete(
  '/:id',
  authenticate,
  validate(watchlistsValidation.deleteWatchlist.params, 'params'),
  catchAsync(watchlistsController.deleteWatchlist)
);

// Add stock to watchlist
router.post(
  '/:id/stocks/:stock_id',
  authenticate,
  validate(watchlistsValidation.addStockToWatchlist.params, 'params'),
  validate(watchlistsValidation.addStockToWatchlist.body),
  catchAsync(watchlistsController.addStockToWatchlist)
);

// Remove stock from watchlist
router.delete(
  '/:id/stocks/:stock_id',
  authenticate,
  validate(watchlistsValidation.removeStockFromWatchlist.params, 'params'),
  catchAsync(watchlistsController.removeStockFromWatchlist)
);

module.exports = router;
