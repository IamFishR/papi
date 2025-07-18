const express = require('express');
const auth = require('../../../core/middlewares/authenticate');
const validate = require('../../../core/middlewares/requestValidator');
const { authorizeTradeJournalResource, authorizeCustomTagResource } = require('./journal.middleware');
const journalController = require('./journal.controller');
const journalValidation = require('./journal.validation');

const router = express.Router();

// Trade Journal Entry routes
router
  .route('/trades')
  .post(auth, validate(journalValidation.createTradeEntry), journalController.createTradeEntry)
  .get(auth, validate(journalValidation.getTradeEntriesQuery, 'query'), journalController.getTradeEntries);

router
  .route('/trades/:tradeId')
  .get(auth, validate(journalValidation.getTradeEntryParams, 'params'), authorizeTradeJournalResource(), journalController.getTradeEntryById)
  .put(auth, validate(journalValidation.updateTradeEntryParams, 'params'), validate(journalValidation.updateTradeEntryBody), authorizeTradeJournalResource(), journalController.updateTradeEntry)
  .delete(auth, validate(journalValidation.deleteTradeEntryParams, 'params'), authorizeTradeJournalResource(), journalController.deleteTradeEntry);

// Step-by-step trade journal routes
router
  .route('/trades-stepwise')
  .post(auth, validate(journalValidation.createTradeEntryStepByStep), journalController.createTradeEntryStepByStep);

router
  .route('/trades/:tradeId/step/:stepNumber')
  .put(auth, validate(journalValidation.updateTradeEntryStepParams, 'params'), validate(journalValidation.updateTradeEntryStepBody), journalController.updateTradeEntryStep);

// Additional step-by-step routes
router
  .route('/trades/incomplete')
  .get(auth, validate(journalValidation.getIncompleteTradeEntriesQuery, 'query'), journalController.getIncompleteTradeEntries);

router
  .route('/stats/completion')
  .get(auth, journalController.getCompletionStats);

// User Custom Tag routes
router
  .route('/tags')
  .get(auth, validate(journalValidation.getUserCustomTagsQuery, 'query'), journalController.getUserCustomTags)
  .post(auth, validate(journalValidation.createUserCustomTag), journalController.createUserCustomTag);

// Add route for specific tag operations if needed
router
  .route('/tags/:tagId')
  .put(auth, validate(journalValidation.updateUserCustomTagParams, 'params'), validate(journalValidation.updateUserCustomTagBody), authorizeCustomTagResource(), journalController.updateUserCustomTag)
  .delete(auth, validate(journalValidation.deleteUserCustomTagParams, 'params'), authorizeCustomTagResource(), journalController.deleteUserCustomTag);

module.exports = router;
