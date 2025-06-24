/**
 * TradingTicker model definition - Fast real-time ticker data
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TradingTicker = sequelize.define('TradingTicker', {
    id: {
      type: DataTypes.INTEGER,
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
    // Core Real-time Price Data
    ltp: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      comment: 'Last Traded Price',
      validate: {
        notNull: true,
        isDecimal: true,
      }
    },
    openPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'open_price',
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
    previousClose: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'previous_close',
    },
    // Change Metrics
    priceChange: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'price_change',
      comment: 'Absolute change',
    },
    priceChangePercent: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      field: 'price_change_percent',
      comment: 'Percentage change',
    },
    // Volume Data
    volume: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    totalTrades: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'total_trades',
    },
    vwap: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      comment: 'Volume Weighted Average Price',
    },
    // Circuit Limits
    upperCircuitPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'upper_circuit_price',
    },
    lowerCircuitPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'lower_circuit_price',
    },
    // Order Book (L1 data)
    bidPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'bid_price',
    },
    bidQty: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'bid_qty',
    },
    askPrice: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: true,
      field: 'ask_price',
    },
    askQty: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'ask_qty',
    },
    // Trading Status
    isTradable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_tradable',
    },
    marketSession: {
      type: DataTypes.ENUM('PRE_MARKET', 'REGULAR', 'POST_MARKET', 'CLOSED'),
      allowNull: false,
      defaultValue: 'REGULAR',
      field: 'market_session',
    },
    // Update tracking
    lastUpdateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_update_time',
    },
  }, {
    tableName: 'st_trading_tickers',
    timestamps: true,
    underscored: true,
    comment: 'Fast real-time ticker data - aligned with st_stock_prices schema but optimized for speed',
    indexes: [
      {
        fields: ['stock_id'],
        name: 'idx_stock_id',
      },
      {
        fields: ['stock_id', 'last_update_time'],
        unique: true,
        name: 'st_trading_tickers_stock_id_timestamp_unique',
      },
      {
        fields: ['ltp'],
        name: 'idx_ltp',
      },
      {
        fields: ['price_change_percent'],
        name: 'idx_price_change_percent',
      },
      {
        fields: ['volume'],
        name: 'idx_volume',
      },
      {
        fields: ['vwap'],
        name: 'idx_vwap',
      },
      {
        fields: ['total_trades'],
        name: 'idx_total_trades',
      },
      {
        fields: ['is_tradable'],
        name: 'idx_is_tradable',
      },
      {
        fields: ['last_update_time'],
        name: 'idx_last_update_time',
      },
      // Composite indexes for common queries
      {
        fields: ['is_tradable', 'ltp'],
        name: 'idx_tradable_ltp',
      },
      {
        fields: ['market_session', 'is_tradable'],
        name: 'idx_session_tradable',
      },
      {
        fields: ['price_change_percent', 'last_update_time'],
        name: 'idx_performance_real_time',
      },
      {
        fields: ['upper_circuit_price', 'lower_circuit_price'],
        name: 'idx_circuit_limits',
      },
    ],
  });

  TradingTicker.associate = (models) => {
    // TradingTicker belongs to a stock
    if (models.Stock) {
      TradingTicker.belongsTo(models.Stock, {
        foreignKey: 'stock_id',
        as: 'stock',
      });
    }
  };

  return TradingTicker;
};