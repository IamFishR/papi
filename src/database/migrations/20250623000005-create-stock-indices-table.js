'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create stock indices table
      await queryInterface.createTable('st_stock_indices', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        index_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Name of the index (e.g., NIFTY 50, NIFTY 200)'
        },
        index_code: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
          comment: 'Short code for the index (e.g., NIFTY50, NIFTY200)'
        },
        index_symbol: {
          type: Sequelize.STRING(50),
          comment: 'Trading symbol if applicable'
        },
        description: {
          type: Sequelize.TEXT,
          comment: 'Description of what the index tracks'
        },
        base_date: {
          type: Sequelize.DATEONLY,
          comment: 'Base date for index calculation'
        },
        base_value: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Base value of the index'
        },
        exchange_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Exchange where index is maintained',
          references: {
            model: 'st_exchanges',
            key: 'id'
          },
          onDelete: 'RESTRICT'
        },
        currency_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Currency of the index',
          references: {
            model: 'st_currencies',
            key: 'id'
          },
          onDelete: 'RESTRICT'
        },
        index_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'MARKET_CAP',
          comment: 'Type: MARKET_CAP, EQUAL_WEIGHT, PRICE_WEIGHTED, etc.'
        },
        calculation_method: {
          type: Sequelize.STRING(100),
          comment: 'How the index is calculated'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_stock_indices', ['index_name'], {
        name: 'idx_st_stock_indices_index_name',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_indices', ['index_code'], {
        name: 'idx_st_stock_indices_index_code',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_indices', ['exchange_id'], {
        name: 'idx_st_stock_indices_exchange_id',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_indices', ['currency_id'], {
        name: 'idx_st_stock_indices_currency_id',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_indices', ['index_type'], {
        name: 'idx_st_stock_indices_index_type',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_indices', ['is_active'], {
        name: 'idx_st_stock_indices_is_active',
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
      await queryInterface.dropTable('st_stock_indices', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};