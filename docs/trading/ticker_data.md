# route for ticker:
    // bulk ticker data update from NSE (admin only) for browser extension
    router.post(
    '/bulk/ticker',
    authenticate,
    authorize('admin'),
    validate(stocksValidation.bulkTickerDataUpdate.body),
    payloadTransformer(createTransformerForEndpoint('/bulk/ticker')),
    catchAsync(stocksController.bulkTickerDataUpdate)
    );

- payload for this route is exactly same as the one for `/complete-market-data` route. we just need to use response.data array
    which contains ticker data for multiple stocks.


CREATE TABLE `st_trading_tickers` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `stock_id` INTEGER NOT NULL,
  
  -- Core Real-time Price Data (aligned with st_stock_prices schema)
  `ltp` DECIMAL(12,4) NOT NULL COMMENT 'Last Traded Price',
  `open_price` DECIMAL(12,4),
  `high_price` DECIMAL(12,4),
  `low_price` DECIMAL(12,4),
  `previous_close` DECIMAL(12,4),
  
  -- Change Metrics (aligned with st_stock_prices enhanced fields)
  `price_change` DECIMAL(12,4) COMMENT 'Absolute change',
  `price_change_percent` DECIMAL(8,4) COMMENT 'Percentage change',
  
  -- Volume Data (aligned with actual st_stock_prices migration - BIGINT not DECIMAL)
  `volume` BIGINT DEFAULT 0,
  `total_trades` BIGINT,
  `vwap` DECIMAL(12,4) COMMENT 'Volume Weighted Average Price',
  
  -- Circuit Limits (aligned with st_stock_prices field names)
  `upper_circuit_price` DECIMAL(12,4),
  `lower_circuit_price` DECIMAL(12,4),
  
  -- Order Book (L1 data - real-time specific)
  `bid_price` DECIMAL(12,4),
  `bid_qty` BIGINT,
  `ask_price` DECIMAL(12,4),
  `ask_qty` BIGINT,
  
  -- Trading Status (minimal for fast updates)
  `is_tradable` BOOLEAN DEFAULT TRUE,
  `market_session` ENUM('PRE_MARKET', 'REGULAR', 'POST_MARKET', 'CLOSED') DEFAULT 'REGULAR',
  
  -- Update tracking (consistent with other tables)
  `last_update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Unique constraint - one ticker per stock
  UNIQUE KEY `st_trading_tickers_stock_id_unique` (`stock_id`),
  
  -- Primary indexes (aligned with st_stock_prices index patterns)
  INDEX `idx_stock_id` (`stock_id`),
  INDEX `idx_ltp` (`ltp`),
  INDEX `idx_price_change_percent` (`price_change_percent`),
  INDEX `idx_volume` (`volume`),
  INDEX `idx_vwap` (`vwap`),
  INDEX `idx_total_trades` (`total_trades`),
  INDEX `idx_is_tradable` (`is_tradable`),
  INDEX `idx_last_update_time` (`last_update_time`),
  
  -- Composite indexes for common real-time trading queries
  INDEX `idx_tradable_ltp` (`is_tradable`, `ltp`),
  INDEX `idx_session_tradable` (`market_session`, `is_tradable`),
  INDEX `idx_performance_real_time` (`price_change_percent`, `last_update_time`),
  INDEX `idx_circuit_limits` (`upper_circuit_price`, `lower_circuit_price`),
  
  -- Foreign key constraint (aligned with existing schema)
  FOREIGN KEY (`stock_id`) REFERENCES `st_stocks`(`id`) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Fast real-time ticker data - aligned with st_stock_prices schema but optimized for speed';