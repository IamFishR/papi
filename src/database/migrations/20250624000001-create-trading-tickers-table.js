'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_trading_tickers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_stocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Core Real-time Price Data
      ltp: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        comment: 'Last Traded Price',
      },
      open_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      high_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      low_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      previous_close: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      // Change Metrics
      price_change: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        comment: 'Absolute change',
      },
      price_change_percent: {
        type: Sequelize.DECIMAL(8, 4),
        allowNull: true,
        comment: 'Percentage change',
      },
      // Volume Data
      volume: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },
      total_trades: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      vwap: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        comment: 'Volume Weighted Average Price',
      },
      // Circuit Limits
      upper_circuit_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      lower_circuit_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      // Order Book (L1 data)
      bid_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      bid_qty: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      ask_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      ask_qty: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      // Trading Status
      is_tradable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      market_session: {
        type: Sequelize.ENUM('PRE_MARKET', 'REGULAR', 'POST_MARKET', 'CLOSED'),
        allowNull: false,
        defaultValue: 'REGULAR',
      },
      // Update tracking
      last_update_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add unique constraint on stock_id
    await queryInterface.addConstraint('st_trading_tickers', {
      fields: ['stock_id'],
      type: 'unique',
      name: 'st_trading_tickers_stock_id_unique',
    });

    // Add indexes for performance
    await queryInterface.addIndex('st_trading_tickers', ['stock_id'], {
      name: 'idx_stock_id',
    });

    await queryInterface.addIndex('st_trading_tickers', ['ltp'], {
      name: 'idx_ltp',
    });

    await queryInterface.addIndex('st_trading_tickers', ['price_change_percent'], {
      name: 'idx_price_change_percent',
    });

    await queryInterface.addIndex('st_trading_tickers', ['volume'], {
      name: 'idx_volume',
    });

    await queryInterface.addIndex('st_trading_tickers', ['vwap'], {
      name: 'idx_vwap',
    });

    await queryInterface.addIndex('st_trading_tickers', ['total_trades'], {
      name: 'idx_total_trades',
    });

    await queryInterface.addIndex('st_trading_tickers', ['is_tradable'], {
      name: 'idx_is_tradable',
    });

    await queryInterface.addIndex('st_trading_tickers', ['last_update_time'], {
      name: 'idx_last_update_time',
    });

    // Add composite indexes for common queries
    await queryInterface.addIndex('st_trading_tickers', ['is_tradable', 'ltp'], {
      name: 'idx_tradable_ltp',
    });

    await queryInterface.addIndex('st_trading_tickers', ['market_session', 'is_tradable'], {
      name: 'idx_session_tradable',
    });

    await queryInterface.addIndex('st_trading_tickers', ['price_change_percent', 'last_update_time'], {
      name: 'idx_performance_real_time',
    });

    await queryInterface.addIndex('st_trading_tickers', ['upper_circuit_price', 'lower_circuit_price'], {
      name: 'idx_circuit_limits',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_trading_tickers');
  }
};