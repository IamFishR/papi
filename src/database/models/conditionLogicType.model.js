/**
 * ConditionLogicType model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConditionLogicType = sequelize.define('ConditionLogicType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 10],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'st_condition_logic_types',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  ConditionLogicType.associate = (models) => {
    // Will be associated with Alert model when created
  };

  return ConditionLogicType;
};
