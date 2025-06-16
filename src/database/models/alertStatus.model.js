/**
 * AlertStatus model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AlertStatus = sequelize.define('AlertStatus', {
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
    tableName: 'st_alert_statuses',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  AlertStatus.associate = (models) => {
    // Will be associated with AlertHistory model when created
  };

  return AlertStatus;
};
