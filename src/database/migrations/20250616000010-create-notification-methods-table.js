/**
 * Stock Alert Notification Methods migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_notification_methods', {
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
    await queryInterface.bulkInsert('st_notification_methods', [
      {
        name: 'email',
        description: 'Email notification',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'sms',
        description: 'SMS text message',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'push',
        description: 'Mobile push notification',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'webhook',
        description: 'Webhook callback to external system',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_notification_methods');
  },
};
