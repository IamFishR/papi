# Detailed Table Structure with All Fields/Columns

## 1. **st_stocks** Table (Enhanced)

### Existing columns (keep as-is):
- `id` INTEGER AUTO_INCREMENT PRIMARY KEY
- `symbol` VARCHAR(20) UNIQUE
- `company_name` VARCHAR(100)
- `description` TEXT
- `exchange_id` INTEGER
- `currency_id` INTEGER
- `market_cap` BIGINT
- `pe_ratio` DECIMAL(10,2)
- `dividend_yield` DECIMAL(5,2)
- `beta` DECIMAL(6,3)
- `is_active` BOOLEAN
- `last_updated` DATETIME
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### New columns to add:
- `isin` VARCHAR(12) UNIQUE
- `face_value` DECIMAL(8,2) DEFAULT 1.00
- `issued_size` BIGINT
- `listing_date` DATE
- `is_fno_enabled` BOOLEAN DEFAULT FALSE
- `is_cas_enabled` BOOLEAN DEFAULT FALSE
- `is_slb_enabled` BOOLEAN DEFAULT FALSE
- `is_debt_sec` BOOLEAN DEFAULT FALSE
- `is_etf_sec` BOOLEAN DEFAULT FALSE
- `is_delisted` BOOLEAN DEFAULT FALSE
- `is_suspended` BOOLEAN DEFAULT FALSE
- `is_municipal_bond` BOOLEAN DEFAULT FALSE
- `is_hybrid_symbol` BOOLEAN DEFAULT FALSE
- `is_top10` BOOLEAN DEFAULT FALSE
- `identifier` VARCHAR(50)
- `trading_status` ENUM('Active', 'Suspended', 'Delisted') DEFAULT 'Active'
- `trading_segment` VARCHAR(50) DEFAULT 'Normal Market'
- `board_status` VARCHAR(20) DEFAULT 'Main'
- `class_of_share` VARCHAR(20) DEFAULT 'Equity'
- `derivatives_available` BOOLEAN DEFAULT FALSE
- `surveillance_stage` VARCHAR(50)
- `surveillance_description` TEXT
- `tick_size` DECIMAL(8,2) DEFAULT 0.05
- `sector_detailed_id` INTEGER
- `temp_suspended_series` JSON
- `active_series` JSON
- `debt_series` JSON

## 2. **st_stock_prices** Table (Enhanced)

### Existing columns (keep as-is):
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `stock_id` INTEGER
- `price_date` DATE
- `open_price` DECIMAL(12,4)
- `close_price` DECIMAL(12,4)
- `high_price` DECIMAL(12,4)
- `low_price` DECIMAL(12,4)
- `adjusted_close` DECIMAL(12,4)
- `volume` DECIMAL(15,4)
- `data_source` VARCHAR(50)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### New columns to add:
- `last_price` DECIMAL(12,4)
- `previous_close` DECIMAL(12,4)
- `price_change` DECIMAL(12,4)
- `price_change_percent` DECIMAL(8,4)
- `vwap` DECIMAL(12,4)
- `base_price` DECIMAL(12,4)
- `lower_circuit_price` DECIMAL(12,4)
- `upper_circuit_price` DECIMAL(12,4)
- `intraday_min` DECIMAL(12,4)
- `intraday_max` DECIMAL(12,4)
- `week_high` DECIMAL(12,4)
- `week_low` DECIMAL(12,4)
- `week_high_date` DATE
- `week_low_date` DATE
- `session_type` VARCHAR(20) DEFAULT 'Regular'
- `market_type` VARCHAR(10) DEFAULT 'NM'
- `series` VARCHAR(5) DEFAULT 'EQ'
- `price_band` VARCHAR(20)
- `stock_ind_close_price` DECIMAL(12,4)
- `inav_value` DECIMAL(12,4)
- `check_inav` BOOLEAN DEFAULT FALSE

## 3. **st_detailed_sectors** Table (New)

```sql
CREATE TABLE st_detailed_sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    macro_sector VARCHAR(100),                 -- Consumer Discretionary
    sector VARCHAR(100),                       -- Consumer Services
    industry VARCHAR(100),                     -- Retailing
    basic_industry VARCHAR(100),               -- Speciality Retail
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_classification (macro_sector, sector, industry, basic_industry)
);
```

## 4. **st_stock_indices** Table (New)

