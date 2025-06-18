/**
 * Exchange model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exchange = sequelize.define('Exchange', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 10],
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: true,
      field: 'currency_code',
      validate: {
        len: [0, 3],
      },
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'opening_time',
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'closing_time',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'st_exchanges',
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

  Exchange.associate = (models) => {
    // Exchange has many stocks
    if (models.Stock) {
      Exchange.hasMany(models.Stock, {
        foreignKey: 'exchange_id',
        as: 'stocks',
      });
    }
  };

  return Exchange;
};