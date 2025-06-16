/**
 * Stock Alert Watchlist Stocks migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_watchlist_stocks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      watchlist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_watchlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      added_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      price_at_add: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      target_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      stop_loss: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
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

    // Add unique constraint to prevent duplicate stocks in the same watchlist
    await queryInterface.addConstraint('st_watchlist_stocks', {
      fields: ['watchlist_id', 'stock_id'],
      type: 'unique',
      name: 'unique_stock_per_watchlist',
    });

    // Add indexes for improved performance
    await queryInterface.addIndex('st_watchlist_stocks', ['watchlist_id']);
    await queryInterface.addIndex('st_watchlist_stocks', ['stock_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_watchlist_stocks');
  },
};
