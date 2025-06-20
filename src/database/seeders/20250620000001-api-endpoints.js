/**
 * Seed data for API endpoints
 * Contains essential NSE data endpoints for the trading bot
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Sample API endpoints based on documentation
    const endpoints = [
      {
        url: 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050',
        purpose: 'NIFTY_50_DATA',
        description: 'Fetches Nifty 50 index stock data',
        request_info: JSON.stringify({
          method: 'GET',
          timeout: 10000,
          retry_attempts: 3
        }),
        response_info: JSON.stringify({
          expected_status: 200,
          content_type: 'application/json',
          data_path: 'data'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        url: 'https://www.nseindia.com/api/equity-stockIndices?index=BANK%20NIFTY',
        purpose: 'BANK_NIFTY_DATA',
        description: 'Fetches Bank Nifty stock data',
        request_info: JSON.stringify({
          method: 'GET',
          timeout: 10000,
          retry_attempts: 3
        }),
        response_info: JSON.stringify({
          expected_status: 200,
          content_type: 'application/json',
          data_path: 'data'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        url: 'https://www.nseindia.com/api/quote-equity?symbol={symbol}',
        purpose: 'STOCK_QUOTE',
        description: 'Fetches real-time stock quote for a specific symbol',
        request_info: JSON.stringify({
          method: 'GET',
          timeout: 5000,
          retry_attempts: 3,
          rate_limit_per_minute: 20
        }),
        response_info: JSON.stringify({
          expected_status: 200,
          content_type: 'application/json',
          data_path: 'data'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        url: 'https://www.nseindia.com/api/market-status',
        purpose: 'MARKET_STATUS',
        description: 'Checks if the market is currently open or closed',
        request_info: JSON.stringify({
          method: 'GET',
          timeout: 5000,
          retry_attempts: 5
        }),
        response_info: JSON.stringify({
          expected_status: 200,
          content_type: 'application/json',
          data_path: 'marketState'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        url: 'https://www.nseindia.com/api/historical/cm/equity?symbol={symbol}&series=[%22EQ%22]&from={from_date}&to={to_date}',
        purpose: 'HISTORICAL_DATA',
        description: 'Fetches historical price data for a specific stock',
        request_info: JSON.stringify({
          method: 'GET',
          timeout: 15000,
          retry_attempts: 3,
          rate_limit_per_minute: 10
        }),
        response_info: JSON.stringify({
          expected_status: 200,
          content_type: 'application/json',
          data_path: 'data'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('st_api_endpoints', endpoints, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_api_endpoints', null, {});
  }
};
