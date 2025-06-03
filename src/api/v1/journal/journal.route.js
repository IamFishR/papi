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
  .post(auth(), validate(journalValidation.createTradeEntry), journalController.createTradeEntry)
  .get(auth(), validate(journalValidation.getTradeEntries), journalController.getTradeEntries);

router
  .route('/trades/:tradeId')
  .get(auth(), validate(journalValidation.getTradeEntry), authorizeTradeJournalResource(), journalController.getTradeEntryById)
  .put(auth(), validate(journalValidation.updateTradeEntry), authorizeTradeJournalResource(), journalController.updateTradeEntry)
  .delete(auth(), validate(journalValidation.deleteTradeEntry), authorizeTradeJournalResource(), journalController.deleteTradeEntry);

// User Custom Tag routes
router
  .route('/tags')
  .get(auth(), validate(journalValidation.getUserCustomTags), journalController.getUserCustomTags)
  .post(auth(), validate(journalValidation.createUserCustomTag), journalController.createUserCustomTag);

// Add route for specific tag operations if needed
router
  .route('/tags/:tagId')
  .put(auth(), authorizeCustomTagResource(), journalController.updateUserCustomTag)
  .delete(auth(), authorizeCustomTagResource(), journalController.deleteUserCustomTag);

module.exports = router;
