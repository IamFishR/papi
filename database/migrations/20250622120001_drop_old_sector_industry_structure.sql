-- Migration: Drop old sector/industry structure and prepare for new detailed sectors
-- Date: 2025-06-22
-- Purpose: Remove existing st_sectors and st_industries tables to implement new 4-level hierarchy

-- First, remove foreign key constraints from st_stocks table
ALTER TABLE st_stocks 
DROP FOREIGN KEY st_stocks_sector_id_foreign,
DROP FOREIGN KEY st_stocks_industry_id_foreign;

-- Remove the sector_id and industry_id columns from st_stocks
ALTER TABLE st_stocks 
DROP COLUMN sector_id,
DROP COLUMN industry_id;

-- Drop the industries table (has foreign key to sectors)
DROP TABLE IF EXISTS st_industries;

-- Drop the sectors table
DROP TABLE IF EXISTS st_sectors;