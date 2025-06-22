-- Migration: Create new detailed sectors table with 4-level hierarchy
-- Date: 2025-06-22
-- Purpose: Implement detailed sector classification for Indian stock market

CREATE TABLE st_detailed_sectors (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    macro_sector VARCHAR(100) NOT NULL COMMENT 'Top level sector (e.g., Consumer Discretionary)',
    sector VARCHAR(100) NOT NULL COMMENT 'Second level sector (e.g., Consumer Services)',
    industry VARCHAR(100) NOT NULL COMMENT 'Third level industry (e.g., Retailing)',
    basic_industry VARCHAR(100) NOT NULL COMMENT 'Fourth level basic industry (e.g., Speciality Retail)',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique sector code for API integration',
    description TEXT COMMENT 'Detailed description of the sector classification',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_st_detailed_sectors_macro_sector ON st_detailed_sectors(macro_sector);
CREATE INDEX idx_st_detailed_sectors_sector ON st_detailed_sectors(sector);
CREATE INDEX idx_st_detailed_sectors_industry ON st_detailed_sectors(industry);
CREATE INDEX idx_st_detailed_sectors_basic_industry ON st_detailed_sectors(basic_industry);
CREATE INDEX idx_st_detailed_sectors_code ON st_detailed_sectors(code);
CREATE INDEX idx_st_detailed_sectors_is_active ON st_detailed_sectors(is_active);

-- Add foreign key column to st_stocks table
ALTER TABLE st_stocks 
ADD COLUMN detailed_sector_id INTEGER AFTER currency_id,
ADD CONSTRAINT st_stocks_detailed_sector_id_foreign 
    FOREIGN KEY (detailed_sector_id) REFERENCES st_detailed_sectors(id) ON DELETE SET NULL;

-- Create index on the foreign key
CREATE INDEX idx_st_stocks_detailed_sector_id ON st_stocks(detailed_sector_id);