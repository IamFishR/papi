# Database Structure Documentation

## Overview

This document provides a comprehensive overview of the database structure for the Personal Asset Pricing Intelligence (PAPI) system. The database is built using MySQL with Sequelize ORM and includes sophisticated financial tracking, alerting, and trading journal capabilities.

## Technology Stack

- **Database**: MySQL
- **ORM**: Sequelize
- **Features**: 
  - Soft deletes (paranoid mode)
  - Timestamps (created_at, updated_at)
  - UUID primary keys for user-related tables
  - Comprehensive indexing strategy
  - Foreign key constraints

## Database Tables

### Core User Management

#### `users`
**Purpose**: User authentication and profile management
**Primary Key**: UUID

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated UUID) |
| first_name | VARCHAR(50) | User's first name |
| last_name | VARCHAR(50) | User's last name |
| email | VARCHAR | Unique email address |
| password | VARCHAR | Hashed password |
| role | ENUM('user', 'admin') | User role |
| is_email_verified | BOOLEAN | Email verification status |
| is_active | BOOLEAN | Account active status |
| last_login | DATETIME | Last login timestamp |
| refresh_token | VARCHAR | JWT refresh token |
| phone | VARCHAR | Phone number |
| address | VARCHAR | Street address |
| city | VARCHAR | City |
| state | VARCHAR | State/Province |
| zip_code | VARCHAR | Postal code |
| country | VARCHAR | Country |
| deleted_at | DATETIME | Soft delete timestamp |

**Indexes**: 
- Unique index on `email`
- Index on `is_active`

**Relationships**:
- One-to-many with `st_alerts`
- One-to-many with `st_watchlists`
- One-to-many with `trade_journal_entries`
- One-to-many with `orders`

---

### Stock Market Data

#### `st_stocks`
**Purpose**: Stock information and metadata (Enhanced for Indian market)
**Primary Key**: Auto-increment integer

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| symbol | VARCHAR(20) | Stock ticker symbol (unique) |
| company_name | VARCHAR(100) | Company name |
| description | TEXT | Company description |
| exchange_id | INTEGER | Foreign key to exchanges |
| sector_id | INTEGER | Foreign key to sectors (legacy) |
| sector_detailed_id | INTEGER | Foreign key to detailed sectors (new) |
| currency_id | INTEGER | Foreign key to currencies |
| market_cap | BIGINT | Market capitalization |
| pe_ratio | DECIMAL(10,2) | Price-to-earnings ratio |
| dividend_yield | DECIMAL(5,2) | Dividend yield percentage |
| beta | DECIMAL(6,3) | Stock beta value |
| is_active | BOOLEAN | Active status |
| last_updated | DATETIME | Last data update |
| **isin** | VARCHAR(12) | **International Securities Identification Number** |
| **face_value** | DECIMAL(8,2) | **Face value of the stock** |
| **issued_size** | BIGINT | **Total issued shares** |
| **listing_date** | DATE | **Stock listing date** |
| **is_fno_enabled** | BOOLEAN | **Futures & Options enabled** |
| **is_cas_enabled** | BOOLEAN | **Corporate Action Service enabled** |
| **is_slb_enabled** | BOOLEAN | **Securities Lending & Borrowing enabled** |
| **is_debt_sec** | BOOLEAN | **Debt security flag** |
| **is_etf_sec** | BOOLEAN | **ETF security flag** |
| **is_delisted** | BOOLEAN | **Delisted status** |
| **is_suspended** | BOOLEAN | **Suspended status** |
| **is_municipal_bond** | BOOLEAN | **Municipal bond flag** |
| **is_hybrid_symbol** | BOOLEAN | **Hybrid symbol flag** |
| **is_top10** | BOOLEAN | **Top 10 securities flag** |
| **identifier** | VARCHAR(50) | **Stock identifier** |
| **trading_status** | ENUM | **'Active', 'Suspended', 'Delisted'** |
| **trading_segment** | VARCHAR(50) | **Trading segment (Normal Market, etc.)** |
| **board_status** | VARCHAR(20) | **Board status (Main, SME, etc.)** |
| **class_of_share** | VARCHAR(20) | **Class of share (Equity, Preference, etc.)** |
| **derivatives_available** | BOOLEAN | **Derivatives availability** |
| **surveillance_stage** | VARCHAR(50) | **Surveillance stage (GSM, ASM, etc.)** |
| **surveillance_description** | TEXT | **Surveillance description** |
| **tick_size** | DECIMAL(8,2) | **Minimum tick size** |
| **temp_suspended_series** | JSON | **Temporarily suspended series** |
| **active_series** | JSON | **Active trading series** |
| **debt_series** | JSON | **Debt series information** |

