/**
 * IndicatorCondition model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IndicatorCondition = sequelize.define('IndicatorCondition', {
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
  }, {
    tableName: 'st_indicator_conditions',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  IndicatorCondition.associate = (models) => {
    // Will be associated with Alert model when created
  };

  return IndicatorCondition;
};
