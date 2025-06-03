/**
 * Utility for picking properties from an object
 * A lightweight alternative to lodash.pick
 */

/**
 * Creates an object composed of the picked object properties
 * @param {Object} object - The source object
 * @param {Array} keys - The property names to pick
 * @returns {Object} New object with picked properties
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = pick;