**Indexes**:
- Index on `symbol`
- Index on `isin` (unique)
- Index on `exchange_id`
- Index on `sector_id`
- Index on `sector_detailed_id`
- Index on `is_active`
- Index on `trading_status`
- Index on `is_fno_enabled`
- Index on `surveillance_stage`

#### `st_stock_prices`
**Purpose**: Historical stock price data (Enhanced for Indian market)
**Primary Key**: Auto-increment BIGINT

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| stock_id | INTEGER | Foreign key to stocks |
| price_date | DATE | Trading date |
| open_price | DECIMAL(12,4) | Opening price |
| close_price | DECIMAL(12,4) | Closing price (required) |
| high_price | DECIMAL(12,4) | Highest price |
| low_price | DECIMAL(12,4) | Lowest price |
| adjusted_close | DECIMAL(12,4) | Adjusted closing price |
| volume | DECIMAL(15,4) | Trading volume |
| data_source | VARCHAR(50) | Data provider source |
| **last_price** | DECIMAL(12,4) | **Last traded price** |
| **previous_close** | DECIMAL(12,4) | **Previous day's closing price** |
| **price_change** | DECIMAL(12,4) | **Price change from previous close** |
| **price_change_percent** | DECIMAL(8,4) | **Percentage price change** |
| **vwap** | DECIMAL(12,4) | **Volume Weighted Average Price** |
| **base_price** | DECIMAL(12,4) | **Base price for circuit calculation** |
| **lower_circuit_price** | DECIMAL(12,4) | **Lower circuit price limit** |
| **upper_circuit_price** | DECIMAL(12,4) | **Upper circuit price limit** |
| **intraday_min** | DECIMAL(12,4) | **Intraday minimum price** |
| **intraday_max** | DECIMAL(12,4) | **Intraday maximum price** |
| **week_52_high** | DECIMAL(12,4) | **52-week high price** |
| **week_52_low** | DECIMAL(12,4) | **52-week low price** |
| **week_52_high_date** | DATE | **Date of 52-week high** |
| **week_52_low_date** | DATE | **Date of 52-week low** |
| **session_type** | VARCHAR(20) | **Trading session type (Regular, Call Auction)** |
| **market_type** | VARCHAR(10) | **Market type (NM - Normal Market)** |
| **series** | VARCHAR(5) | **Trading series (EQ, BE, etc.)** |
| **price_band** | VARCHAR(20) | **Price band classification** |
| **stock_ind_close_price** | DECIMAL(12,4) | **Stock index close price** |
| **inav_value** | DECIMAL(12,4) | **Indicative Net Asset Value (ETF)** |
| **check_inav** | BOOLEAN | **Check INAV flag** |

**Indexes**:
- Index on `stock_id`
- Index on `price_date`
- Index on `close_price`
- Index on `last_price`
- Index on `volume`
- Index on `vwap`
- Index on `session_type`
- Index on `series`

---

### Reference Data Tables

#### `st_exchanges`
**Purpose**: Stock exchange information

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| code | VARCHAR(10) | Exchange code (unique) |
| name | VARCHAR(100) | Exchange name |
| country | VARCHAR(50) | Country |
| timezone | VARCHAR(50) | Timezone |
| currency_code | VARCHAR(3) | Default currency |
| opening_time | TIME | Market opening time |
| closing_time | TIME | Market closing time |
| is_active | BOOLEAN | Active status |

**Examples**: NYSE, NASDAQ, LSE, TSX, ASX, etc.

