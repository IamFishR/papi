'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create pre-market data table
      await queryInterface.createTable('st_pre_market_data', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        stock_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Reference to stock',
          references: {
            model: 'st_stocks',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        trading_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Date of pre-market session'
        },
        session_start_time: {
          type: Sequelize.TIME,
          allowNull: false,
          comment: 'Pre-market session start time'
        },
        session_end_time: {
          type: Sequelize.TIME,
          allowNull: false,
          comment: 'Pre-market session end time'
        },
        iep: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Indicative Equilibrium Price'
        },
        iep_change: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Change in IEP from previous close'
        },
        iep_change_percent: {
          type: Sequelize.DECIMAL(8,4),
          comment: 'Percentage change in IEP'
        },
        total_traded_volume: {
          type: Sequelize.BIGINT,
          comment: 'Total volume traded in pre-market'
        },
        total_traded_value: {
          type: Sequelize.DECIMAL(15,2),
          comment: 'Total value traded in pre-market'
        },
        total_buy_quantity: {
          type: Sequelize.BIGINT,
          comment: 'Total buy quantity orders'
        },
        total_sell_quantity: {
          type: Sequelize.BIGINT,
          comment: 'Total sell quantity orders'
        },
        ato_buy_qty: {
          type: Sequelize.BIGINT,
          comment: 'At The Open buy quantity'
        },
        ato_sell_qty: {
          type: Sequelize.BIGINT,
          comment: 'At The Open sell quantity'
        },
        final_iep: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Final IEP at end of pre-market session'
        },
        final_iep_qty: {
          type: Sequelize.BIGINT,
          comment: 'Final IEP quantity'
        },
        market_type: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'REGULAR',
          comment: 'REGULAR, CALL_AUCTION, etc.'
        },
        data_source: {
          type: Sequelize.STRING(50),
          comment: 'Source of the data (NSE, BSE, etc.)'
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });
      
      // Add unique constraint to prevent duplicate data for same stock and date
      await queryInterface.addConstraint('st_pre_market_data', {
        fields: ['stock_id', 'trading_date'],
        type: 'unique',
        name: 'unique_stock_trading_date',
        transaction
      });
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_pre_market_data', ['stock_id'], {
        name: 'idx_st_pre_market_data_stock_id',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['trading_date'], {
        name: 'idx_st_pre_market_data_trading_date',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['iep'], {
        name: 'idx_st_pre_market_data_iep',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['total_traded_volume'], {
        name: 'idx_st_pre_market_data_total_traded_volume',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['final_iep'], {
        name: 'idx_st_pre_market_data_final_iep',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['market_type'], {
        name: 'idx_st_pre_market_data_market_type',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_data', ['data_source'], {
        name: 'idx_st_pre_market_data_data_source',
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
      await queryInterface.dropTable('st_pre_market_data', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};