/**
 * NSE API Service - handles data fetching from NSE and other external APIs
 * Supports multiple endpoints with database-driven configuration
 */
const logger = require('../../config/logger');
const { ApiEndpoint } = require('../../database/models');

class NSEService {
  constructor() {
    this.rateLimiters = new Map(); // Track rate limits per endpoint
  }

  /**
   * Fetch all active API endpoints from database
   * @returns {Promise<Array>} Array of active API endpoints
   */
  async getActiveEndpoints() {
    try {
      const endpoints = await ApiEndpoint.findActive();
      logger.info(`Found ${endpoints.length} active API endpoints`);
      return endpoints;
    } catch (error) {
      logger.error('Error fetching active endpoints:', error);
      throw new Error('Failed to fetch API endpoints from database');
    }
  }

  /**
   * Get specific endpoint by purpose
   * @param {string} purpose - Endpoint purpose identifier
   * @returns {Promise<Object|null>} API endpoint or null if not found
   */
  async getEndpointByPurpose(purpose) {
    try {
      const endpoint = await ApiEndpoint.findByPurpose(purpose);
      if (!endpoint) {
        logger.warn(`No active endpoint found for purpose: ${purpose}`);
      }
      return endpoint;
    } catch (error) {
      logger.error(`Error fetching endpoint for purpose ${purpose}:`, error);
      throw new Error(`Failed to fetch endpoint: ${purpose}`);
    }
  }

