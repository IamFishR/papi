/**
 * Stock Alert Notification Statuses migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_notification_statuses', {
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
    await queryInterface.bulkInsert('st_notification_statuses', [
      {
        name: 'pending',
        description: 'Notification is pending delivery',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'processing',
        description: 'Notification is being processed for delivery',
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
        description: 'Notification failed to deliver',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'cancelled',
        description: 'Notification was cancelled',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_notification_statuses');
  },
};
