/**
 * Journal resource authorization middleware
 */
const httpStatus = require('http-status');
const { errorMessages } = require('../../../constants/errorMessages');
const ApiError = require('../../../core/utils/ApiError');
const { TradeJournalEntry, UserCustomTag } = require('../../../database/models');

/**
 * Middleware to ensure user can only access their own trade entries
 * @param {string} param - Request parameter containing the trade ID (default: 'tradeId')
 * @returns {Function} Express middleware
 */
const authorizeTradeJournalResource = (param = 'tradeId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[param];
      
      if (!resourceId) {
        return next();
      }
        const tradeEntry = await TradeJournalEntry.findByPk(resourceId);
      
      if (!tradeEntry) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
      }
      
      if (tradeEntry.userId !== req.user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, errorMessages.UNAUTHORIZED);
      }
      
      // Attach the trade entry to the request for possible later use
      req.tradeEntry = tradeEntry;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to ensure user can only access their own custom tags
 * @param {string} param - Request parameter containing the tag ID (default: 'tagId')
 * @returns {Function} Express middleware
 */
const authorizeCustomTagResource = (param = 'tagId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[param];
      
      if (!resourceId) {
        return next();
      }
        const customTag = await UserCustomTag.findByPk(resourceId);
      
      if (!customTag) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
      }
      
      if (customTag.userId !== req.user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, errorMessages.UNAUTHORIZED);
      }
      
      // Attach the custom tag to the request for possible later use
      req.customTag = customTag;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeTradeJournalResource,
  authorizeCustomTagResource,
};
