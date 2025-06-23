'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add comprehensive price tracking fields
      await queryInterface.addColumn('st_stock_prices', 'previous_close', {
        type: Sequelize.DECIMAL(12,4),
        after: 'close_price',
        comment: 'Previous trading day closing price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'price_change', {
        type: Sequelize.DECIMAL(12,4),
        after: 'previous_close',
        comment: 'Absolute price change from previous close'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'price_change_percent', {
        type: Sequelize.DECIMAL(8,4),
        after: 'price_change',
        comment: 'Percentage change from previous close'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'vwap', {
        type: Sequelize.DECIMAL(12,4),
        after: 'price_change_percent',
        comment: 'Volume Weighted Average Price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'lower_circuit_price', {
        type: Sequelize.DECIMAL(12,4),
        after: 'vwap',
        comment: 'Lower circuit limit price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'upper_circuit_price', {
        type: Sequelize.DECIMAL(12,4),
        after: 'lower_circuit_price',
        comment: 'Upper circuit limit price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'week_52_high', {
        type: Sequelize.DECIMAL(12,4),
        after: 'upper_circuit_price',
        comment: '52-week high price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'week_52_low', {
        type: Sequelize.DECIMAL(12,4),
        after: 'week_52_high',
        comment: '52-week low price'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'week_52_high_date', {
        type: Sequelize.DATEONLY,
        after: 'week_52_low',
        comment: 'Date when 52-week high was reached'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'week_52_low_date', {
        type: Sequelize.DATEONLY,
        after: 'week_52_high_date',
        comment: 'Date when 52-week low was reached'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'total_trades', {
        type: Sequelize.BIGINT,
        after: 'volume',
        comment: 'Total number of trades executed'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'deliverable_quantity', {
        type: Sequelize.BIGINT,
        after: 'total_trades',
        comment: 'Quantity available for delivery'
      }, { transaction });
      
      await queryInterface.addColumn('st_stock_prices', 'deliverable_percentage', {
        type: Sequelize.DECIMAL(5,2),
        after: 'deliverable_quantity',
        comment: 'Percentage of deliverable quantity'
      }, { transaction });
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_stock_prices', ['previous_close'], {
        name: 'idx_st_stock_prices_previous_close',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['price_change_percent'], {
        name: 'idx_st_stock_prices_price_change_percent',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['vwap'], {
        name: 'idx_st_stock_prices_vwap',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['week_52_high'], {
        name: 'idx_st_stock_prices_week_52_high',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['week_52_low'], {
        name: 'idx_st_stock_prices_week_52_low',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['total_trades'], {
        name: 'idx_st_stock_prices_total_trades',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_prices', ['deliverable_percentage'], {
        name: 'idx_st_stock_prices_deliverable_percentage',
        transaction
      });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove added columns
      await queryInterface.removeColumn('st_stock_prices', 'deliverable_percentage', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'deliverable_quantity', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'total_trades', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'week_52_low_date', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'week_52_high_date', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'week_52_low', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'week_52_high', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'upper_circuit_price', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'lower_circuit_price', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'vwap', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'price_change_percent', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'price_change', { transaction });
      await queryInterface.removeColumn('st_stock_prices', 'previous_close', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};