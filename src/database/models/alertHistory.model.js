/**
 * AlertHistory model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertHistory = sequelize.define('AlertHistory', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    alertId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'alert_id',
      references: {
        model: 'st_alerts',
        key: 'id',
      },
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
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_id',
      references: {
        model: 'st_stocks',
        key: 'id',
      },
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status_id',
      references: {
        model: 'st_alert_statuses',
        key: 'id',
      },
    },
    triggeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'triggered_at',
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
    },
    triggerValue: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'trigger_value',
    },
    notificationId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'notification_id',
    },
    notificationStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'notification_status_id',
      references: {
        model: 'st_notification_statuses',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'st_alert_history',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['alert_id'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['stock_id'],
      },
      {
        fields: ['triggered_at'],
      },
      {
        fields: ['status_id'],
      },
      {
        fields: ['notification_status_id'],
      },
    ],
  });

  AlertHistory.associate = (models) => {
    // AlertHistory belongs to an alert
    AlertHistory.belongsTo(models.Alert, {
      foreignKey: 'alert_id',
      as: 'alert',
    });

    // AlertHistory belongs to a user
    AlertHistory.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // AlertHistory belongs to a stock
    AlertHistory.belongsTo(models.Stock, {
      foreignKey: 'stock_id',
      as: 'stock',
    });

    // AlertHistory belongs to a status
    AlertHistory.belongsTo(models.AlertStatus, {
      foreignKey: 'status_id',
      as: 'status',
    });

    // AlertHistory belongs to a notification status
    AlertHistory.belongsTo(models.NotificationStatus, {
      foreignKey: 'notification_status_id',
      as: 'notificationStatus',
    });

    // AlertHistory has many notifications
    AlertHistory.hasMany(models.NotificationQueue, {
      foreignKey: 'alert_history_id',
      as: 'notifications',
    });
  };

  return AlertHistory;
};
