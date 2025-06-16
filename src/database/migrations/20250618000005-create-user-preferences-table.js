/**
 * Stock Alert User Preferences migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_user_preferences', {
      id: {
        type: Sequelize.INTEGER,
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
        unique: true,
      },
      default_notification_method_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_notification_methods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      default_risk_tolerance_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_risk_tolerance_levels',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      email_notifications_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      push_notifications_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sms_notifications_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      daily_summary_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      daily_summary_time: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: '18:00:00',
      },
      notification_timezone: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'UTC',
      },
      quiet_hours_start: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      quiet_hours_end: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      max_daily_notifications: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 20,
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
    await queryInterface.addIndex('st_user_preferences', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_user_preferences');
  },
};
