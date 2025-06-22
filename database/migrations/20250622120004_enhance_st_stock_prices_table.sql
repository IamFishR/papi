-- Migration: Enhance st_stock_prices table with additional price data
-- Date: 2025-06-22
-- Purpose: Add comprehensive price tracking fields for Indian stock market data

ALTER TABLE st_stock_prices 
ADD COLUMN previous_close DECIMAL(12,4) AFTER close_price COMMENT 'Previous trading day closing price',
ADD COLUMN price_change DECIMAL(12,4) AFTER previous_close COMMENT 'Absolute price change from previous close',
ADD COLUMN price_change_percent DECIMAL(8,4) AFTER price_change COMMENT 'Percentage change from previous close',
ADD COLUMN vwap DECIMAL(12,4) AFTER price_change_percent COMMENT 'Volume Weighted Average Price',
ADD COLUMN lower_circuit_price DECIMAL(12,4) AFTER vwap COMMENT 'Lower circuit limit price',
ADD COLUMN upper_circuit_price DECIMAL(12,4) AFTER lower_circuit_price COMMENT 'Upper circuit limit price',
ADD COLUMN week_52_high DECIMAL(12,4) AFTER upper_circuit_price COMMENT '52-week high price',
ADD COLUMN week_52_low DECIMAL(12,4) AFTER week_52_high COMMENT '52-week low price',
ADD COLUMN week_52_high_date DATE AFTER week_52_low COMMENT 'Date when 52-week high was reached',
ADD COLUMN week_52_low_date DATE AFTER week_52_high_date COMMENT 'Date when 52-week low was reached',
ADD COLUMN total_trades BIGINT AFTER volume COMMENT 'Total number of trades executed',
ADD COLUMN deliverable_quantity BIGINT AFTER total_trades COMMENT 'Quantity available for delivery',
ADD COLUMN deliverable_percentage DECIMAL(5,2) AFTER deliverable_quantity COMMENT 'Percentage of deliverable quantity';

-- Create indexes for better query performance
CREATE INDEX idx_st_stock_prices_previous_close ON st_stock_prices(previous_close);
CREATE INDEX idx_st_stock_prices_price_change_percent ON st_stock_prices(price_change_percent);
CREATE INDEX idx_st_stock_prices_vwap ON st_stock_prices(vwap);
CREATE INDEX idx_st_stock_prices_week_52_high ON st_stock_prices(week_52_high);
CREATE INDEX idx_st_stock_prices_week_52_low ON st_stock_prices(week_52_low);
CREATE INDEX idx_st_stock_prices_total_trades ON st_stock_prices(total_trades);
CREATE INDEX idx_st_stock_prices_deliverable_percentage ON st_stock_prices(deliverable_percentage);