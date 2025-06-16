/**
 * Stock Alert Notification Queue migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_notification_queue', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      alert_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_alerts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      alert_history_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'st_alert_history',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notification_method_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_notification_methods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      notification_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_notification_statuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      priority_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_priority_levels',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      subject: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      recipient_address: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      scheduled_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      sent_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      error_message: {
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

    // Add indexes for improved performance
    await queryInterface.addIndex('st_notification_queue', ['user_id']);
    await queryInterface.addIndex('st_notification_queue', ['alert_id']);
    await queryInterface.addIndex('st_notification_queue', ['notification_status_id']);
    await queryInterface.addIndex('st_notification_queue', ['priority_id']);
    await queryInterface.addIndex('st_notification_queue', ['scheduled_time']);
    await queryInterface.addIndex('st_notification_queue', ['sent_time']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_notification_queue');
  },
};
