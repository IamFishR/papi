const httpStatus = require('http-status');
const { TradeJournalEntry, UserCustomTag } = require('../../../database/models');
const ApiError = require('../../../core/utils/ApiError');
const { errorMessages } = require('../../../constants/errorMessages');

/**
 * Create a new trade journal entry
 * @param {string} userId - The ID of the user creating the entry
 * @param {Object} entryData - The trade entry data
 * @returns {Promise<Object>} - The created trade entry
 */
const createTradeEntry = async (userId, entryData) => {
  return TradeJournalEntry.create({ 
    ...entryData,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

/**
 * Get trade entries for a user with pagination, filtering, and sorting
 * @param {Object} filter - Filter criteria (userId, instrument, etc.)
 * @param {Object} options - Query options (sort, pagination)
 * @returns {Promise<Object>} - Paginated result with trade entries
 */
const getTradeEntries = async (filter, options) => {
  const { limit, page, sortBy } = options;
  const offset = page ? (page - 1) * limit : 0;
  
  // Prepare the query
  const query = {
    where: { userId: filter.userId },
    limit,
    offset,
  };
  
  // Add additional filters if provided
  if (filter.instrument) query.where.instrument = filter.instrument;
  if (filter.outcome) query.where.outcome = filter.outcome;
  if (filter.executionDateFrom || filter.executionDateTo) {
    query.where.executionDate = {};
    if (filter.executionDateFrom) query.where.executionDate.$gte = filter.executionDateFrom;
    if (filter.executionDateTo) query.where.executionDate.$lte = filter.executionDateTo;
  }
  
  // Add sorting if provided
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    query.order = [[field, order === 'desc' ? 'DESC' : 'ASC']];
  } else {
    // Default sorting by execution date, newest first
    query.order = [['executionDate', 'DESC']];
  }
  
  // Execute query
  const { count, rows } = await TradeJournalEntry.findAndCountAll(query);
  
  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get a specific trade entry by ID
 * @param {string} tradeId - The ID of the trade entry
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The trade entry
 */
const getTradeEntryById = async (tradeId, userId) => {
  const tradeEntry = await TradeJournalEntry.findOne({ 
    where: { 
      id: tradeId,
      userId
    } 
  });
  
  if (!tradeEntry) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
  }
  
  return tradeEntry;
};

/**
 * Update a trade entry
 * @param {string} tradeId - The ID of the trade entry
 * @param {string} userId - The ID of the user
 * @param {Object} updateData - The updated trade entry data
 * @returns {Promise<Object>} - The updated trade entry
 */
const updateTradeEntry = async (tradeId, userId, updateData) => {
  const tradeEntry = await getTradeEntryById(tradeId, userId);
  
  // Update the trade entry
  Object.assign(tradeEntry, {
    ...updateData,
    updatedAt: new Date()
  });
  await tradeEntry.save();
  
  return tradeEntry;
};

/**
 * Update a trade entry directly (for use with middleware)
 * @param {Object} tradeEntry - The trade entry object
 * @param {Object} updateData - The updated trade entry data
 * @returns {Promise<Object>} - The updated trade entry
 */
const updateTradeEntryDirect = async (tradeEntry, updateData) => {
  // Update the trade entry
  Object.assign(tradeEntry, {
    ...updateData,
    updatedAt: new Date()
  });
  await tradeEntry.save();
  
  return tradeEntry;
};

/**
 * Delete a trade entry
 * @param {string} tradeId - The ID of the trade entry
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteTradeEntry = async (tradeId, userId) => {
  const tradeEntry = await getTradeEntryById(tradeId, userId);
  await tradeEntry.destroy();
  return true;
};

/**
 * Delete a trade entry directly (for use with middleware)
 * @param {Object} tradeEntry - The trade entry object
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteTradeEntryDirect = async (tradeEntry) => {
  await tradeEntry.destroy();
  return true;
};

/**
 * Get user custom tags filtered by type
 * @param {string} userId - The ID of the user
 * @param {string} tagType - The type of tag to filter by (optional)
 * @returns {Promise<Array>} - Array of user custom tags
 */
const getUserCustomTags = async (userId, tagType) => {
  const query = { where: { userId } };
  
  if (tagType) {
    query.where.tagType = tagType;
  }
  
  return UserCustomTag.findAll(query);
};

/**
 * Create a new custom tag for the user
 * @param {string} userId - The ID of the user
 * @param {Object} tagData - The tag data
 * @returns {Promise<Object>} - The created tag
 */
const createUserCustomTag = async (userId, tagData) => {
  // Check if tag already exists for this user and type
  const existingTag = await UserCustomTag.findOne({
    where: {
      userId,
      tagName: tagData.tagName,
      tagType: tagData.tagType
    }
  });
  
  if (existingTag) {
    throw new ApiError(httpStatus.CONFLICT, 'Tag already exists for this user and type');
  }
  
  return UserCustomTag.create({
    ...tagData,
    userId
  });
};

/**
 * Update a custom tag
 * @param {string} tagId - The ID of the tag
 * @param {string} userId - The ID of the user
 * @param {Object} updateData - The updated tag data
 * @returns {Promise<Object>} - The updated tag
 */
const updateUserCustomTag = async (tagId, userId, updateData) => {
  const tag = await getUserCustomTagById(tagId, userId);
  
  // Check if updated tag name already exists for this user and type
  if (updateData.tagName && updateData.tagName !== tag.tagName) {
    const existingTag = await UserCustomTag.findOne({
      where: {
        userId,
        tagName: updateData.tagName,
        tagType: tag.tagType
      }
    });
    
    if (existingTag) {
      throw new ApiError(httpStatus.CONFLICT, 'Tag name already exists for this user and type');
    }
  }
  
  // Update the tag
  Object.assign(tag, updateData);
  await tag.save();
  
  return tag;
};

/**
 * Update a custom tag directly (for use with middleware)
 * @param {Object} tag - The tag object
 * @param {Object} updateData - The updated tag data
 * @returns {Promise<Object>} - The updated tag
 */
const updateUserCustomTagDirect = async (tag, updateData) => {
  // Check if updated tag name already exists for this user and type
  if (updateData.tagName && updateData.tagName !== tag.tagName) {
    const existingTag = await UserCustomTag.findOne({
      where: {
        userId: tag.userId,
        tagName: updateData.tagName,
        tagType: tag.tagType
      }
    });
    
    if (existingTag) {
      throw new ApiError(httpStatus.CONFLICT, 'Tag name already exists for this user and type');
    }
  }
  
  // Update the tag
  Object.assign(tag, updateData);
  await tag.save();
  
  return tag;
};

/**
 * Get a custom tag by ID and user ID
 * @param {string} tagId - The ID of the tag
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The tag
 */
const getUserCustomTagById = async (tagId, userId) => {
  const tag = await UserCustomTag.findOne({
    where: {
      id: tagId,
      userId
    }
  });
  
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
  }
  
  return tag;
};

/**
 * Delete a custom tag
 * @param {string} tagId - The ID of the tag
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteUserCustomTag = async (tagId, userId) => {
  const tag = await getUserCustomTagById(tagId, userId);
  await tag.destroy();
  return true;
};

/**
 * Delete a custom tag directly (for use with middleware)
 * @param {Object} tag - The tag object
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteUserCustomTagDirect = async (tag) => {
  await tag.destroy();
  return true;
};

/**
 * Create a new trade journal entry (step-by-step version)
 * @param {string} userId - The ID of the user creating the entry
 * @param {Object} entryData - The trade entry data
 * @param {number} initialStep - The initial step to start from (default: 0)
 * @returns {Promise<Object>} - The created trade entry
 */
const createTradeEntryStepByStep = async (userId, entryData, initialStep = 0) => {
  const stepCompletionStatus = {
    0: false, 1: false, 2: false, 3: false, 4: false, 5: false
  };
  
  // If starting from a specific step, mark previous steps as incomplete
  const stepTimestamps = {};
  
  return TradeJournalEntry.create({ 
    ...entryData,
    userId,
    currentStep: initialStep,
    completedSteps: 0,
    stepCompletionStatus,
    stepTimestamps,
    isComplete: false,
    lastUpdatedStep: initialStep,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

/**
 * Update a specific step of a trade journal entry
 * @param {string} tradeId - The ID of the trade entry
 * @param {string} userId - The ID of the user
 * @param {number} stepNumber - The step number to update (0-5)
 * @param {Object} stepData - The data for this step
 * @returns {Promise<Object>} - The updated trade entry
 */
const updateTradeEntryStep = async (tradeId, userId, stepNumber, stepData) => {
  const tradeEntry = await getTradeEntryById(tradeId, userId);
  
  // Validate step number
  if (stepNumber < 0 || stepNumber > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid step number. Must be between 0 and 5.');
  }
  
  // Update the step completion status
  const currentStepStatus = tradeEntry.stepCompletionStatus || {
    0: false, 1: false, 2: false, 3: false, 4: false, 5: false
  };
  
  const currentTimestamps = tradeEntry.stepTimestamps || {};
  
  // Mark this step as completed
  currentStepStatus[stepNumber] = true;
  currentTimestamps[stepNumber] = new Date();
  
  // Calculate completed steps count
  const completedStepsCount = Object.values(currentStepStatus).filter(Boolean).length;
  
  // Determine if trade is complete (all 6 steps done)
  const isComplete = completedStepsCount === 6;
  
  // Update trade entry
  Object.assign(tradeEntry, {
    ...stepData,
    stepCompletionStatus: currentStepStatus,
    stepTimestamps: currentTimestamps,
    completedSteps: completedStepsCount,
    currentStep: isComplete ? 5 : Math.min(stepNumber + 1, 5),
    lastUpdatedStep: stepNumber,
    isComplete,
    updatedAt: new Date()
  });
  
  await tradeEntry.save();
  return tradeEntry;
};

/**
 * Get incomplete trades for a user (for dashboard/continue workflow)
 * @param {string} userId - The ID of the user
 * @param {Object} options - Query options (sort, pagination)
 * @returns {Promise<Object>} - Paginated result with incomplete trades
 */
const getIncompleteTradeEntries = async (userId, options = {}) => {
  const { limit = 10, page = 1, sortBy = 'updatedAt:desc' } = options;
  const offset = (page - 1) * limit;
  
  const query = {
    where: { 
      userId,
      isComplete: false
    },
    limit,
    offset,
  };
  
  // Add sorting
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    query.order = [[field, order === 'desc' ? 'DESC' : 'ASC']];
  }
  
  const { count, rows } = await TradeJournalEntry.findAndCountAll(query);
  
  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get completion statistics for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - Completion statistics
 */
const getCompletionStats = async (userId) => {
  const allTrades = await TradeJournalEntry.findAll({
    where: { userId },
    attributes: ['isComplete', 'completedSteps', 'stepCompletionStatus']
  });
  
  const totalTrades = allTrades.length;
  const completeTrades = allTrades.filter(trade => trade.isComplete).length;
  const incompleteTrades = totalTrades - completeTrades;
  
  // Calculate average completion percentage
  const totalStepsCompleted = allTrades.reduce((sum, trade) => sum + (trade.completedSteps || 0), 0);
  const averageCompletionPercentage = totalTrades > 0 ? (totalStepsCompleted / (totalTrades * 6)) * 100 : 0;
  
  return {
    totalTrades,
    completeTrades,
    incompleteTrades,
    averageCompletionPercentage: Math.round(averageCompletionPercentage),
  };
};

module.exports = {
  createTradeEntry,
  getTradeEntries,
  getTradeEntryById,
  updateTradeEntry,
  updateTradeEntryDirect,
  deleteTradeEntry,
  deleteTradeEntryDirect,
  getUserCustomTags,
  getUserCustomTagById,
  createUserCustomTag,
  updateUserCustomTag,
  updateUserCustomTagDirect,
  deleteUserCustomTag,
  deleteUserCustomTagDirect,
  // New step-by-step functions
  createTradeEntryStepByStep,
  updateTradeEntryStep,
  getIncompleteTradeEntries,
  getCompletionStats,
};
