/**
 * UserPreference model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.INTEGER,
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
      unique: true,
    },
    defaultNotificationMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'default_notification_method_id',
      references: {
        model: 'st_notification_methods',
        key: 'id',
      },
    },
    defaultRiskToleranceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'default_risk_tolerance_id',
      references: {
        model: 'st_risk_tolerance_levels',
        key: 'id',
      },
    },
    emailNotificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'email_notifications_enabled',
    },
    pushNotificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'push_notifications_enabled',
    },
    smsNotificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'sms_notifications_enabled',
    },
    dailySummaryEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'daily_summary_enabled',
    },
    dailySummaryTime: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '18:00:00',
      field: 'daily_summary_time',
    },
    notificationTimezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'UTC',
      field: 'notification_timezone',
    },
    quietHoursStart: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'quiet_hours_start',
    },
    quietHoursEnd: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'quiet_hours_end',
    },
    maxDailyNotifications: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
      field: 'max_daily_notifications',
    },
  }, {
    tableName: 'st_user_preferences',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
    ],
  });

  UserPreference.associate = (models) => {
    // UserPreference belongs to a user
    UserPreference.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // UserPreference belongs to a notification method
    UserPreference.belongsTo(models.NotificationMethod, {
      foreignKey: 'default_notification_method_id',
      as: 'defaultNotificationMethod',
    });

    // UserPreference belongs to a risk tolerance level
    UserPreference.belongsTo(models.RiskToleranceLevel, {
      foreignKey: 'default_risk_tolerance_id',
      as: 'defaultRiskTolerance',
    });
  };

  return UserPreference;
};
