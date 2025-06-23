'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create pre-market orders table
      await queryInterface.createTable('st_pre_market_orders', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        pre_market_data_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: 'Reference to pre-market data session',
          references: {
            model: 'st_pre_market_data',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        stock_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Reference to stock (for easier querying)',
          references: {
            model: 'st_stocks',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        order_type: {
          type: Sequelize.STRING(10),
          allowNull: false,
          comment: 'BUY or SELL'
        },
        price: {
          type: Sequelize.DECIMAL(12,4),
          allowNull: false,
          comment: 'Order price level'
        },
        quantity: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: 'Total quantity at this price level'
        },
        number_of_orders: {
          type: Sequelize.INTEGER,
          comment: 'Number of orders at this price level'
        },
        is_iep: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this price level is the IEP'
        },
        order_rank: {
          type: Sequelize.INTEGER,
          comment: 'Rank in the order book (1 = best price)'
        },
        timestamp: {
          type: Sequelize.DATE,
          comment: 'When this order book snapshot was taken'
        },
        data_source: {
          type: Sequelize.STRING(50),
          comment: 'Source of the order data'
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
      
      // Add check constraint for order_type
      await queryInterface.addConstraint('st_pre_market_orders', {
        fields: ['order_type'],
        type: 'check',
        name: 'chk_st_pre_market_orders_order_type',
        where: {
          order_type: ['BUY', 'SELL']
        },
        transaction
      });
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_pre_market_orders', ['pre_market_data_id'], {
        name: 'idx_st_pre_market_orders_pre_market_data_id',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['stock_id'], {
        name: 'idx_st_pre_market_orders_stock_id',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['order_type'], {
        name: 'idx_st_pre_market_orders_order_type',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['price'], {
        name: 'idx_st_pre_market_orders_price',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['quantity'], {
        name: 'idx_st_pre_market_orders_quantity',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['is_iep'], {
        name: 'idx_st_pre_market_orders_is_iep',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['order_rank'], {
        name: 'idx_st_pre_market_orders_order_rank',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['timestamp'], {
        name: 'idx_st_pre_market_orders_timestamp',
        transaction
      });
      
      await queryInterface.addIndex('st_pre_market_orders', ['stock_id', 'order_type', 'price', 'order_rank'], {
        name: 'idx_st_pre_market_orders_composite',
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
      await queryInterface.dropTable('st_pre_market_orders', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};