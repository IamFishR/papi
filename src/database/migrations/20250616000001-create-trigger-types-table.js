/**
 * Stock Alert Trigger Types migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_trigger_types', {
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
    await queryInterface.bulkInsert('st_trigger_types', [
      {
        name: 'stock_price',
        description: 'Alerts based on stock price changes or thresholds',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'volume',
        description: 'Alerts based on trading volume metrics',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'technical_indicator',
        description: 'Alerts based on technical analysis indicators',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'news',
        description: 'Alerts based on news mentions and sentiment',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'portfolio',
        description: 'Alerts based on portfolio performance metrics',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_trigger_types');
  },
};
