/**
 * StockPrice model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockPrice = sequelize.define('StockPrice', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
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
    priceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'price_date',
      validate: {
        isDate: true,
      },
    },
    openPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'open_price',
    },
    closePrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      field: 'close_price',
      validate: {
        notNull: true,
        isDecimal: true,
      },
    },
    highPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'high_price',
    },
    lowPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'low_price',
    },
    adjustedClose: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'adjusted_close',
    },
    volume: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    dataSource: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'data_source',
    },
  }, {
    tableName: 'st_stock_prices',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['stock_id'],
      },
      {
        fields: ['price_date'],
      },
      {
        fields: ['close_price'],
      },
      {
        fields: ['volume'],
      },
    ],
  });

  StockPrice.associate = (models) => {
    // StockPrice belongs to a stock
    StockPrice.belongsTo(models.Stock, {
      foreignKey: 'stock_id',
      as: 'stock',
    });
  };

  return StockPrice;
};
