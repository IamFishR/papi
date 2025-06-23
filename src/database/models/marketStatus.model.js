/**
 * MarketStatus model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MarketStatus = sequelize.define('MarketStatus', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    advances: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    declines: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    unchanged: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    marketStatus: {
      type: DataTypes.STRING(50),
      defaultValue: 'Unknown',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rawData: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'st_market_status',
    timestamps: true,
    underscored: true,
  });

  return MarketStatus;
};
