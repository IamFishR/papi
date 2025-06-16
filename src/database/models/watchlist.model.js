/**
 * Watchlist model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Watchlist = sequelize.define('Watchlist', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_public',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default',
    },
  }, {
    tableName: 'st_watchlists',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['is_public'],
      },
      {
        fields: ['is_default'],
      },
    ],
  });

  Watchlist.associate = (models) => {
    // Watchlist belongs to a user
    Watchlist.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // Watchlist has many watchlist stocks
    Watchlist.hasMany(models.WatchlistStock, {
      foreignKey: 'watchlist_id',
      as: 'watchlistStocks',
    });

    // Watchlist has many stocks through watchlist stocks
    Watchlist.belongsToMany(models.Stock, {
      through: models.WatchlistStock,
      foreignKey: 'watchlist_id',
      otherKey: 'stock_id',
      as: 'stocks',
    });
  };

  return Watchlist;
};
