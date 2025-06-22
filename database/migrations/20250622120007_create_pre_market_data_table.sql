-- Migration: Create pre-market data table for Indian market pre-market trading
-- Date: 2025-06-22
-- Purpose: Track pre-market trading data which is critical for Indian stock markets

CREATE TABLE st_pre_market_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id INTEGER NOT NULL COMMENT 'Reference to stock',
    trading_date DATE NOT NULL COMMENT 'Date of pre-market session',
    session_start_time TIME NOT NULL COMMENT 'Pre-market session start time',
    session_end_time TIME NOT NULL COMMENT 'Pre-market session end time',
    iep DECIMAL(12,4) COMMENT 'Indicative Equilibrium Price',
    iep_change DECIMAL(12,4) COMMENT 'Change in IEP from previous close',
    iep_change_percent DECIMAL(8,4) COMMENT 'Percentage change in IEP',
    total_traded_volume BIGINT COMMENT 'Total volume traded in pre-market',
    total_traded_value DECIMAL(15,2) COMMENT 'Total value traded in pre-market',
    total_buy_quantity BIGINT COMMENT 'Total buy quantity orders',
    total_sell_quantity BIGINT COMMENT 'Total sell quantity orders',
    ato_buy_qty BIGINT COMMENT 'At The Open buy quantity',
    ato_sell_qty BIGINT COMMENT 'At The Open sell quantity',
    final_iep DECIMAL(12,4) COMMENT 'Final IEP at end of pre-market session',
    final_iep_qty BIGINT COMMENT 'Final IEP quantity',
    market_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR' COMMENT 'REGULAR, CALL_AUCTION, etc.',
    data_source VARCHAR(50) COMMENT 'Source of the data (NSE, BSE, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT st_pre_market_data_stock_id_foreign 
        FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
        
    -- Unique constraint to prevent duplicate data for same stock and date
    UNIQUE KEY unique_stock_trading_date (stock_id, trading_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_st_pre_market_data_stock_id ON st_pre_market_data(stock_id);
CREATE INDEX idx_st_pre_market_data_trading_date ON st_pre_market_data(trading_date);
CREATE INDEX idx_st_pre_market_data_iep ON st_pre_market_data(iep);
CREATE INDEX idx_st_pre_market_data_total_traded_volume ON st_pre_market_data(total_traded_volume);
CREATE INDEX idx_st_pre_market_data_final_iep ON st_pre_market_data(final_iep);
CREATE INDEX idx_st_pre_market_data_market_type ON st_pre_market_data(market_type);
CREATE INDEX idx_st_pre_market_data_data_source ON st_pre_market_data(data_source);