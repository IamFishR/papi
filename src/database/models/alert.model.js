/**
 * Alert model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
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
    triggerTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'trigger_type_id',
      references: {
        model: 'st_trigger_types',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priceThreshold: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'price_threshold',
    },
    thresholdConditionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'threshold_condition_id',
      references: {
        model: 'st_threshold_conditions',
        key: 'id',
      },
    },
    volumeConditionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'volume_condition_id',
      references: {
        model: 'st_volume_conditions',
        key: 'id',
      },
    },
    indicatorTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'indicator_type_id',
      references: {
        model: 'st_indicator_types',
        key: 'id',
      },
    },
    indicatorConditionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'indicator_condition_id',
      references: {
        model: 'st_indicator_conditions',
        key: 'id',
      },
    },
    sentimentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sentiment_type_id',
      references: {
        model: 'st_sentiment_types',
        key: 'id',
      },
    },
    frequencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'frequency_id',
      references: {
        model: 'st_alert_frequencies',
        key: 'id',
      },
    },
    conditionLogicId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'condition_logic_id',
      references: {
        model: 'st_condition_logic_types',
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
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status_id',
      references: {
        model: 'st_alert_statuses',
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
    riskToleranceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'risk_tolerance_id',
      references: {
        model: 'st_risk_tolerance_levels',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
      validate: {
        isDate: true,
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date',
      validate: {
        isDate: true,
      },
    },
    cooldownMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'cooldown_minutes',
      defaultValue: 60,
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_triggered',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'st_alerts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['stock_id'],
      },
      {
        fields: ['trigger_type_id'],
      },
      {
        fields: ['status_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['last_triggered'],
      },
    ],
  });

  Alert.associate = (models) => {
    // Alert belongs to a user
    Alert.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // Alert belongs to a stock
    Alert.belongsTo(models.Stock, {
      foreignKey: 'stock_id',
      as: 'stock',
    });

    // Alert belongs to a trigger type
    Alert.belongsTo(models.TriggerType, {
      foreignKey: 'trigger_type_id',
      as: 'triggerType',
    });

    // Alert belongs to a threshold condition
    Alert.belongsTo(models.ThresholdCondition, {
      foreignKey: 'threshold_condition_id',
      as: 'thresholdCondition',
    });

    // Alert belongs to a volume condition
    Alert.belongsTo(models.VolumeCondition, {
      foreignKey: 'volume_condition_id',
      as: 'volumeCondition',
    });

    // Alert belongs to an indicator type
    Alert.belongsTo(models.IndicatorType, {
      foreignKey: 'indicator_type_id',
      as: 'indicatorType',
    });

    // Alert belongs to an indicator condition
    Alert.belongsTo(models.IndicatorCondition, {
      foreignKey: 'indicator_condition_id',
      as: 'indicatorCondition',
    });

    // Alert belongs to a sentiment type
    Alert.belongsTo(models.SentimentType, {
      foreignKey: 'sentiment_type_id',
      as: 'sentimentType',
    });

    // Alert belongs to a frequency
    Alert.belongsTo(models.AlertFrequency, {
      foreignKey: 'frequency_id',
      as: 'frequency',
    });

    // Alert belongs to a condition logic type
    Alert.belongsTo(models.ConditionLogicType, {
      foreignKey: 'condition_logic_id',
      as: 'conditionLogic',
    });

    // Alert belongs to a notification method
    Alert.belongsTo(models.NotificationMethod, {
      foreignKey: 'notification_method_id',
      as: 'notificationMethod',
    });

    // Alert belongs to a status
    Alert.belongsTo(models.AlertStatus, {
      foreignKey: 'status_id',
      as: 'status',
    });

    // Alert belongs to a priority level
    Alert.belongsTo(models.PriorityLevel, {
      foreignKey: 'priority_id',
      as: 'priority',
    });

    // Alert belongs to a risk tolerance level
    Alert.belongsTo(models.RiskToleranceLevel, {
      foreignKey: 'risk_tolerance_id',
      as: 'riskTolerance',
    });

    // Alert has many alert history entries
    Alert.hasMany(models.AlertHistory, {
      foreignKey: 'alert_id',
      as: 'history',
    });

    // Alert has many notification queue entries
    Alert.hasMany(models.NotificationQueue, {
      foreignKey: 'alert_id',
      as: 'notifications',
    });
  };

  return Alert;
};
