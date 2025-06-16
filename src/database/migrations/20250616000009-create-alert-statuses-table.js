/**
 * Stock Alert Statuses migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_alert_statuses', {
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
    await queryInterface.bulkInsert('st_alert_statuses', [
      {
        name: 'triggered',
        description: 'Alert has been triggered',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'sent',
        description: 'Notification has been sent',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'delivered',
        description: 'Notification has been delivered',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'failed',
        description: 'Notification failed to send',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'acknowledged',
        description: 'User has acknowledged the alert',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_alert_statuses');
  },
};
