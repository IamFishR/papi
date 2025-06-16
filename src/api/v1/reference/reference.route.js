/**
 * Reference data routes
 */
const express = require('express');
const authenticate = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const referenceValidation = require('./reference.validation');
const referenceController = require('./reference.controller');
const { catchAsync } = require('../../../core/utils/catchAsync');

const router = express.Router();

// Get reference data with type parameter support for all lookup tables
router.get(
  '/',
  authenticate,
  validate(referenceValidation.getReferenceData, 'query'),
  catchAsync(referenceController.getReferenceData)
);

module.exports = router;
