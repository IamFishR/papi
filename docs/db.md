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
**Purpose**: Stock information and metadata
**Primary Key**: Auto-increment integer

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| symbol | VARCHAR(20) | Stock ticker symbol (unique) |
| company_name | VARCHAR(100) | Company name |
| description | TEXT | Company description |
| exchange_id | INTEGER | Foreign key to exchanges |
| sector_id | INTEGER | Foreign key to sectors |
| currency_id | INTEGER | Foreign key to currencies |
| market_cap | BIGINT | Market capitalization |
| pe_ratio | DECIMAL(10,2) | Price-to-earnings ratio |
| dividend_yield | DECIMAL(5,2) | Dividend yield percentage |
| beta | DECIMAL(6,3) | Stock beta value |
| is_active | BOOLEAN | Active status |
| last_updated | DATETIME | Last data update |

**Indexes**:
- Index on `symbol`
- Index on `exchange_id`
- Index on `sector_id`
- Index on `is_active`

#### `st_stock_prices`
**Purpose**: Historical stock price data (OHLCV)
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

**Indexes**:
- Index on `stock_id`
- Index on `price_date`
- Index on `close_price`
- Index on `volume`

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
**Purpose**: Industry sector classifications

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(100) | Sector name |
| description | TEXT | Sector description |
| is_active | BOOLEAN | Active status |

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
- **Sectors**  **Stocks** (One-to-Many)
- **Currencies**  **Stocks** (One-to-Many)
- **Stocks**  **Stock Prices** (One-to-Many)
- **Stocks**  **Alerts** (One-to-Many)

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

## Seeding Strategy

Initial data and sample data are provided through seeders in `/src/database/seeders/`, including:
- Sample users and authentication data
- Global stock exchanges and market data
- Industry sectors and currencies
- Sample stocks and historical prices
- Default alert configurations