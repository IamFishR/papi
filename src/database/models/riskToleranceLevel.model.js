/**
 * RiskToleranceLevel model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RiskToleranceLevel = sequelize.define('RiskToleranceLevel', {
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
    tableName: 'st_risk_tolerance_levels',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  RiskToleranceLevel.associate = (models) => {
    // Will be associated with UserPreferences model when created
  };

  return RiskToleranceLevel;
};
