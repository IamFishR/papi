-- Migration: Create stock indices table for NIFTY and other indices
-- Date: 2025-06-22
-- Purpose: Track various stock market indices like NIFTY 50, NIFTY 200, etc.

CREATE TABLE st_stock_indices (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    index_name VARCHAR(100) NOT NULL COMMENT 'Name of the index (e.g., NIFTY 50, NIFTY 200)',
    index_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Short code for the index (e.g., NIFTY50, NIFTY200)',
    index_symbol VARCHAR(50) COMMENT 'Trading symbol if applicable',
    description TEXT COMMENT 'Description of what the index tracks',
    base_date DATE COMMENT 'Base date for index calculation',
    base_value DECIMAL(12,4) COMMENT 'Base value of the index',
    exchange_id INTEGER NOT NULL COMMENT 'Exchange where index is maintained',
    currency_id INTEGER NOT NULL COMMENT 'Currency of the index',
    index_type VARCHAR(50) NOT NULL DEFAULT 'MARKET_CAP' COMMENT 'Type: MARKET_CAP, EQUAL_WEIGHT, PRICE_WEIGHTED, etc.',
    calculation_method VARCHAR(100) COMMENT 'How the index is calculated',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT st_stock_indices_exchange_id_foreign 
        FOREIGN KEY (exchange_id) REFERENCES st_exchanges(id) ON DELETE RESTRICT,
    CONSTRAINT st_stock_indices_currency_id_foreign 
        FOREIGN KEY (currency_id) REFERENCES st_currencies(id) ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_st_stock_indices_index_name ON st_stock_indices(index_name);
CREATE INDEX idx_st_stock_indices_index_code ON st_stock_indices(index_code);
CREATE INDEX idx_st_stock_indices_exchange_id ON st_stock_indices(exchange_id);
CREATE INDEX idx_st_stock_indices_currency_id ON st_stock_indices(currency_id);
CREATE INDEX idx_st_stock_indices_index_type ON st_stock_indices(index_type);
CREATE INDEX idx_st_stock_indices_is_active ON st_stock_indices(is_active);