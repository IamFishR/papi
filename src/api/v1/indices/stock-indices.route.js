/**
 * Stock Indices routes
 */
const express = require('express');
const validate = require('../../../core/middleware/validate');
const auth = require('../../../core/middleware/auth');
const stockIndicesValidation = require('./stock-indices.validation');
const stockIndicesController = require('./stock-indices.controller');

const router = express.Router();

// Index management routes
router
  .route('/')
  .get(
    auth(),
    validate(stockIndicesValidation.listIndices),
    stockIndicesController.getAllIndices
  )
  .post(
    auth('admin'),
    validate(stockIndicesValidation.createIndex),
    stockIndicesController.createIndex
  );

// Get indices by type
router
  .route('/type/:type')
  .get(
    auth(),
    validate(stockIndicesValidation.getIndicesByType),
    stockIndicesController.getIndicesByType
  );

// Stock-specific memberships
router
  .route('/stocks/:stockId/memberships')
  .get(
    auth(),
    validate(stockIndicesValidation.getStockIndexMemberships),
    stockIndicesController.getStockIndexMemberships
  );

// Individual index routes
router
  .route('/:id')
  .get(
    auth(),
    validate(stockIndicesValidation.getIndexById),
    stockIndicesController.getIndexById
  )
  .put(
    auth('admin'),
    validate(stockIndicesValidation.updateIndex),
    stockIndicesController.updateIndex
  )
  .delete(
    auth('admin'),
    validate(stockIndicesValidation.deleteIndex),
    stockIndicesController.deleteIndex
  );

// Index memberships management
router
  .route('/:id/memberships')
  .get(
    auth(),
    validate(stockIndicesValidation.getIndexMemberships),
    stockIndicesController.getIndexMemberships
  );

router
  .route('/:id/composition')
  .get(
    auth(),
    validate(stockIndicesValidation.getIndexById),
    stockIndicesController.getIndexCompositionSummary
  );

// Stock membership management
router
  .route('/:id/stocks')
  .post(
    auth('admin'),
    validate(stockIndicesValidation.addStockToIndex),
    stockIndicesController.addStockToIndex
  );

router
  .route('/:id/stocks/:stockId')
  .delete(
    auth('admin'),
    validate(stockIndicesValidation.removeStockFromIndex),
    stockIndicesController.removeStockFromIndex
  );

// Weight management
router
  .route('/:id/weights')
  .put(
    auth('admin'),
    validate(stockIndicesValidation.updateIndexWeights),
    stockIndicesController.updateIndexWeights
  );

module.exports = router;