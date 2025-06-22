/**
 * Stock Alert Exchanges migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_exchanges', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      currency_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      opening_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      closing_time: {
        type: Sequelize.TIME,
        allowNull: true,
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

    // Seed initial data for Indian exchange
    await queryInterface.bulkInsert('st_exchanges', [
      {
        code: 'NSE',
        name: 'National Stock Exchange of India',
        country: 'India',
        timezone: 'Asia/Kolkata',
        currency_code: 'INR',
        opening_time: '09:15:00',
        closing_time: '15:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_exchanges');
  },
};
