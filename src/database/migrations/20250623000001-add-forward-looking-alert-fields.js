'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add forward-looking alert fields to st_alerts table
    await queryInterface.addColumn('st_alerts', 'baseline_price', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
      comment: 'Price when alert was created - used for forward-looking comparisons'
    });

    await queryInterface.addColumn('st_alerts', 'baseline_timestamp', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when baseline price was recorded'
    });

    await queryInterface.addColumn('st_alerts', 'market_hours_only', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether to trigger alerts only during market hours'
    });

    await queryInterface.addColumn('st_alerts', 'volume_confirmation', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether to require volume confirmation for price movements'
    });

    // Add index for baseline_timestamp for efficient queries
    await queryInterface.addIndex('st_alerts', ['baseline_timestamp'], {
      name: 'idx_st_alerts_baseline_timestamp'
    });

    // Enhance st_alert_history table for better forward-looking context
    await queryInterface.addColumn('st_alert_history', 'baseline_price', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
      comment: 'Baseline price when alert was created'
    });

    await queryInterface.addColumn('st_alert_history', 'price_change', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
      comment: 'Price change from baseline to trigger'
    });

    await queryInterface.addColumn('st_alert_history', 'price_change_percent', {
      type: Sequelize.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Percentage price change from baseline'
    });

    await queryInterface.addColumn('st_alert_history', 'trigger_volume', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Volume at time of trigger'
    });

    await queryInterface.addColumn('st_alert_history', 'market_context', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Additional market context when alert was triggered'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove forward-looking alert fields from st_alerts table
    await queryInterface.removeIndex('st_alerts', 'idx_st_alerts_baseline_timestamp');
    await queryInterface.removeColumn('st_alerts', 'baseline_price');
    await queryInterface.removeColumn('st_alerts', 'baseline_timestamp');
    await queryInterface.removeColumn('st_alerts', 'market_hours_only');
    await queryInterface.removeColumn('st_alerts', 'volume_confirmation');

    // Remove enhanced fields from st_alert_history table
    await queryInterface.removeColumn('st_alert_history', 'baseline_price');
    await queryInterface.removeColumn('st_alert_history', 'price_change');
    await queryInterface.removeColumn('st_alert_history', 'price_change_percent');
    await queryInterface.removeColumn('st_alert_history', 'trigger_volume');
    await queryInterface.removeColumn('st_alert_history', 'market_context');
  }
};