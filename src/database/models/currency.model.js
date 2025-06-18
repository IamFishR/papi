/**
 * Currency model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Currency = sequelize.define('Currency', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 3],
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    symbol: {
      type: DataTypes.STRING(5),
      allowNull: true,
      validate: {
        len: [0, 5],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'st_currencies',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['code'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  Currency.associate = (models) => {
    // Currency has many stocks
    if (models.Stock) {
      Currency.hasMany(models.Stock, {
        foreignKey: 'currency_id',
        as: 'stocks',
      });
    }
  };

  return Currency;
};