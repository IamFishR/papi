/**
 * NotificationQueue model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationQueue = sequelize.define('NotificationQueue', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    alertId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'alert_id',
      references: {
        model: 'st_alerts',
        key: 'id',
      },
    },
    alertHistoryId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'alert_history_id',
      references: {
        model: 'st_alert_history',
        key: 'id',
      },
    },
    notificationMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'notification_method_id',
      references: {
        model: 'st_notification_methods',
        key: 'id',
      },
    },
    notificationStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'notification_status_id',
      references: {
        model: 'st_notification_statuses',
        key: 'id',
      },
    },
    priorityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'priority_id',
      references: {
        model: 'st_priority_levels',
        key: 'id',
      },
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    recipientAddress: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'recipient_address',
    },
    scheduledTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'scheduled_time',
      validate: {
        isDate: true,
      },
    },
    sentTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_time',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'retry_count',
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: 'max_retries',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
  }, {
    tableName: 'st_notification_queue',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['alert_id'],
      },
      {
        fields: ['notification_status_id'],
      },
      {
        fields: ['priority_id'],
      },
      {
        fields: ['scheduled_time'],
      },
      {
        fields: ['sent_time'],
      },
    ],
  });

  NotificationQueue.associate = (models) => {
    // NotificationQueue belongs to a user
    NotificationQueue.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // NotificationQueue belongs to an alert
    NotificationQueue.belongsTo(models.Alert, {
      foreignKey: 'alert_id',
      as: 'alert',
    });

    // NotificationQueue belongs to an alert history
    NotificationQueue.belongsTo(models.AlertHistory, {
      foreignKey: 'alert_history_id',
      as: 'alertHistory',
    });

    // NotificationQueue belongs to a notification method
    NotificationQueue.belongsTo(models.NotificationMethod, {
      foreignKey: 'notification_method_id',
      as: 'notificationMethod',
    });

    // NotificationQueue belongs to a notification status
    NotificationQueue.belongsTo(models.NotificationStatus, {
      foreignKey: 'notification_status_id',
      as: 'notificationStatus',
    });

    // NotificationQueue belongs to a priority level
    NotificationQueue.belongsTo(models.PriorityLevel, {
      foreignKey: 'priority_id',
      as: 'priority',
    });
  };

  return NotificationQueue;
};
