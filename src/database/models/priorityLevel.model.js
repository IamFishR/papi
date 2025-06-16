/**
 * PriorityLevel model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriorityLevel = sequelize.define('PriorityLevel', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      unique: true,
      validate: {
        isInt: true,
        min: 1,
        max: 5,
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: 'st_priority_levels',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  PriorityLevel.associate = (models) => {
    // Will be associated with NotificationQueue model when created
  };

  return PriorityLevel;
};
