/**
 * AlertFrequency model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertFrequency = sequelize.define('AlertFrequency', {
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
    tableName: 'st_alert_frequencies',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  AlertFrequency.associate = (models) => {
    // Will be associated with Alert model when created
  };

  return AlertFrequency;
};
