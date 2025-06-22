-- Migration: Create stock index memberships table for many-to-many relationship
-- Date: 2025-06-22
-- Purpose: Track which stocks belong to which indices with weighting information

CREATE TABLE st_stock_index_memberships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id INTEGER NOT NULL COMMENT 'Reference to stock',
    index_id INTEGER NOT NULL COMMENT 'Reference to index',
    weight DECIMAL(8,4) COMMENT 'Weight of stock in the index (for weighted indices)',
    rank_position INTEGER COMMENT 'Rank position in the index (1-based)',
    free_float_market_cap BIGINT COMMENT 'Free float market cap used for index calculation',
    index_shares BIGINT COMMENT 'Number of shares considered for index calculation',
    added_date DATE NOT NULL COMMENT 'Date when stock was added to index',
    removed_date DATE COMMENT 'Date when stock was removed from index (NULL if still active)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether stock is currently in the index',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT st_stock_index_memberships_stock_id_foreign 
        FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
    CONSTRAINT st_stock_index_memberships_index_id_foreign 
        FOREIGN KEY (index_id) REFERENCES st_stock_indices(id) ON DELETE CASCADE,
        
    -- Unique constraint to prevent duplicate memberships
    UNIQUE KEY unique_active_membership (stock_id, index_id, is_active)
);

-- Create indexes for better query performance
CREATE INDEX idx_st_stock_index_memberships_stock_id ON st_stock_index_memberships(stock_id);
CREATE INDEX idx_st_stock_index_memberships_index_id ON st_stock_index_memberships(index_id);
CREATE INDEX idx_st_stock_index_memberships_weight ON st_stock_index_memberships(weight);
CREATE INDEX idx_st_stock_index_memberships_rank_position ON st_stock_index_memberships(rank_position);
CREATE INDEX idx_st_stock_index_memberships_added_date ON st_stock_index_memberships(added_date);
CREATE INDEX idx_st_stock_index_memberships_is_active ON st_stock_index_memberships(is_active);
CREATE INDEX idx_st_stock_index_memberships_active_by_index ON st_stock_index_memberships(index_id, is_active, rank_position);