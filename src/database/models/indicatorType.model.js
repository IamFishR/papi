/**
 * IndicatorType model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IndicatorType = sequelize.define('IndicatorType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    defaultPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'default_period',
      validate: {
        isInt: true,
        min: 1,
      },
    },
  }, {
    tableName: 'st_indicator_types',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  IndicatorType.associate = (models) => {
    // Will be associated with Alert and TechnicalIndicator models when created
  };

  return IndicatorType;
};
