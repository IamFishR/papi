/**
 * Stock Alert Indicator Types migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_indicator_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      default_period: {
        type: Sequelize.INTEGER,
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

    // Seed initial data
    await queryInterface.bulkInsert('st_indicator_types', [
      {
        name: 'RSI',
        description: 'Relative Strength Index',
        default_period: 14,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'SMA',
        description: 'Simple Moving Average',
        default_period: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'EMA',
        description: 'Exponential Moving Average',
        default_period: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'MACD',
        description: 'Moving Average Convergence Divergence',
        default_period: 12,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'bollinger_bands',
        description: 'Bollinger Bands',
        default_period: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_indicator_types');
  },
};
