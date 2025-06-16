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
  validate(watchlistsValidation.getWatchlists, 'query'),
  catchAsync(watchlistsController.getWatchlists)
);

// Create new watchlist
router.post(
  '/',
  authenticate,
  validate(watchlistsValidation.createWatchlist),
  catchAsync(watchlistsController.createWatchlist)
);

// Update watchlist
router.put(
  '/:id',
  authenticate,
  validate(watchlistsValidation.updateWatchlistParams, 'params'),
  validate(watchlistsValidation.updateWatchlist),
  catchAsync(watchlistsController.updateWatchlist)
);

// Delete watchlist
router.delete(
  '/:id',
  authenticate,
  validate(watchlistsValidation.deleteWatchlistParams, 'params'),
  catchAsync(watchlistsController.deleteWatchlist)
);

// Add stock to watchlist
router.post(
  '/:id/stocks/:stockId',
  authenticate,
  validate(watchlistsValidation.addStockToWatchlistParams, 'params'),
  catchAsync(watchlistsController.addStockToWatchlist)
);

// Remove stock from watchlist
router.delete(
  '/:id/stocks/:stockId',
  authenticate,
  validate(watchlistsValidation.removeStockFromWatchlistParams, 'params'),
  catchAsync(watchlistsController.removeStockFromWatchlist)
);

module.exports = router;
