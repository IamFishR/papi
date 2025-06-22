/**
 * Payload Format Configuration
 * Manages different payload formats and their corresponding transformers
 */

const { 
  transformNSEMarketData,
  autoTransformCompleteMarketData 
} = require('./stockPayloadTransformers');

/**
 * Payload format definitions
 * Each format has a detector function and a transformer function
 */
const PAYLOAD_FORMATS = {
  NSE_MARKET_DATA: {
    name: 'NSE Market Data',
    description: 'NSE API format with nested data structure',
    detector: (payload) => {
      return payload.data && 
             payload.data.info && 
             payload.data.priceInfo && 
             payload.source === 'NSE';
    },
    transformer: transformNSEMarketData,
    endpoints: ['/complete-market-data']
  },
  
  // Future format examples:
  BLOOMBERG_FORMAT: {
    name: 'Bloomberg Data Format',
    description: 'Bloomberg API format',
    detector: (payload) => {
      return payload.bloomberg_data && payload.security_info;
    },
    transformer: null, // To be implemented
    endpoints: ['/complete-market-data']
  },
  
  YAHOO_FINANCE_FORMAT: {
    name: 'Yahoo Finance Format',
    description: 'Yahoo Finance API format',
    detector: (payload) => {
      return payload.quoteSummary && payload.quoteSummary.result;
    },
    transformer: null, // To be implemented
    endpoints: ['/complete-market-data']
  },
  
  STANDARD_API_FORMAT: {
    name: 'Standard API Format',
    description: 'Our standard API format',
    detector: (payload) => {
      return payload.stockInfo && payload.priceInfo;
    },
    transformer: (payload) => payload, // No transformation needed
    endpoints: ['/complete-market-data']
  }
};

/**
 * Auto-detect payload format for a specific endpoint
 * @param {Object} payload - The payload to analyze
 * @param {string} endpoint - The endpoint being called
 * @returns {Object|null} Format configuration or null if not detected
 */
const detectPayloadFormat = (payload, endpoint) => {
  for (const [formatKey, formatConfig] of Object.entries(PAYLOAD_FORMATS)) {
    // Check if this format applies to the current endpoint
    if (!formatConfig.endpoints.includes(endpoint)) {
      continue;
    }
    
    // Check if the payload matches this format
    if (formatConfig.detector(payload)) {
      return {
        key: formatKey,
        ...formatConfig
      };
    }
  }
  
  return null;
};

/**
 * Get available formats for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {Array} Array of format configurations
 */
const getAvailableFormats = (endpoint) => {
  return Object.entries(PAYLOAD_FORMATS)
    .filter(([key, config]) => config.endpoints.includes(endpoint))
    .map(([key, config]) => ({
      key,
      name: config.name,
      description: config.description
    }));
};

/**
 * Transformer factory - creates endpoint-specific transformers
 * @param {string} endpoint - The endpoint path
 * @returns {Function} Transformer function for the endpoint
 */
const createTransformerForEndpoint = (endpoint) => {
  return (payload) => {
    const detectedFormat = detectPayloadFormat(payload, endpoint);
    
    if (!detectedFormat) {
      const availableFormats = getAvailableFormats(endpoint);
      throw new Error(
        `Unsupported payload format for endpoint ${endpoint}. ` +
        `Supported formats: ${availableFormats.map(f => f.name).join(', ')}`
      );
    }
    
    if (!detectedFormat.transformer) {
      throw new Error(
        `Transformer not implemented for format: ${detectedFormat.name}`
      );
    }
    
    return detectedFormat.transformer(payload);
  };
};

module.exports = {
  PAYLOAD_FORMATS,
  detectPayloadFormat,
  getAvailableFormats,
  createTransformerForEndpoint,
  // Export specific transformers for direct use
  autoTransformCompleteMarketData
};
