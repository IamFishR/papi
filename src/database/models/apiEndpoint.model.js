/**
 * API Endpoint model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApiEndpoint = sequelize.define('ApiEndpoint', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
        len: [1, 500],
      },
    },
    purpose: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
        isUppercase: true, // Enforce uppercase for consistency
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'request_info',
      validate: {
        isValidRequestInfo(value) {
          if (value !== null && value !== undefined) {
            if (typeof value !== 'object') {
              throw new Error('Request info must be a JSON object');
            }
            // Validate required fields if present
            if (value.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(value.method)) {
              throw new Error('Invalid HTTP method in request info');
            }
            if (value.timeout && (typeof value.timeout !== 'number' || value.timeout < 1000)) {
              throw new Error('Timeout must be a number >= 1000ms');
            }
            if (value.retry_attempts && (typeof value.retry_attempts !== 'number' || value.retry_attempts < 0)) {
              throw new Error('Retry attempts must be a non-negative number');
            }
          }
        },
      },
    },
    responseInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'response_info',
      validate: {
        isValidResponseInfo(value) {
          if (value !== null && value !== undefined) {
            if (typeof value !== 'object') {
              throw new Error('Response info must be a JSON object');
            }
            // Validate expected status if present
            if (value.expected_status && (typeof value.expected_status !== 'number' || value.expected_status < 100 || value.expected_status > 599)) {
              throw new Error('Expected status must be a valid HTTP status code');
            }
          }
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'st_api_endpoints',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['purpose'],
        unique: true, // Ensure unique purpose identifiers
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['purpose', 'is_active'],
      },
    ],
    hooks: {
      beforeValidate: (endpoint) => {
        // Normalize purpose to uppercase
        if (endpoint.purpose) {
          endpoint.purpose = endpoint.purpose.toUpperCase();
        }
      },
    },
  });

  // Static methods for common queries
  ApiEndpoint.findActive = function() {
    return this.findAll({
      where: {
        isActive: true,
      },
      order: [['purpose', 'ASC']],
    });
  };

  ApiEndpoint.findByPurpose = function(purpose) {
    return this.findOne({
      where: {
        purpose: purpose.toUpperCase(),
        isActive: true,
      },
    });
  };

  ApiEndpoint.getDefaultRequestConfig = function() {
    return {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
      },
      timeout: 10000,
      retry_attempts: 3,
      retry_delay_ms: 5000,
      rate_limit_per_minute: 12,
    };
  };

  ApiEndpoint.getDefaultResponseConfig = function() {
    return {
      expected_status: 200,
      content_type: 'application/json',
      data_structure: 'object',
      key_fields: [],
      data_path: null,
    };
  };

  // Instance methods
  ApiEndpoint.prototype.getRequestConfig = function() {
    return {
      ...ApiEndpoint.getDefaultRequestConfig(),
      ...(this.requestInfo || {}),
    };
  };

  ApiEndpoint.prototype.getResponseConfig = function() {
    return {
      ...ApiEndpoint.getDefaultResponseConfig(),
      ...(this.responseInfo || {}),
    };
  };

  // No associations needed for this model currently
  ApiEndpoint.associate = (models) => {
    // Future associations can be added here if needed
  };

  return ApiEndpoint;
};