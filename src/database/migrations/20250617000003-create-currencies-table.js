/**
 * Stock Alert Currencies migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_currencies', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      symbol: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Seed initial data with major currencies
    await queryInterface.bulkInsert('st_currencies', [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'Fr',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: 'HK$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_currencies');
  },
};
