/**
 * NotificationStatus model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationStatus = sequelize.define('NotificationStatus', {
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
    tableName: 'st_notification_statuses',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  NotificationStatus.associate = (models) => {
    // Will be associated with NotificationQueue model when created
  };

  return NotificationStatus;
};
