/**
 * Stock Alert Stocks migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_stocks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      symbol: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      company_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      exchange_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_exchanges',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sector_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_sectors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      currency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_currencies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      market_cap: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      pe_ratio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      dividend_yield: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      beta: {
        type: Sequelize.DECIMAL(6, 3),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_updated: {
        type: Sequelize.DATE,
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

    // Add indexes for improved performance
    await queryInterface.addIndex('st_stocks', ['symbol']);
    await queryInterface.addIndex('st_stocks', ['exchange_id']);
    await queryInterface.addIndex('st_stocks', ['sector_id']);
    await queryInterface.addIndex('st_stocks', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_stocks');
  },
};
