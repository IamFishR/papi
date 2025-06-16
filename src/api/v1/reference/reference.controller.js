/**
 * Reference controller - handles HTTP requests for reference data operations
 */
const { StatusCodes } = require('http-status-codes');
const apiResponse = require('../../../core/utils/apiResponse');
const successMessages = require('../../../constants/successMessages');
const referenceService = require('./reference.service');
const { catchAsync } = require('../../../core/utils/catchAsync');

/**
 * Get reference data with lookup type support
 * @route GET /api/v1/reference
 */
const getReferenceData = catchAsync(async (req, res) => {
  const { type } = req.query;
  
  const referenceData = await referenceService.getReferenceData(type);
  
  return apiResponse.success(
    res,
    StatusCodes.OK,
    successMessages.REFERENCE_DATA_FETCHED,
    referenceData
  );
});

module.exports = {
  getReferenceData
};