  /**
   * Check rate limit for an endpoint
   * @param {Object} endpoint - API endpoint object
   * @returns {boolean} True if within rate limit, false otherwise
   */
  checkRateLimit(endpoint) {
    const config = endpoint.getRequestConfig();
    const rateLimit = config.rate_limit_per_minute || 12;
    const key = endpoint.purpose;
    
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, {
        requests: [],
        limit: rateLimit
      });
    }

    const limiter = this.rateLimiters.get(key);
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old requests
    limiter.requests = limiter.requests.filter(time => time > oneMinuteAgo);

    // Check if we can make another request
    if (limiter.requests.length >= limiter.limit) {
      logger.warn(`Rate limit exceeded for endpoint: ${endpoint.purpose}`);
      return false;
    }

    // Add current request
    limiter.requests.push(now);
    return true;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   * @param {Object} endpoint - API endpoint object
   * @returns {Promise<Object>} API response data
   */
  async makeRequest(endpoint) {
    const requestConfig = endpoint.getRequestConfig();
    const responseConfig = endpoint.getResponseConfig();
    
    const {
      method = 'GET',
      headers = {},
      timeout = 10000,
      retry_attempts = 3,
      retry_delay_ms = 5000
    } = requestConfig;

    let lastError;
    
    for (let attempt = 1; attempt <= retry_attempts; attempt++) {
      try {
        // Check rate limit before making request
        if (!this.checkRateLimit(endpoint)) {
          logger.warn(`Skipping request due to rate limit: ${endpoint.purpose}`);
          throw new Error('Rate limit exceeded');
        }

        logger.info(`Making request to ${endpoint.purpose} (attempt ${attempt}/${retry_attempts})`);
        
        const response = await fetch(endpoint.url, {
          method,
          headers,
          signal: AbortSignal.timeout(timeout)
        });

        // Check expected status
        const expectedStatus = responseConfig.expected_status || 200;
        if (response.status !== expectedStatus) {
          throw new Error(`Unexpected status: ${response.status}, expected: ${expectedStatus}`);
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        const expectedContentType = responseConfig.content_type || 'application/json';
        if (!contentType?.includes(expectedContentType.split(';')[0])) {
          logger.warn(`Unexpected content type: ${contentType}, expected: ${expectedContentType}`);
        }

        // Parse response
        let data;
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        logger.info(`Successfully fetched data from ${endpoint.purpose}`, {
          status: response.status,
          dataSize: JSON.stringify(data).length,
          attempt
        });

        return this.validateAndTransformResponse(data, endpoint);

      } catch (error) {
        lastError = error;
        logger.error(`Request failed for ${endpoint.purpose} (attempt ${attempt}/${retry_attempts}):`, {
          error: error.message,
          url: endpoint.url
        });

        // Don't retry on rate limit errors
        if (error.message.includes('Rate limit exceeded')) {
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < retry_attempts) {
          logger.info(`Waiting ${retry_delay_ms}ms before retry...`);
          await this.sleep(retry_delay_ms);
        }
      }
    }

    // All retries failed
    logger.error(`All retry attempts failed for ${endpoint.purpose}`, {
      finalError: lastError.message,
      attempts: retry_attempts
    });
    throw new Error(`Failed to fetch data from ${endpoint.purpose} after ${retry_attempts} attempts: ${lastError.message}`);
  }

  /**
   * Validate and transform API response according to endpoint configuration
   * @param {*} data - Raw API response data
   * @param {Object} endpoint - API endpoint object
   * @returns {Object} Validated and transformed data
   */
  validateAndTransformResponse(data, endpoint) {
    const responseConfig = endpoint.getResponseConfig();
    const { data_path, key_fields = [] } = responseConfig;

    try {
      // Extract data from specified path
      let extractedData = data;
      if (data_path) {
        const paths = data_path.split('.');
        for (const path of paths) {
          if (extractedData && typeof extractedData === 'object' && path in extractedData) {
            extractedData = extractedData[path];
          } else {
            logger.warn(`Data path not found: ${data_path} in response from ${endpoint.purpose}`);
            break;
          }
        }
      }

      // Validate key fields if specified
      if (key_fields.length > 0 && Array.isArray(extractedData)) {
        const sampleItem = extractedData[0];
        const missingFields = key_fields.filter(field => !(field in sampleItem));
        if (missingFields.length > 0) {
          logger.warn(`Missing expected fields in response from ${endpoint.purpose}:`, missingFields);
        }
      }

      return {
        success: true,
        endpoint: endpoint.purpose,
        timestamp: new Date(),
        dataCount: Array.isArray(extractedData) ? extractedData.length : 1,
        data: extractedData,
        metadata: {
          url: endpoint.url,
          responseSize: JSON.stringify(data).length,
          extractedDataSize: JSON.stringify(extractedData).length
        }
      };

    } catch (error) {
      logger.error(`Error validating response from ${endpoint.purpose}:`, error);
      throw new Error(`Response validation failed: ${error.message}`);
    }
  }

  /**
   * Fetch data from a specific endpoint by purpose
   * @param {string} purpose - Endpoint purpose identifier
   * @returns {Promise<Object>} Fetched and validated data
   */
  async fetchByPurpose(purpose) {
    const endpoint = await this.getEndpointByPurpose(purpose);
    if (!endpoint) {
      throw new Error(`No active endpoint found for purpose: ${purpose}`);
    }

    return await this.makeRequest(endpoint);
  }

  /**
   * Fetch data from all active endpoints
   * @returns {Promise<Array>} Array of results from all endpoints
   */
  async fetchFromAllEndpoints() {
    const endpoints = await this.getActiveEndpoints();
    
    if (endpoints.length === 0) {
      logger.warn('No active endpoints found');
      return [];
    }

    const results = [];
    const errors = [];

    // Process endpoints sequentially to respect rate limits
    for (const endpoint of endpoints) {
      try {
        const result = await this.makeRequest(endpoint);
        results.push(result);
        
        // Small delay between endpoints to avoid overwhelming servers
        await this.sleep(1000);
        
      } catch (error) {
        logger.error(`Failed to fetch from endpoint ${endpoint.purpose}:`, error);
        errors.push({
          endpoint: endpoint.purpose,
          error: error.message
        });
      }
    }

    logger.info(`Fetch summary: ${results.length} successful, ${errors.length} failed`);
    
    return {
      successful: results,
      failed: errors,
      summary: {
        total: endpoints.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }

  /**
   * Test connection to a specific endpoint
   * @param {string} purpose - Endpoint purpose identifier
   * @returns {Promise<Object>} Test result
   */
  async testEndpoint(purpose) {
    const startTime = Date.now();
    
    try {
      const result = await this.fetchByPurpose(purpose);
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        purpose,
        duration,
        dataCount: result.dataCount,
        message: `Successfully fetched data in ${duration}ms`
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        purpose,
        duration,
        error: error.message,
        message: `Test failed after ${duration}ms: ${error.message}`
      };
    }
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status information
   */
  async getHealthStatus() {
    try {
      const endpoints = await this.getActiveEndpoints();
      const rateLimitStatus = Array.from(this.rateLimiters.entries()).map(([key, limiter]) => ({
        endpoint: key,
        currentRequests: limiter.requests.length,
        limit: limiter.limit,
        percentage: Math.round((limiter.requests.length / limiter.limit) * 100)
      }));

      return {
        status: 'healthy',
        activeEndpoints: endpoints.length,
        rateLimiters: rateLimitStatus,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// Create singleton instance
const nseService = new NSEService();

module.exports = nseService;