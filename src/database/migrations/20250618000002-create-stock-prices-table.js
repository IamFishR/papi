/**
 * Stock Alert Stock Prices migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_stock_prices', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
      price_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      open_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      close_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
      },
      high_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      low_price: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      adjusted_close: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      volume: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      data_source: {
        type: Sequelize.STRING(50),
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

    // Add composite unique constraint to prevent duplicate entries for a stock on the same date
    await queryInterface.addConstraint('st_stock_prices', {
      fields: ['stock_id', 'price_date'],
      type: 'unique',
      name: 'st_stock_prices_stock_id_price_date_unique',
    });

    // Add indexes for improved performance
    await queryInterface.addIndex('st_stock_prices', ['stock_id']);
    await queryInterface.addIndex('st_stock_prices', ['price_date']);
    await queryInterface.addIndex('st_stock_prices', ['close_price']);
    await queryInterface.addIndex('st_stock_prices', ['volume']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_stock_prices');
  },
};
