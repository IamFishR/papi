/**
 * Detailed Sectors routes
 */
const express = require('express');
const validate = require('../../../core/middleware/validate');
const auth = require('../../../core/middleware/auth');
const detailedSectorValidation = require('./detailed-sectors.validation');
const detailedSectorController = require('./detailed-sectors.controller');

const router = express.Router();

// Public routes (read-only)
router
  .route('/')
  .get(
    auth(),
    validate(detailedSectorValidation.listDetailedSectors),
    detailedSectorController.getDetailedSectors
  )
  .post(
    auth('admin'),
    validate(detailedSectorValidation.createDetailedSector),
    detailedSectorController.createDetailedSector
  );

router
  .route('/hierarchy')
  .get(
    auth(),
    detailedSectorController.getSectorHierarchy
  );

router
  .route('/search')
  .get(
    auth(),
    validate(detailedSectorValidation.searchDetailedSectors),
    detailedSectorController.searchDetailedSectors
  );

router
  .route('/macro/:macroSector')
  .get(
    auth(),
    validate(detailedSectorValidation.getDetailedSectorsByMacroSector),
    detailedSectorController.getDetailedSectorsByMacroSector
  );

router
  .route('/:id')
  .get(
    auth(),
    validate(detailedSectorValidation.getDetailedSectorById),
    detailedSectorController.getDetailedSectorById
  )
  .put(
    auth('admin'),
    validate(detailedSectorValidation.updateDetailedSector),
    detailedSectorController.updateDetailedSector
  )
  .delete(
    auth('admin'),
    validate(detailedSectorValidation.deleteDetailedSector),
    detailedSectorController.deleteDetailedSector
  );

router
  .route('/:id/stocks')
  .get(
    auth(),
    validate(detailedSectorValidation.getStocksByDetailedSector),
    detailedSectorController.getStocksByDetailedSector
  );

module.exports = router;