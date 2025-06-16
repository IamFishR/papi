/**
 * User Preferences controller - handles HTTP requests for user preferences operations
 */
const { StatusCodes } = require('http-status-codes');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const userPreferencesService = require('./userPreferences.service');
const { catchAsync } = require('../../../core/utils/catchAsync');

/**
 * Get user preferences
 * @route GET /api/v1/users/preferences
 */
const getUserPreferences = catchAsync(async (req, res) => {
  const preferences = await userPreferencesService.getUserPreferences(req.user.id);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.USER_PREFERENCES_FETCHED,
    preferences
  );
});

/**
 * Update user preferences
 * @route PUT /api/v1/users/preferences
 */
const updateUserPreferences = catchAsync(async (req, res) => {
  const updateData = req.body;
  
  const preferences = await userPreferencesService.updateUserPreferences(req.user.id, updateData);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.USER_PREFERENCES_UPDATED,
    preferences
  );
});

module.exports = {
  getUserPreferences,
  updateUserPreferences
};
