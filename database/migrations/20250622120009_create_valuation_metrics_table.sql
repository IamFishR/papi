-- Migration: Create valuation metrics table for financial ratios
-- Date: 2025-06-22
-- Purpose: Store financial ratios and valuation metrics for stocks

CREATE TABLE st_valuation_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id INTEGER NOT NULL COMMENT 'Reference to stock',
    metric_date DATE NOT NULL COMMENT 'Date for which metrics are calculated',
    sector_pe DECIMAL(8,2) COMMENT 'Sector Price-to-Earnings ratio',
    symbol_pe DECIMAL(8,2) COMMENT 'Stock Price-to-Earnings ratio',
    sector_pb DECIMAL(8,2) COMMENT 'Sector Price-to-Book ratio',
    symbol_pb DECIMAL(8,2) COMMENT 'Stock Price-to-Book ratio',
    price_to_sales DECIMAL(8,2) COMMENT 'Price-to-Sales ratio',
    enterprise_value BIGINT COMMENT 'Enterprise Value',
    ev_to_ebitda DECIMAL(8,2) COMMENT 'EV to EBITDA ratio',
    roe DECIMAL(8,2) COMMENT 'Return on Equity percentage',
    roa DECIMAL(8,2) COMMENT 'Return on Assets percentage',
    debt_to_equity DECIMAL(8,2) COMMENT 'Debt-to-Equity ratio',
    current_ratio DECIMAL(8,2) COMMENT 'Current Ratio',
    quick_ratio DECIMAL(8,2) COMMENT 'Quick Ratio',
    gross_margin DECIMAL(8,2) COMMENT 'Gross Margin percentage',
    operating_margin DECIMAL(8,2) COMMENT 'Operating Margin percentage',
    net_margin DECIMAL(8,2) COMMENT 'Net Margin percentage',
    dividend_payout_ratio DECIMAL(8,2) COMMENT 'Dividend Payout Ratio percentage',
    book_value_per_share DECIMAL(12,4) COMMENT 'Book Value per Share',
    earnings_per_share DECIMAL(12,4) COMMENT 'Earnings per Share',
    revenue_per_share DECIMAL(12,4) COMMENT 'Revenue per Share',
    cash_per_share DECIMAL(12,4) COMMENT 'Cash per Share',
    free_cash_flow_per_share DECIMAL(12,4) COMMENT 'Free Cash Flow per Share',
    peg_ratio DECIMAL(8,2) COMMENT 'PEG Ratio (PE to Growth)',
    price_to_free_cash_flow DECIMAL(8,2) COMMENT 'Price to Free Cash Flow ratio',
    data_source VARCHAR(50) COMMENT 'Source of the valuation data',
    fiscal_year INTEGER COMMENT 'Fiscal year for annual metrics',
    quarter VARCHAR(10) COMMENT 'Quarter for quarterly metrics (Q1, Q2, Q3, Q4)',
    is_ttm BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether metrics are Trailing Twelve Months',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT st_valuation_metrics_stock_id_foreign 
        FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
        
    -- Unique constraint to prevent duplicate metrics for same stock and date
    UNIQUE KEY unique_stock_metric_date (stock_id, metric_date, fiscal_year, quarter)
);

-- Create indexes for better query performance
CREATE INDEX idx_st_valuation_metrics_stock_id ON st_valuation_metrics(stock_id);
CREATE INDEX idx_st_valuation_metrics_metric_date ON st_valuation_metrics(metric_date);
CREATE INDEX idx_st_valuation_metrics_sector_pe ON st_valuation_metrics(sector_pe);
CREATE INDEX idx_st_valuation_metrics_symbol_pe ON st_valuation_metrics(symbol_pe);
CREATE INDEX idx_st_valuation_metrics_symbol_pb ON st_valuation_metrics(symbol_pb);
CREATE INDEX idx_st_valuation_metrics_roe ON st_valuation_metrics(roe);
CREATE INDEX idx_st_valuation_metrics_roa ON st_valuation_metrics(roa);
CREATE INDEX idx_st_valuation_metrics_fiscal_year ON st_valuation_metrics(fiscal_year);
CREATE INDEX idx_st_valuation_metrics_quarter ON st_valuation_metrics(quarter);
CREATE INDEX idx_st_valuation_metrics_is_ttm ON st_valuation_metrics(is_ttm);
CREATE INDEX idx_st_valuation_metrics_data_source ON st_valuation_metrics(data_source);