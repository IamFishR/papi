/**
 * API Endpoints table migration
 * Stores multiple API endpoints for different data sources
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_api_endpoints', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'API endpoint URL including query parameters',
      },
      purpose: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Short identifier for the endpoint purpose (e.g., NIFTY_50_DATA)',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Detailed description of the endpoint functionality',
      },
      request_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'JSON object containing request configuration (headers, timeout, retries)',
      },
      response_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'JSON object containing response structure information',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Flag to enable/disable the endpoint',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for improved performance
    await queryInterface.addIndex('st_api_endpoints', ['purpose']);
    await queryInterface.addIndex('st_api_endpoints', ['is_active']);
    await queryInterface.addIndex('st_api_endpoints', ['purpose', 'is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_api_endpoints');
  },
};