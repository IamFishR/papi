-- Migration: Enhance st_stocks table with Indian-specific fields
-- Date: 2025-06-22
-- Purpose: Add Indian stock market specific fields for comprehensive data tracking

ALTER TABLE st_stocks 
ADD COLUMN isin VARCHAR(12) AFTER symbol COMMENT 'International Securities Identification Number',
ADD COLUMN face_value DECIMAL(8,2) AFTER market_cap COMMENT 'Par value of shares',
ADD COLUMN issued_size BIGINT AFTER face_value COMMENT 'Total shares issued',
ADD COLUMN listing_date DATE AFTER issued_size COMMENT 'When stock was listed on exchange',
ADD COLUMN is_fno_enabled BOOLEAN NOT NULL DEFAULT FALSE AFTER listing_date COMMENT 'Futures & Options availability',
ADD COLUMN is_slb_enabled BOOLEAN NOT NULL DEFAULT FALSE AFTER is_fno_enabled COMMENT 'Securities Lending & Borrowing availability',
ADD COLUMN surveillance_stage VARCHAR(50) AFTER is_slb_enabled COMMENT 'LTASM stages and other surveillance measures',
ADD COLUMN derivatives_available BOOLEAN NOT NULL DEFAULT FALSE AFTER surveillance_stage COMMENT 'General derivatives availability flag',
ADD COLUMN tick_size DECIMAL(8,2) AFTER derivatives_available COMMENT 'Minimum price movement allowed';

-- Create indexes for better query performance
CREATE INDEX idx_st_stocks_isin ON st_stocks(isin);
CREATE INDEX idx_st_stocks_listing_date ON st_stocks(listing_date);
CREATE INDEX idx_st_stocks_is_fno_enabled ON st_stocks(is_fno_enabled);
CREATE INDEX idx_st_stocks_is_slb_enabled ON st_stocks(is_slb_enabled);
CREATE INDEX idx_st_stocks_derivatives_available ON st_stocks(derivatives_available);
CREATE INDEX idx_st_stocks_surveillance_stage ON st_stocks(surveillance_stage);