```sql
CREATE TABLE st_stock_indices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    index_name VARCHAR(100) UNIQUE,            -- NIFTY 50
    index_code VARCHAR(20),                    -- NIFTY50
    index_type VARCHAR(50),                    -- Equity, Sector, Thematic
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 5. **st_stock_index_memberships** Table (New)

```sql
CREATE TABLE st_stock_index_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_id INT,
    index_id INT,
    added_date DATE,
    removed_date DATE,
    weight DECIMAL(8,4),                       -- Index weight percentage
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
    FOREIGN KEY (index_id) REFERENCES st_stock_indices(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stock_index (stock_id, index_id)
);
```

## 6. **st_pre_market_data** Table (New)

```sql
CREATE TABLE st_pre_market_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_id INT,
    trade_date DATE,
    series VARCHAR(5) DEFAULT 'EQ',
    iep DECIMAL(12,4),                         -- Indicative Equilibrium Price
    total_traded_volume BIGINT,
    final_price DECIMAL(12,4),
    final_quantity BIGINT,
    total_buy_quantity BIGINT,
    total_sell_quantity BIGINT,
    ato_buy_qty BIGINT DEFAULT 0,              -- At The Open buy quantity
    ato_sell_qty BIGINT DEFAULT 0,             -- At The Open sell quantity
    price_change DECIMAL(12,4),
    price_change_percent DECIMAL(8,4),
    previous_close DECIMAL(12,4),
    last_update_time DATETIME,
    session_no VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
    INDEX idx_stock_date (stock_id, trade_date),
    UNIQUE KEY unique_stock_date_series (stock_id, trade_date, series)
);
```

## 7. **st_pre_market_orders** Table (New)

```sql
CREATE TABLE st_pre_market_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pre_market_data_id BIGINT,
    price DECIMAL(12,4),
    buy_qty INT DEFAULT 0,
    sell_qty INT DEFAULT 0,
    is_iep BOOLEAN DEFAULT FALSE,              -- Indicative Equilibrium Price flag
    order_sequence INT,                        -- Order in the book
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pre_market_data_id) REFERENCES st_pre_market_data(id) ON DELETE CASCADE,
    INDEX idx_pre_market_price (pre_market_data_id, price)
);
```

## 8. **st_valuation_metrics** Table (New)

```sql
CREATE TABLE st_valuation_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_id INT,
    valuation_date DATE,
    series VARCHAR(5) DEFAULT 'EQ',
    sector_pe DECIMAL(10,4),                   -- pdSectorPe
    symbol_pe DECIMAL(10,4),                   -- pdSymbolPe
    sector_pb DECIMAL(10,4),
    symbol_pb DECIMAL(10,4),
    primary_sector_index VARCHAR(100),         -- pdSectorInd
    market_cap BIGINT,
    book_value DECIMAL(12,4),
    roe DECIMAL(8,4),
    debt_to_equity DECIMAL(8,4),
    eps DECIMAL(12,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stock_date_series (stock_id, valuation_date, series)
);
```

## 9. **st_sdd_details** Table (New)

```sql
CREATE TABLE st_sdd_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_id INT,
    sdd_auditor VARCHAR(100),
    sdd_status VARCHAR(50),
    effective_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES st_stocks(id) ON DELETE CASCADE
);
```

## 10. **st_exchanges** Table (Enhanced)

### Add these columns to existing table:
- `exchange_segment` VARCHAR(50)               -- Normal Market, etc.
- `market_type` VARCHAR(20)                   -- NM, etc.
- `surveillance_enabled` BOOLEAN DEFAULT FALSE
- `pre_market_enabled` BOOLEAN DEFAULT FALSE
- `after_market_enabled` BOOLEAN DEFAULT FALSE
- `sdd_enabled` BOOLEAN DEFAULT FALSE

## Key Relationships Summary:

- `st_stocks.sector_detailed_id` → `st_detailed_sectors.id`
- `st_stock_index_memberships` connects `st_stocks` ↔ `st_stock_indices`
- `st_pre_market_data.stock_id` → `st_stocks.id`
- `st_pre_market_orders.pre_market_data_id` → `st_pre_market_data.id`
- `st_valuation_metrics.stock_id` → `st_stocks.id`
- `st_sdd_details.stock_id` → `st_stocks.id`

This structure captures all the rich data from your Indian stock market API response while maintaining proper normalization and performance.