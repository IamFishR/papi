/**
 * Stock model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 20],
      },
    },
    companyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'company_name',
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    isin: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
      validate: {
        len: [12, 12],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exchangeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'exchange_id',
      references: {
        model: 'st_exchanges',
        key: 'id',
      },
    },
    sectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sector_id',
      references: {
        model: 'st_sectors',
        key: 'id',
      },
    },
    industryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'industry_id',
      references: {
        model: 'st_industries',
        key: 'id',
      },
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'currency_id',
      references: {
        model: 'st_currencies',
        key: 'id',
      },
    },
    detailedSectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'detailed_sector_id',
      references: {
        model: 'st_detailed_sectors',
        key: 'id',
      },
    },
    marketCap: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'market_cap',
    },
    peRatio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'pe_ratio',
    },
    dividendYield: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'dividend_yield',
    },
    beta: {
      type: DataTypes.DECIMAL(6, 3),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_updated',
    },
  }, {
    tableName: 'st_stocks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['symbol'],
      },
      {
        fields: ['isin'],
      },
      {
        fields: ['exchange_id'],
      },
      {
        fields: ['sector_id'],
      },
      {
        fields: ['industry_id'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });
  Stock.associate = (models) => {
    // Check if models exist before creating associations
    if (models.Exchange) {
      // Stock belongs to an exchange
      Stock.belongsTo(models.Exchange, {
        foreignKey: 'exchangeId',
        as: 'exchange',
      });
    }

    if (models.Sector) {
      // Stock belongs to a sector
      Stock.belongsTo(models.Sector, {
        foreignKey: 'sectorId',
        as: 'sector',
      });
    }

    if (models.Industry) {
      // Stock belongs to an industry
      Stock.belongsTo(models.Industry, {
        foreignKey: 'industryId',
        as: 'industry',
      });
    }

    if (models.Currency) {
      // Stock belongs to a currency
      Stock.belongsTo(models.Currency, {
        foreignKey: 'currencyId',
        as: 'currency',
      });
    }

    if (models.DetailedSector) {
      // Stock belongs to a detailed sector
      Stock.belongsTo(models.DetailedSector, {
        foreignKey: 'detailedSectorId',
        as: 'detailedSector',
      });
    }

    if (models.StockPrice) {
      // Stock has many prices
      Stock.hasMany(models.StockPrice, {
        foreignKey: 'stock_id',
        as: 'prices',
      });
    }    if (models.Alert) {
      // Stock has many alerts
      Stock.hasMany(models.Alert, {
        foreignKey: 'stock_id',
        as: 'alerts',
      });
    }

    if (models.TechnicalIndicator) {
      // Stock has many technical indicators
      Stock.hasMany(models.TechnicalIndicator, {
        foreignKey: 'stock_id',
        as: 'technicalIndicators',
      });
    }

    if (models.NewsMention) {
      // Stock has many news mentions
      Stock.hasMany(models.NewsMention, {
        foreignKey: 'stock_id',
        as: 'newsMentions',
      });
    }

    if (models.WatchlistStock) {
      // Stock has many watchlist associations
      Stock.hasMany(models.WatchlistStock, {
        foreignKey: 'stock_id',
        as: 'watchlistStocks',
      });
    }
  };

  return Stock;
};