#### `st_sectors`
**Purpose**: Industry sector classifications (Legacy)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(100) | Sector name |
| description | TEXT | Sector description |
| is_active | BOOLEAN | Active status |

#### `st_detailed_sectors` ⭐ **NEW**
**Purpose**: 4-level detailed sector hierarchy for Indian stock market

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| macro_sector | VARCHAR(100) | Macro sector (e.g., Consumer Discretionary) |
| sector | VARCHAR(100) | Sector (e.g., Consumer Services) |
| industry | VARCHAR(100) | Industry (e.g., Retailing) |
| basic_industry | VARCHAR(100) | Basic industry (e.g., Speciality Retail) |
| code | VARCHAR(50) | Unique sector code |
| description | TEXT | Sector description |
| is_active | BOOLEAN | Active status |

**Indexes**:
- Index on `macro_sector`
- Index on `sector`
- Index on `industry`
- Index on `basic_industry`
- Unique index on `code`

#### `st_currencies`
**Purpose**: Currency definitions

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| code | VARCHAR(3) | Currency code (USD, EUR, etc.) |
| name | VARCHAR(50) | Currency name |
| symbol | VARCHAR(5) | Currency symbol |
| is_active | BOOLEAN | Active status |

---

### Indian Stock Market Specific Tables ⭐ **NEW**

