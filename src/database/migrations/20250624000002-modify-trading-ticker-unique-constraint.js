'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing unique constraint on stock_id only
    await queryInterface.removeConstraint('st_trading_tickers', 'st_trading_tickers_stock_id_unique');
    
    // Add new composite unique constraint on stock_id + last_update_time
    await queryInterface.addConstraint('st_trading_tickers', {
      fields: ['stock_id', 'last_update_time'],
      type: 'unique',
      name: 'st_trading_tickers_stock_id_timestamp_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the composite unique constraint
    await queryInterface.removeConstraint('st_trading_tickers', 'st_trading_tickers_stock_id_timestamp_unique');
    
    // Restore the original unique constraint on stock_id only
    await queryInterface.addConstraint('st_trading_tickers', {
      fields: ['stock_id'],
      type: 'unique',
      name: 'st_trading_tickers_stock_id_unique',
    });
  }
};