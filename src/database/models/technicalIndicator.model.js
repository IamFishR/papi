/**
 * TechnicalIndicator model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TechnicalIndicator = sequelize.define('TechnicalIndicator', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
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
    indicatorTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'indicator_type_id',
      references: {
        model: 'st_indicator_types',
        key: 'id',
      },
    },
    calculationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'calculation_date',
      validate: {
        isDate: true,
      },
    },
    value: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
      validate: {
        notNull: true,
      },
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timePeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'time_period',
    },
    signalStrength: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'signal_strength',
    },
    isBullish: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_bullish',
    },
    isBearish: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_bearish',
    },
  }, {
    tableName: 'st_technical_indicators',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['stock_id'],
      },
      {
        fields: ['indicator_type_id'],
      },
      {
        fields: ['calculation_date'],
      },
      {
        fields: ['is_bullish'],
      },
      {
        fields: ['is_bearish'],
      },
    ],
  });

  TechnicalIndicator.associate = (models) => {
    // TechnicalIndicator belongs to a stock
    TechnicalIndicator.belongsTo(models.Stock, {
      foreignKey: 'stock_id',
      as: 'stock',
    });

    // TechnicalIndicator belongs to an indicator type
    TechnicalIndicator.belongsTo(models.IndicatorType, {
      foreignKey: 'indicator_type_id',
      as: 'indicatorType',
    });
  };

  return TechnicalIndicator;
};
