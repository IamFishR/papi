/**
 * Stock Alert History migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_alert_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      alert_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_alerts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_stocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_alert_statuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      triggered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      trigger_value: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      notification_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      notification_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_notification_statuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      message: {
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
    await queryInterface.addIndex('st_alert_history', ['alert_id']);
    await queryInterface.addIndex('st_alert_history', ['user_id']);
    await queryInterface.addIndex('st_alert_history', ['stock_id']);
    await queryInterface.addIndex('st_alert_history', ['triggered_at']);
    await queryInterface.addIndex('st_alert_history', ['status_id']);
    await queryInterface.addIndex('st_alert_history', ['notification_status_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_alert_history');
  },
};
