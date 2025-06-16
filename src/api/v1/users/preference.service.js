/**
 * User Preference service - handles business logic for user preference operations
 */
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User preferences
 */
const getUserPreferences = async (userId) => {
  // Find user preferences
  let userPreference = await db.UserPreference.findOne({
    where: { userId },
    include: [
      { model: db.RiskToleranceLevel, as: 'riskToleranceLevel' }
    ]
  });

  // If user preferences don't exist, create default preferences
  if (!userPreference) {
    userPreference = await createDefaultUserPreferences(userId);
  }

  return userPreference;
};

/**
 * Create default user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created user preferences
 */
const createDefaultUserPreferences = async (userId) => {
  // Get default risk tolerance level
  const riskToleranceLevel = await db.RiskToleranceLevel.findOne({
    where: { name: 'moderate' }
  });

  if (!riskToleranceLevel) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Default risk tolerance level not found');
  }

  // Create default preferences
  const userPreference = await db.UserPreference.create({
    userId,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    riskToleranceLevelId: riskToleranceLevel.id,
    defaultCurrencyId: 1, // Assuming USD is ID 1
    notificationFrequency: 'immediate',
    dailySummaryEnabled: true,
    weeklySummaryEnabled: true,
    dashboardLayout: JSON.stringify({
      widgets: [
        { id: 'watchlist', position: 'top-left', expanded: true },
        { id: 'alerts', position: 'top-right', expanded: true },
        { id: 'performance', position: 'bottom-left', expanded: true },
        { id: 'news', position: 'bottom-right', expanded: true }
      ]
    })
  });

  // Get the created preferences with related data
  return db.UserPreference.findOne({
    where: { userId },
    include: [
      { model: db.RiskToleranceLevel, as: 'riskToleranceLevel' }
    ]
  });
};

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferencesData - Updated preferences data
 * @returns {Promise<Object>} Updated user preferences
 */
const updateUserPreferences = async (userId, preferencesData) => {
  // Find user preferences
  let userPreference = await db.UserPreference.findOne({
    where: { userId }
  });

  // If user preferences don't exist, create them first
  if (!userPreference) {
    userPreference = await createDefaultUserPreferences(userId);
  }

  // Validate risk tolerance level if provided
  if (preferencesData.riskToleranceLevelId) {
    const riskToleranceLevel = await db.RiskToleranceLevel.findByPk(preferencesData.riskToleranceLevelId);
    
    if (!riskToleranceLevel) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid risk tolerance level');
    }
  }

  // Validate currency if provided
  if (preferencesData.defaultCurrencyId) {
    const currency = await db.Currency.findByPk(preferencesData.defaultCurrencyId);
    
    if (!currency) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid currency');
    }
  }

  // Update preferences
  await userPreference.update(preferencesData);

  // Get the updated preferences with related data
  return db.UserPreference.findOne({
    where: { userId },
    include: [
      { model: db.RiskToleranceLevel, as: 'riskToleranceLevel' }
    ]
  });
};

module.exports = {
  getUserPreferences,
  updateUserPreferences
};
