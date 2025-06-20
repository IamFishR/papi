/**
 * Bot Executions table migration
 * Stores execution logs for all bot types with statistics and performance data
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_bot_executions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      execution_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Sequential execution ID from worker',
      },
      bot_type: {
        type: Sequelize.ENUM('stockBot', 'priceBot', 'fullDataBot'),
        allowNull: false,
        comment: 'Type of bot that performed the execution',
      },
      execution_type: {
        type: Sequelize.ENUM('stocks', 'prices', 'all', 'manual'),
        allowNull: false,
        comment: 'Type of execution performed',
      },
      status: {
        type: Sequelize.ENUM('success', 'error', 'partial'),
        allowNull: false,
        comment: 'Execution result status',
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Execution start timestamp',
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Execution completion timestamp',
      },
      duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Execution duration in milliseconds',
      },
      endpoints_processed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of API endpoints processed',
      },
      stocks_processed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of stocks processed',
      },
      stocks_created: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of new stocks created',
      },
      stocks_updated: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of stocks updated',
      },
      prices_processed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of prices processed',
      },
      prices_created: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of new price records created',
      },
      prices_updated: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Number of price records updated',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if execution failed',
      },
      error_stack: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error stack trace if execution failed',
      },
      nse_results: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'NSE API results summary (successful/failed endpoints)',
      },
      processing_results: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Detailed processing results per endpoint',
      },
      execution_summary: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Summary statistics for the execution',
      },
      is_manual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether execution was triggered manually',
      },
      memory_usage: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Memory usage snapshot during execution',
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

    // Add indexes for performance optimization
    await queryInterface.addIndex('st_bot_executions', ['bot_type']);
    await queryInterface.addIndex('st_bot_executions', ['execution_type']);
    await queryInterface.addIndex('st_bot_executions', ['status']);
    await queryInterface.addIndex('st_bot_executions', ['started_at']);
    await queryInterface.addIndex('st_bot_executions', ['bot_type', 'status']);
    await queryInterface.addIndex('st_bot_executions', ['bot_type', 'started_at']);
    await queryInterface.addIndex('st_bot_executions', ['execution_type', 'started_at']);
    await queryInterface.addIndex('st_bot_executions', ['is_manual']);
    
    // Composite index for common queries
    await queryInterface.addIndex('st_bot_executions', ['bot_type', 'execution_type', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_bot_executions');
  },
};