#### `st_stock_indices`
**Purpose**: Stock market indices (NIFTY 50, NIFTY 200, sector indices, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| index_name | VARCHAR(100) | Index name (e.g., NIFTY 50) |
| index_code | VARCHAR(50) | Index code (e.g., NIFTY50) |
| index_symbol | VARCHAR(50) | Trading symbol |
| description | TEXT | Index description |
| base_date | DATE | Base date for calculation |
| base_value | DECIMAL(12,4) | Base value |
| exchange_id | INTEGER | Foreign key to exchanges |
| currency_id | INTEGER | Foreign key to currencies |
| index_type | VARCHAR(50) | Type (MARKET_CAP, EQUAL_WEIGHT, etc.) |
| calculation_method | VARCHAR(100) | Calculation methodology |
| is_active | BOOLEAN | Active status |

#### `st_stock_index_memberships`
**Purpose**: Many-to-many relationship between stocks and indices

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| stock_id | INTEGER | Foreign key to stocks |
| index_id | INTEGER | Foreign key to indices |
| weight | DECIMAL(8,4) | Weight percentage in index |
| rank_position | INTEGER | Rank in index (1-based) |
| free_float_market_cap | BIGINT | Free float market cap |
| index_shares | BIGINT | Shares considered for index |
| added_date | DATE | Date added to index |
| removed_date | DATE | Date removed from index |
| is_active | BOOLEAN | Current membership status |

#### `st_pre_market_data`
**Purpose**: Pre-market trading data for Indian stocks

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| stock_id | INTEGER | Foreign key to stocks |
| trading_date | DATE | Trading date |
| session_start_time | TIME | Pre-market session start |
| session_end_time | TIME | Pre-market session end |
| iep | DECIMAL(12,4) | Indicative Equilibrium Price |
| iep_change | DECIMAL(12,4) | Change in IEP |
| iep_change_percent | DECIMAL(8,4) | Percentage change in IEP |
| total_traded_volume | BIGINT | Total volume traded |
| total_traded_value | DECIMAL(15,2) | Total value traded |
| total_buy_quantity | BIGINT | Total buy orders quantity |
| total_sell_quantity | BIGINT | Total sell orders quantity |
| ato_buy_qty | BIGINT | At The Open buy quantity |
| ato_sell_qty | BIGINT | At The Open sell quantity |
| final_iep | DECIMAL(12,4) | Final IEP |
| final_iep_qty | BIGINT | Final IEP quantity |
| market_type | VARCHAR(20) | Market type (REGULAR, CALL_AUCTION) |
| data_source | VARCHAR(50) | Data source (NSE, BSE) |

#### `st_pre_market_orders`
**Purpose**: Pre-market order book data

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| pre_market_data_id | BIGINT | Foreign key to pre-market data |
| stock_id | INTEGER | Foreign key to stocks |
| order_type | VARCHAR(10) | BUY or SELL |
| price | DECIMAL(12,4) | Order price level |
| quantity | BIGINT | Quantity at price level |
| number_of_orders | INTEGER | Number of orders |
| is_iep | BOOLEAN | Whether this is IEP level |
| order_rank | INTEGER | Rank in order book |
| timestamp | TIMESTAMP | Order snapshot time |
| data_source | VARCHAR(50) | Data source |

#### `st_valuation_metrics`
**Purpose**: Financial ratios and valuation metrics

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| stock_id | INTEGER | Foreign key to stocks |
| metric_date | DATE | Date for metrics |
| sector_pe | DECIMAL(8,2) | Sector P/E ratio |
| symbol_pe | DECIMAL(8,2) | Stock P/E ratio |
| sector_pb | DECIMAL(8,2) | Sector P/B ratio |
| symbol_pb | DECIMAL(8,2) | Stock P/B ratio |
| price_to_sales | DECIMAL(8,2) | Price-to-Sales ratio |
| enterprise_value | BIGINT | Enterprise Value |
| ev_to_ebitda | DECIMAL(8,2) | EV/EBITDA ratio |
| roe | DECIMAL(8,2) | Return on Equity % |
| roa | DECIMAL(8,2) | Return on Assets % |
| debt_to_equity | DECIMAL(8,2) | Debt-to-Equity ratio |
| current_ratio | DECIMAL(8,2) | Current ratio |
| quick_ratio | DECIMAL(8,2) | Quick ratio |
| gross_margin | DECIMAL(8,2) | Gross margin % |
| operating_margin | DECIMAL(8,2) | Operating margin % |
| net_margin | DECIMAL(8,2) | Net margin % |
| dividend_payout_ratio | DECIMAL(8,2) | Dividend payout % |
| book_value_per_share | DECIMAL(12,4) | Book value per share |
| earnings_per_share | DECIMAL(12,4) | Earnings per share |
| revenue_per_share | DECIMAL(12,4) | Revenue per share |
| cash_per_share | DECIMAL(12,4) | Cash per share |
| free_cash_flow_per_share | DECIMAL(12,4) | FCF per share |
| peg_ratio | DECIMAL(8,2) | PEG ratio |
| price_to_free_cash_flow | DECIMAL(8,2) | Price to FCF ratio |
| data_source | VARCHAR(50) | Data source |
| fiscal_year | INTEGER | Fiscal year |
| quarter | VARCHAR(10) | Quarter (Q1, Q2, Q3, Q4) |
| is_ttm | BOOLEAN | Trailing Twelve Months flag |

**Key Features**:
- **Pre-market Trading**: Critical for Indian markets with IEP calculation
- **Index Management**: Support for NIFTY indices and membership tracking
- **Enhanced Valuation**: Comprehensive financial ratio tracking
- **4-Level Sectors**: Detailed industry classification
- **Indian Compliance**: Support for surveillance, FNO, circuit breakers

---

### Alert System

#### `st_alerts`
**Purpose**: Comprehensive stock alert system with multiple trigger conditions
**Primary Key**: Auto-increment integer

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | UUID | Foreign key to users (nullable for orphaned alerts) |
| stock_id | INTEGER | Foreign key to stocks |
| trigger_type_id | INTEGER | Type of trigger (price, volume, indicator) |
| name | VARCHAR(100) | Alert name |
| description | TEXT | Alert description |
| price_threshold | DECIMAL(12,4) | Price threshold value |
| threshold_condition_id | INTEGER | Price condition (above, below, etc.) |
| volume_condition_id | INTEGER | Volume-based condition |
| indicator_type_id | INTEGER | Technical indicator type |
| indicator_condition_id | INTEGER | Technical indicator condition |
| sentiment_type_id | INTEGER | Market sentiment condition |
| frequency_id | INTEGER | Alert frequency setting |
| condition_logic_id | INTEGER | Logic operator for multiple conditions |
| notification_method_id | INTEGER | How to deliver notification |
| status_id | INTEGER | Alert status |
| priority_id | INTEGER | Priority level |
| risk_tolerance_id | INTEGER | Risk tolerance level |
| start_date | DATE | Alert start date |
| end_date | DATE | Alert expiration date |
| cooldown_minutes | INTEGER | Cooldown period between alerts |
| last_triggered | DATETIME | Last trigger timestamp |
| is_active | BOOLEAN | Active status |

**Advanced Features**:
- Multi-condition alerts (price AND volume AND indicator)
- Configurable cooldown periods
- Priority-based processing
- Risk tolerance integration
- Historical tracking

#### Alert Support Tables

- **`st_trigger_types`**: Price, Volume, Technical Indicator, Sentiment
- **`st_threshold_conditions`**: Above, Below, Equal, Crosses Above, Crosses Below
- **`st_volume_conditions`**: High Volume, Low Volume, Above Average, Below Average
- **`st_indicator_types`**: RSI, MACD, Moving Average, Bollinger Bands, etc.
- **`st_indicator_conditions`**: Overbought, Oversold, Bullish Crossover, etc.
- **`st_sentiment_types`**: Bullish, Bearish, Neutral
- **`st_alert_frequencies`**: Real-time, Daily, Weekly, Monthly
- **`st_condition_logic_types`**: AND, OR, NOT
- **`st_notification_methods`**: Email, SMS, Push, Webhook
- **`st_alert_statuses`**: Active, Paused, Triggered, Expired
- **`st_priority_levels`**: Low, Medium, High, Critical
- **`st_risk_tolerance_levels`**: Conservative, Moderate, Aggressive

#### `st_alert_history`
**Purpose**: Historical record of alert executions

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| alert_id | INTEGER | Foreign key to alerts |
| triggered_at | DATETIME | Trigger timestamp |
| trigger_price | DECIMAL(12,4) | Price at trigger |
| trigger_volume | DECIMAL(15,4) | Volume at trigger |
| conditions_met | JSON | Conditions that were met |
| notification_sent | BOOLEAN | Whether notification was sent |

---

### Watchlist System

#### `st_watchlists`
**Purpose**: User-created stock watchlists

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | UUID | Foreign key to users |
| name | VARCHAR(100) | Watchlist name |
| description | TEXT | Watchlist description |
| is_public | BOOLEAN | Public visibility |
| is_default | BOOLEAN | Default watchlist flag |

#### `st_watchlist_stocks`
**Purpose**: Many-to-many relationship between watchlists and stocks

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| watchlist_id | INTEGER | Foreign key to watchlists |
| stock_id | INTEGER | Foreign key to stocks |
| added_at | DATETIME | When stock was added |
| notes | TEXT | User notes for this stock |
| target_price | DECIMAL(12,4) | Target price |
| stop_loss | DECIMAL(12,4) | Stop loss price |

---

### Trading Journal System

#### `trade_journal_entries`
**Purpose**: Comprehensive trading journal with 75+ fields for detailed trade analysis
**Primary Key**: UUID

The trading journal is organized into 6 main sections:

##### Section 0: Pre-Trade Plan & Hypothesis
- `plan_date_time`: When the plan was created
- `instruments_watched`: JSON array of instruments considered
- `market_context_bias`: Overall market sentiment
- `trade_thesis_catalyst`: The fundamental reason for the trade
- `setup_conditions`: JSON array of technical setup conditions
- `planned_entry_zone_price`: Planned entry price
- `planned_stop_loss_price`: Planned stop loss
- `planned_target_prices`: JSON array of target prices
- `planned_position_size_value`: Position size
- `planned_position_size_type`: Type of position sizing
- `calculated_max_risk_on_plan`: Maximum risk amount
- `calculated_potential_reward_tp1`: Potential reward to first target
- `planned_risk_reward_ratio_tp1`: Risk/reward ratio
- `confidence_in_plan`: Confidence level (1-10)
- `invalidation_conditions`: What would invalidate the setup

##### Section 1: Trade Execution Metadata
- `strategy_tags`: JSON array of strategy classifications
- `primary_analysis_timeframe`: Main analysis timeframe
- `secondary_analysis_timeframes`: JSON array of additional timeframes
- `screenshot_setup_url`: Link to setup screenshot

##### Section 2: Entry & Exit Execution Details
- `entry_date_time`: Actual entry timestamp
- `actual_entry_price`: Actual entry price
- `quantity`: Position size
- `fees_entry`: Entry fees
- `screenshot_entry_url`: Entry screenshot
- `exit_date_time`: Exit timestamp
- `actual_exit_price`: Exit price
- `fees_exit`: Exit fees
- `screenshot_exit_url`: Exit screenshot
- `total_quantity_traded`: Total quantity
- `average_entry_price`: Average entry (for multiple fills)
- `average_exit_price`: Average exit
- `gross_pnl_per_unit`: P&L per unit
- `gross_pnl`: Total gross P&L
- `total_fees`: All fees
- `net_pnl`: Net P&L after fees
- `actual_initial_risk`: Actual risk taken
- `r_multiple_achieved`: R-multiple result
- `trade_duration_minutes`: Trade duration

##### Section 3: Trade Outcome & Objective Review
- `outcome`: Win/Loss/Breakeven/Pending
- `exit_reason_tag`: Reason for exit
- `initial_sl_hit`: Whether stop loss was hit
- `initial_tp_hit`: Whether target profit was hit
- `max_adverse_excursion`: Worst price movement against
- `max_adverse_excursion_percentage`: MAE as percentage
- `max_favorable_excursion`: Best price movement in favor
- `max_favorable_excursion_percentage`: MFE as percentage

##### Section 4: Psychological & Behavioral Review
- `confidence_in_execution`: Execution confidence (1-10)
- `dominant_emotions_pre_trade`: JSON array of emotions before trade
- `dominant_emotions_during_trade`: JSON array of emotions during trade
- `focus_level_during_trade`: Focus level (1-10)
- `followed_pre_trade_plan`: Whether plan was followed
- `deviation_type`: Type of deviation from plan
- `reason_for_deviation`: Why plan was deviated from
- `impulse_action_taken`: Whether impulse actions were taken
- `impulse_action_description`: Description of impulse actions
- `hesitation_on`: Where hesitation occurred
- `reason_for_hesitation`: Why hesitation occurred
- `traded_pnl_instead_of_plan`: Whether traded based on P&L
- `dominant_emotions_post_trade`: JSON array of post-trade emotions
- `satisfaction_with_execution`: Satisfaction level (1-10)
- `external_stressors_impact`: Whether external factors impacted
- `general_psychology_notes`: General psychological notes

##### Section 5: Analysis, Learning & Improvement
- `what_went_well`: What worked well
- `what_went_wrong`: What didn't work
- `primary_mistake_tags`: JSON array of mistake categories
- `root_cause_of_mistakes`: Root cause analysis
- `key_lesson_learned`: Main lesson learned
- `actionable_improvement`: Specific improvement action
- `overall_trade_rating`: Overall rating (1-10)
- `additional_notes`: Additional notes
- `external_analysis_link`: Link to external analysis

**Key Features**:
- Comprehensive psychological analysis
- Risk management tracking
- Performance attribution
- Learning and improvement focus
- Screenshot and external link storage
- JSON fields for complex data structures

---

### Additional Features

#### `st_technical_indicators`
**Purpose**: Technical analysis indicators for stocks

#### `st_news_mentions`
**Purpose**: News mentions and sentiment analysis

#### `st_notification_queue`
**Purpose**: Notification delivery queue management

#### `user_preferences`
**Purpose**: User-specific application preferences

#### `user_custom_tags`
**Purpose**: User-defined custom tags for categorization

---

## Relationships Summary

### User-Centric Relationships
- **Users**  **Alerts** (One-to-Many)
- **Users**  **Watchlists** (One-to-Many)
- **Users**  **Trade Journal Entries** (One-to-Many)
- **Users**  **User Preferences** (One-to-One)

### Stock Market Data Relationships
- **Exchanges**  **Stocks** (One-to-Many)
- **Sectors**  **Stocks** (One-to-Many) - Legacy
- **Detailed Sectors**  **Stocks** (One-to-Many) - New 4-level hierarchy
- **Currencies**  **Stocks** (One-to-Many)
- **Stocks**  **Stock Prices** (One-to-Many)
- **Stocks**  **Alerts** (One-to-Many)

### Indian Stock Market Relationships ⭐ **NEW**
- **Stock Indices**  **Stock Index Memberships** (One-to-Many)
- **Stocks**  **Stock Index Memberships** (One-to-Many)
- **Stocks**  **Pre-Market Data** (One-to-Many)
- **Pre-Market Data**  **Pre-Market Orders** (One-to-Many)
- **Stocks**  **Valuation Metrics** (One-to-Many)

### Alert System Relationships
- **Alerts**  **Alert History** (One-to-Many)
- **Alerts**  **Notification Queue** (One-to-Many)
- Multiple lookup tables provide reference data for alerts

### Watchlist Relationships
- **Watchlists**  **Stocks** (Many-to-Many via `st_watchlist_stocks`)

## Indexes and Performance

The database includes comprehensive indexing:
- **Primary Keys**: All tables have optimized primary keys
- **Foreign Keys**: All foreign key relationships are indexed
- **Business Logic**: Key business fields (active status, dates, prices) are indexed
- **Composite Indexes**: Multi-column indexes for complex queries

## Data Integrity

- **Foreign Key Constraints**: Enforce referential integrity
- **Validation Rules**: Model-level and database-level validation
- **Soft Deletes**: Paranoid mode prevents accidental data loss
- **Timestamps**: Automatic created_at and updated_at tracking
- **Unique Constraints**: Prevent duplicate critical data

## Migration Strategy

All schema changes are managed through Sequelize migrations located in `/src/database/migrations/`. Migrations are timestamped and ensure consistent database evolution across environments.

### Recent Enhancements ⭐ **NEW**

The database has been significantly enhanced to support Indian stock market requirements:

**Migration Files Added (2025-06-22)**:
- `20250622120001_drop_old_sector_industry_structure.sql`
- `20250622120002_create_detailed_sectors_table.sql`
- `20250622120003_enhance_st_stocks_table.sql`
- `20250622120004_enhance_st_stock_prices_table.sql`
- `20250622120005_create_stock_indices_table.sql`
- `20250622120006_create_stock_index_memberships_table.sql`
- `20250622120007_create_pre_market_data_table.sql`
- `20250622120008_create_pre_market_orders_table.sql`
- `20250622120009_create_valuation_metrics_table.sql`

## Seeding Strategy

Initial data and sample data are provided through seeders in `/src/database/seeders/`, including:
- Sample users and authentication data
- Global stock exchanges and market data
- Industry sectors and currencies (both legacy and detailed)
- Sample stocks and historical prices
- Default alert configurations
- Sample Indian market data (NIFTY indices, pre-market data, valuation metrics)

## API Enhancements ⭐ **NEW**

**New API Modules Created**:
- **Detailed Sectors API**: `/api/v1/sectors/detailed` - 4-level sector hierarchy management
- **Pre-Market Data API**: `/api/v1/pre-market` - IEP tracking and order book data
- **Stock Indices API**: `/api/v1/indices` - NIFTY indices and membership management
- **Valuation Metrics API**: `/api/v1/valuation` - Financial ratios and sector comparisons

**Enhanced Existing APIs**:
- **Stocks API**: Added Indian-specific fields (ISIN, FNO, surveillance, circuit breakers)
- **Stock Prices API**: Enhanced with VWAP, price bands, 52-week highs/lows
- **Validation**: Comprehensive validation for all new Indian market fields

## Key Benefits

1. **Comprehensive Indian Market Support**: Full support for NSE/BSE data structures
2. **Advanced Sector Classification**: 4-level detailed sector hierarchy
3. **Pre-Market Trading**: Critical IEP and order book tracking
4. **Index Management**: Complete NIFTY index and membership tracking
5. **Enhanced Analytics**: Comprehensive valuation metrics and financial ratios
6. **Regulatory Compliance**: Support for surveillance stages, circuit breakers, FNO status
7. **Data Integrity**: Proper foreign keys, indexes, and validation
8. **Performance Optimized**: Strategic indexing for Indian market queries