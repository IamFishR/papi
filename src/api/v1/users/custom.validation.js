/**
 * Custom validation functions
 */

/**
 * Custom validation for password strength
 * @param {string} value - Password to validate
 * @param {object} helpers - Joi validation helpers
 * @returns {string|Error} The value or an error
 */
const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('Password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/) || !value.match(/[^a-zA-Z0-9]/)) {
    return helpers.message('Password must contain at least 1 letter, 1 number, and 1 special character');
  }
  return value;
};

/**
 * Custom validation for UUID
 * @param {string} value - UUID to validate
 * @param {object} helpers - Joi validation helpers
 * @returns {string|Error} The value or an error
 */
const uuid = (value, helpers) => {
  if (!value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    return helpers.message('Invalid ID format');
  }
  return value;
};

module.exports = {
  password,
  uuid,
};
