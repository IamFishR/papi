/**
 * WatchlistStock model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WatchlistStock = sequelize.define('WatchlistStock', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    watchlistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'watchlist_id',
      references: {
        model: 'st_watchlists',
        key: 'id',
      },
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_id',
      references: {
        model: 'st_stocks',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
    priceAtAdd: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'price_at_add',
    },
    targetPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'target_price',
    },
    stopLoss: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'stop_loss',
    },
  }, {
    tableName: 'st_watchlist_stocks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['watchlist_id'],
      },
      {
        fields: ['stock_id'],
      },
    ],
  });

  WatchlistStock.associate = (models) => {
    // WatchlistStock belongs to a watchlist
    WatchlistStock.belongsTo(models.Watchlist, {
      foreignKey: 'watchlist_id',
      as: 'watchlist',
    });

    // WatchlistStock belongs to a stock
    WatchlistStock.belongsTo(models.Stock, {
      foreignKey: 'stock_id',
      as: 'stock',
    });
  };

  return WatchlistStock;
};
