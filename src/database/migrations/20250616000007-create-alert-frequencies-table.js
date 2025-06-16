/**
 * Stock Alert Frequencies migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_alert_frequencies', {
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
    await queryInterface.bulkInsert('st_alert_frequencies', [
      {
        name: 'immediate',
        description: 'Alert is sent immediately when triggered',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'scheduled',
        description: 'Alert is sent at a scheduled time',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'conditional',
        description: 'Alert is sent when multiple conditions are met',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'recurring',
        description: 'Alert is sent on a recurring schedule',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_alert_frequencies');
  },
};
