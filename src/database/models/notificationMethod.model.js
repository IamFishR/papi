/**
 * NotificationMethod model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationMethod = sequelize.define('NotificationMethod', {
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
    tableName: 'st_notification_methods',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  NotificationMethod.associate = (models) => {
    // Will be associated with AlertHistory and NotificationQueue models when created
  };

  return NotificationMethod;
};
