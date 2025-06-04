const httpStatus = require('http-status');
const { catchAsync } = require('../../../core/utils/catchAsync');
const journalService = require('./journal.service');
const { apiResponse } = require('../../../core/utils/apiResponse');
const { successMessages } = require('../../../constants/successMessages');

/**
 * Create a new trade journal entry
 */
const createTradeEntry = catchAsync(async (req, res) => {
  const tradeEntry = await journalService.createTradeEntry(req.user.id, req.body);
  return apiResponse(res, httpStatus.CREATED, successMessages.CREATED, tradeEntry);
});

/**
 * Get all trade entries for a user with pagination, filtering, and sorting
 */
const getTradeEntries = catchAsync(async (req, res) => {
  const filter = { userId: req.user.id };
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };

  // Add additional filters if provided
  if (req.query.instrument) filter.instrument = req.query.instrument;
  if (req.query.outcome) filter.outcome = req.query.outcome;
  if (req.query.dateFrom) filter.executionDateFrom = req.query.dateFrom;
  if (req.query.dateTo) filter.executionDateTo = req.query.dateTo;

  const result = await journalService.getTradeEntries(filter, options);
  return apiResponse(res, httpStatus.OK, successMessages.FETCHED, result);
});

/**
 * Get a specific trade entry by ID
 */
const getTradeEntryById = catchAsync(async (req, res) => {
  // Using req.tradeEntry from the middleware if available
  const tradeEntry = req.tradeEntry || await journalService.getTradeEntryById(req.params.tradeId, req.user.id);
  return apiResponse(res, httpStatus.OK, successMessages.FETCHED, tradeEntry);
});

/**
 * Update a trade entry
 */
const updateTradeEntry = catchAsync(async (req, res) => {
  // Using req.tradeEntry from the middleware if available
  let tradeEntry;
  if (req.tradeEntry) {
    tradeEntry = await journalService.updateTradeEntryDirect(req.tradeEntry, req.body);
  } else {
    tradeEntry = await journalService.updateTradeEntry(req.params.tradeId, req.user.id, req.body);
  }
  return apiResponse(res, httpStatus.OK, successMessages.UPDATED, tradeEntry);
});

/**
 * Delete a trade entry
 */
const deleteTradeEntry = catchAsync(async (req, res) => {
  // Using req.tradeEntry from the middleware if available
  if (req.tradeEntry) {
    await journalService.deleteTradeEntryDirect(req.tradeEntry);
  } else {
    await journalService.deleteTradeEntry(req.params.tradeId, req.user.id);
  }
  return apiResponse(res, httpStatus.OK, successMessages.DELETED);
});

/**
 * Get user custom tags filtered by type
 */
const getUserCustomTags = catchAsync(async (req, res) => {
  const tags = await journalService.getUserCustomTags(req.user.id, req.query.type);
  return apiResponse(res, httpStatus.OK, successMessages.FETCHED, tags);
});

/**
 * Create a new custom tag for the user
 */
const createUserCustomTag = catchAsync(async (req, res) => {
  const tag = await journalService.createUserCustomTag(req.user.id, req.body);
  return apiResponse(res, httpStatus.CREATED, successMessages.CREATED, tag);
});

/**
 * Update a custom tag
 */
const updateUserCustomTag = catchAsync(async (req, res) => {
  // Using req.customTag from the middleware if available
  let tag;
  if (req.customTag) {
    tag = await journalService.updateUserCustomTagDirect(req.customTag, req.body);
  } else {
    tag = await journalService.updateUserCustomTag(req.params.tagId, req.user.id, req.body);
  }
  return apiResponse(res, httpStatus.OK, successMessages.UPDATED, tag);
});

/**
 * Delete a custom tag
 */
const deleteUserCustomTag = catchAsync(async (req, res) => {
  // Using req.customTag from the middleware if available
  if (req.customTag) {
    await journalService.deleteUserCustomTagDirect(req.customTag);
  } else {
    await journalService.deleteUserCustomTag(req.params.tagId, req.user.id);
  }
  return apiResponse(res, httpStatus.OK, successMessages.DELETED);
});

module.exports = {
  createTradeEntry,
  getTradeEntries,
  getTradeEntryById,
  updateTradeEntry,
  deleteTradeEntry,
  getUserCustomTags,
  createUserCustomTag,
  updateUserCustomTag,
  deleteUserCustomTag,
};
