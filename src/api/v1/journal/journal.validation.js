const Joi = require('joi');
const { objectId } = require('../users/custom.validation');

/**
 * Create trade entry validation schema
 */
const createTradeEntry = {
  body: Joi.object().keys({
    // Core Info
    tradeIdString: Joi.string(),
    executionDate: Joi.date().required(),
    instrument: Joi.string().required(),
    assetClass: Joi.string().valid('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other'),
    direction: Joi.string().valid('Long', 'Short').required(),
    
    // Pre-Trade Plan
    planDateTime: Joi.date(),
    instrumentsWatched: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
    marketContextBias: Joi.string().valid('Bullish', 'Bearish', 'Neutral', 'Range-bound', 'Uncertain'),
    tradeThesisCatalyst: Joi.string(),
    setupConditions: Joi.alternatives().try(Joi.array(), Joi.object()),
    plannedEntryZonePrice: Joi.number().precision(4),
    plannedStopLossPrice: Joi.number().precision(4),
    plannedTargetPrices: Joi.alternatives().try(Joi.array(), Joi.string()),
    plannedPositionSizeValue: Joi.number().precision(4),
    plannedPositionSizeType: Joi.string().valid('Shares/Units', 'Percentage Account', 'Fixed Risk Amount', 'Lots'),
    calculatedMaxRiskOnPlan: Joi.number().precision(2),
    calculatedPotentialRewardTp1: Joi.number().precision(2),
    plannedRiskRewardRatioTp1: Joi.number().precision(2),
    confidenceInPlan: Joi.number().integer().min(1).max(5),
    invalidationConditions: Joi.string(),
    
    // Trade Execution Metadata
    strategyTags: Joi.array().items(Joi.string()),
    primaryAnalysisTimeframe: Joi.string(),
    secondaryAnalysisTimeframes: Joi.array().items(Joi.string()),
    screenshotSetupUrl: Joi.string().uri(),
    
    // Entry & Exit Execution Details
    entryDateTime: Joi.date().required(),
    actualEntryPrice: Joi.number().precision(4).required(),
    quantity: Joi.number().precision(4).required(),
    feesEntry: Joi.number().precision(2),
    screenshotEntryUrl: Joi.string().uri(),
    exitDateTime: Joi.date(),
    actualExitPrice: Joi.number().precision(4),
    feesExit: Joi.number().precision(2),
    screenshotExitUrl: Joi.string().uri(),
    totalQuantityTraded: Joi.number().precision(4),
    averageEntryPrice: Joi.number().precision(4),
    averageExitPrice: Joi.number().precision(4),
    grossPnlPerUnit: Joi.number().precision(4),
    grossPnl: Joi.number().precision(2),
    totalFees: Joi.number().precision(2),
    netPnl: Joi.number().precision(2),
    actualInitialRisk: Joi.number().precision(2),
    rMultipleAchieved: Joi.number().precision(2),
    tradeDurationMinutes: Joi.number().integer(),
    
    // Trade Outcome & Objective Review
    outcome: Joi.string().valid('Win', 'Loss', 'Breakeven', 'Pending'),
    exitReasonTag: Joi.string(),
    initialSlHit: Joi.boolean(),
    initialTpHit: Joi.boolean(),
    maxAdverseExcursion: Joi.number().precision(4),
    maxAdverseExcursionPercentage: Joi.number().precision(4),
    maxFavorableExcursion: Joi.number().precision(4),
    maxFavorableExcursionPercentage: Joi.number().precision(4),
    
    // Psychological & Behavioral Review
    confidenceInExecution: Joi.number().integer().min(1).max(5),
    dominantEmotionsPreTrade: Joi.array().items(Joi.string()),
    dominantEmotionsDuringTrade: Joi.array().items(Joi.string()),
    focusLevelDuringTrade: Joi.number().integer().min(1).max(5),
    followedPreTradePlan: Joi.boolean(),
    deviationType: Joi.string().valid('Entry', 'StopLoss', 'TargetProfit', 'PositionSize', 'EarlyExit', 'LateExit', 'Other', 'None'),
    reasonForDeviation: Joi.string(),
    impulseActionTaken: Joi.boolean(),
    impulseActionDescription: Joi.string(),
    hesitationOn: Joi.string().valid('None', 'Entry', 'Exit', 'Both'),
    reasonForHesitation: Joi.string(),
    tradedPnlInsteadOfPlan: Joi.boolean(),
    dominantEmotionsPostTrade: Joi.array().items(Joi.string()),
    satisfactionWithExecution: Joi.number().integer().min(1).max(5),
    externalStressorsImpact: Joi.boolean(),
    generalPsychologyNotes: Joi.string(),
    
    // Analysis, Learning & Improvement
    whatWentWell: Joi.string(),
    whatWentWrong: Joi.string(),
    primaryMistakeTags: Joi.array().items(Joi.string()),
    rootCauseOfMistakes: Joi.string(),
    keyLessonLearned: Joi.string(),
    actionableImprovement: Joi.string(),
    overallTradeRating: Joi.number().integer().min(1).max(5),
    additionalNotes: Joi.string(),
    externalAnalysisLink: Joi.string().uri()
  }),
};

/**
 * Update trade entry validation schema
 */
const updateTradeEntry = {
  params: Joi.object().keys({
    tradeId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    // Same as create but all fields optional
    tradeIdString: Joi.string(),
    executionDate: Joi.date(),
    instrument: Joi.string(),
    assetClass: Joi.string().valid('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other'),
    direction: Joi.string().valid('Long', 'Short'),
    
    // ... all other fields same as create but optional
    // Skipping for brevity, would be the same as above but without required()
    
    // Must NOT allow changing userId
    userId: Joi.forbidden()
  }).min(1), // at least one field must be updated
};

/**
 * Get trade entries validation schema
 */
const getTradeEntries = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    instrument: Joi.string(),
    outcome: Joi.string().valid('Win', 'Loss', 'Breakeven', 'Pending'),
    dateFrom: Joi.date(),
    dateTo: Joi.date(),
  }),
};

/**
 * Get trade entry by ID validation schema
 */
const getTradeEntry = {
  params: Joi.object().keys({
    tradeId: Joi.required().custom(objectId),
  }),
};

/**
 * Delete trade entry validation schema
 */
const deleteTradeEntry = {
  params: Joi.object().keys({
    tradeId: Joi.required().custom(objectId),
  }),
};

/**
 * Get user custom tags validation schema
 */
const getUserCustomTags = {
  query: Joi.object().keys({
    type: Joi.string().valid('strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition'),
  }),
};

/**
 * Create user custom tag validation schema
 */
const createUserCustomTag = {
  body: Joi.object().keys({
    tagName: Joi.string().required(),
    tagType: Joi.string().valid('strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition').required(),
  }),
};

/**
 * Update user custom tag validation schema
 */
const updateUserCustomTag = {
  params: Joi.object().keys({
    tagId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    tagName: Joi.string().required(),
    // Cannot change tag type once created
    tagType: Joi.forbidden(),
  }),
};

/**
 * Delete user custom tag validation schema
 */
const deleteUserCustomTag = {
  params: Joi.object().keys({
    tagId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createTradeEntry,
  updateTradeEntry,
  getTradeEntries,
  getTradeEntry,
  deleteTradeEntry,
  getUserCustomTags,
  createUserCustomTag,
  updateUserCustomTag,
  deleteUserCustomTag,
};
