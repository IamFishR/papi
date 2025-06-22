-- Migration: Create pre-market orders table for order book data
-- Date: 2025-06-22
-- Purpose: Track detailed order book information during pre-market sessions

CREATE TABLE st_pre_market_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pre_market_data_id BIGINT NOT NULL COMMENT 'Reference to pre-market data session',
    stock_id INTEGER NOT NULL COMMENT 'Reference to stock (for easier querying)',
    order_type VARCHAR(10) NOT NULL COMMENT 'BUY or SELL',
    price DECIMAL(12,4) NOT NULL COMMENT 'Order price level',
    quantity BIGINT NOT NULL COMMENT 'Total quantity at this price level',
    number_of_orders INTEGER COMMENT 'Number of orders at this price level',
    is_iep BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this price level is the IEP',
    order_rank INTEGER COMMENT 'Rank in the order book (1 = best price)',
    timestamp TIMESTAMP COMMENT 'When this order book snapshot was taken',
    data_source VARCHAR(50) COMMENT 'Source of the order data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT st_pre_market_orders_pre_market_data_id_foreign 
        FOREIGN KEY (pre_market_data_id) REFERENCES st_pre_market_data(id) ON DELETE CASCADE,
    CONSTRAINT st_pre_market_orders_stock_id_foreign 
        FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
        
    -- Check constraint for order_type
    CONSTRAINT chk_st_pre_market_orders_order_type 
        CHECK (order_type IN ('BUY', 'SELL'))
);

-- Create indexes for better query performance
CREATE INDEX idx_st_pre_market_orders_pre_market_data_id ON st_pre_market_orders(pre_market_data_id);
CREATE INDEX idx_st_pre_market_orders_stock_id ON st_pre_market_orders(stock_id);
CREATE INDEX idx_st_pre_market_orders_order_type ON st_pre_market_orders(order_type);
CREATE INDEX idx_st_pre_market_orders_price ON st_pre_market_orders(price);
CREATE INDEX idx_st_pre_market_orders_quantity ON st_pre_market_orders(quantity);
CREATE INDEX idx_st_pre_market_orders_is_iep ON st_pre_market_orders(is_iep);
CREATE INDEX idx_st_pre_market_orders_order_rank ON st_pre_market_orders(order_rank);
CREATE INDEX idx_st_pre_market_orders_timestamp ON st_pre_market_orders(timestamp);
CREATE INDEX idx_st_pre_market_orders_composite ON st_pre_market_orders(stock_id, order_type, price, order_rank);