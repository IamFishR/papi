/**
 * Stock Alert Alerts migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_alerts', {
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
      trigger_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_trigger_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price_threshold: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
      },
      threshold_condition_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_threshold_conditions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      volume_condition_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_volume_conditions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      indicator_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_indicator_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      indicator_condition_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_indicator_conditions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sentiment_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_sentiment_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      frequency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_alert_frequencies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      condition_logic_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_condition_logic_types',
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
      risk_tolerance_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_risk_tolerance_levels',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cooldown_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 60,
      },
      last_triggered: {
        type: Sequelize.DATE,
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

    // Add indexes for improved performance
    await queryInterface.addIndex('st_alerts', ['user_id']);
    await queryInterface.addIndex('st_alerts', ['stock_id']);
    await queryInterface.addIndex('st_alerts', ['trigger_type_id']);
    await queryInterface.addIndex('st_alerts', ['status_id']);
    await queryInterface.addIndex('st_alerts', ['is_active']);
    await queryInterface.addIndex('st_alerts', ['last_triggered']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_alerts');
  },
};
