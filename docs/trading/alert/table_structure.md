# Stock Alert System Database Schema

## Lookup Tables

### Table: trigger_types
Stores alert trigger type values
```sql
CREATE TABLE st_trigger_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO trigger_types (name, description) VALUES
('stock_price', 'Alerts based on stock price changes or thresholds'),
('volume', 'Alerts based on trading volume metrics'),
('technical_indicator', 'Alerts based on technical analysis indicators'),
('news', 'Alerts based on news mentions and sentiment'),
('portfolio', 'Alerts based on portfolio performance metrics');
```

### Table: threshold_conditions
Stores price and indicator threshold conditions
```sql
CREATE TABLE st_threshold_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO threshold_conditions (name, description) VALUES
('above', 'Value is above the threshold'),
('below', 'Value is below the threshold'),
('crosses_above', 'Value crosses above the threshold'),
('crosses_below', 'Value crosses below the threshold');
```

### Table: volume_conditions
Stores volume alert conditions
```sql
CREATE TABLE st_volume_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO volume_conditions (name, description) VALUES
('above_average', 'Volume is above the average'),
('below_average', 'Volume is below the average'),
('spike', 'Volume has a sudden increase');
```

### Table: indicator_types
Stores technical indicator types
```sql
CREATE TABLE st_indicator_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    default_period INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO indicator_types (name, description, default_period) VALUES
('RSI', 'Relative Strength Index', 14),
('SMA', 'Simple Moving Average', 20),
('EMA', 'Exponential Moving Average', 20),
('MACD', 'Moving Average Convergence Divergence', 12),
('bollinger_bands', 'Bollinger Bands', 20);
```

### Table: indicator_conditions
Stores indicator conditions
```sql
CREATE TABLE st_indicator_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO indicator_conditions (name, description) VALUES
('above', 'Indicator is above the threshold'),
('below', 'Indicator is below the threshold'),
('crossover', 'Indicator crosses over another line/value'),
('crossunder', 'Indicator crosses under another line/value');
```

### Table: sentiment_types
Stores sentiment types for news analysis
```sql
CREATE TABLE st_sentiment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO sentiment_types (name, description) VALUES
('positive', 'Positive sentiment'),
('negative', 'Negative sentiment'),
('neutral', 'Neutral sentiment'),
('any', 'Any sentiment type');
```

### Table: alert_frequencies
Stores alert frequency types
```sql
CREATE TABLE st_alert_frequencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO alert_frequencies (name, description) VALUES
('immediate', 'Alert is sent immediately when triggered'),
('scheduled', 'Alert is sent at a scheduled time'),
('conditional', 'Alert is sent when multiple conditions are met'),
('recurring', 'Alert is sent on a recurring schedule');
```

### Table: condition_logic_types
Stores condition logic types for multi-condition alerts
```sql
CREATE TABLE st_condition_logic_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO condition_logic_types (name, description) VALUES
('AND', 'All conditions must be met'),
('OR', 'Any condition can be met');
```

### Table: alert_statuses
Stores alert status types
```sql
CREATE TABLE st_alert_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO alert_statuses (name, description) VALUES
('triggered', 'Alert has been triggered'),
('sent', 'Notification has been sent'),
('delivered', 'Notification has been delivered'),
('failed', 'Notification failed to send'),
('acknowledged', 'User has acknowledged the alert');
```

### Table: notification_methods
Stores notification delivery methods
```sql
CREATE TABLE st_notification_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO notification_methods (name, description) VALUES
('email', 'Email notification'),
('sms', 'SMS text message'),
('push', 'Mobile push notification'),
('webhook', 'Webhook callback to external system');
```

### Table: risk_tolerance_levels
Stores user risk tolerance levels
```sql
CREATE TABLE st_risk_tolerance_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO risk_tolerance_levels (name, description) VALUES
('conservative', 'Lower risk, lower potential returns'),
('moderate', 'Balanced risk and potential returns'),
('aggressive', 'Higher risk, higher potential returns');
```

### Table: notification_statuses
Stores notification delivery status types
```sql
CREATE TABLE st_notification_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO notification_statuses (name, description) VALUES
('pending', 'Notification is pending delivery'),
('processing', 'Notification is being processed for delivery'),
('sent', 'Notification has been sent'),
('delivered', 'Notification has been delivered'),
('failed', 'Notification failed to deliver'),
('cancelled', 'Notification was cancelled');
```

## Table: users
User table have id column as UUID to ensure uniqueness across distributed systems. the table name is `users` and it contains user information such as name, email, password, role, and other details. The `role` column is an ENUM type to differentiate between regular users and admins. The table also includes fields for email verification, account status, last login time, and additional contact information.

### Table: exchanges
Stores stock exchanges
```sql
CREATE TABLE st_exchanges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(50),
    timezone VARCHAR(50),
    open_time TIME,
    close_time TIME,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO exchanges (name, country, timezone, open_time, close_time) VALUES
('NASDAQ', 'USA', 'America/New_York', '09:30:00', '16:00:00'),
('NYSE', 'USA', 'America/New_York', '09:30:00', '16:00:00'),
('LSE', 'UK', 'Europe/London', '08:00:00', '16:30:00'),
('TSE', 'Japan', 'Asia/Tokyo', '09:00:00', '15:00:00');
```

### Table: sectors
Stores industry sectors
```sql
CREATE TABLE st_sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO sectors (name) VALUES
('Technology'),
('Healthcare'),
('Financial Services'),
('Consumer Cyclical'),
('Energy'),
('Industrials'),
('Communication Services'),
('Utilities'),
('Real Estate'),
('Consumer Defensive'),
('Basic Materials');
```

## Table: stocks
Stores basic stock information
```sql
CREATE TABLE st_stocks (
    id UUID PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    exchange_id INT,
    sector_id INT,
    market_cap DECIMAL(20,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
    FOREIGN KEY (sector_id) REFERENCES sectors(id),
    INDEX idx_symbol (symbol),
    INDEX idx_sector (sector_id),
    INDEX idx_exchange (exchange_id)
);
```

## Table: stock_prices
Stores historical and real-time stock price data
```sql
CREATE TABLE st_stock_prices (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT,
    high DECIMAL(10,4),
    low DECIMAL(10,4),
    open_price DECIMAL(10,4),
    close_price DECIMAL(10,4),
    price_date DATE NOT NULL,
    price_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    INDEX idx_stock_date (stock_id, price_date),
    INDEX idx_timestamp (price_timestamp),
    UNIQUE KEY unique_stock_price_date (stock_id, price_date)
);
```

## Table: alerts
Main alerts configuration table
```sql
CREATE TABLE st_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Alert trigger configuration
    trigger_type_id INT NOT NULL,
    stock_id UUID,
    
    -- Price alert fields
    threshold_value DECIMAL(15,4),
    threshold_condition_id INT,
    percentage_change DECIMAL(5,2),
    
    -- Volume alert fields
    volume_threshold BIGINT,
    volume_condition_id INT,
    
    -- Technical indicator fields
    indicator_type_id INT,
    indicator_period INT DEFAULT 14,
    indicator_threshold DECIMAL(10,4),
    indicator_condition_id INT,
    
    -- News alert fields
    news_keywords TEXT,
    sentiment_type_id INT,
    
    -- Alert behavior
    alert_frequency_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    cooldown_minutes INT DEFAULT 0,
    -- Conditional logic for multi-condition alerts
    condition_logic_id INT,
    parent_alert_id UUID NULL, -- For grouping related conditions
    
    -- Scheduling
    schedule_time TIME NULL,
    schedule_days SET('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_triggered_at TIMESTAMP NULL,
    
    FOREIGN KEY (trigger_type_id) REFERENCES trigger_types(id),
    FOREIGN KEY (threshold_condition_id) REFERENCES threshold_conditions(id),
    FOREIGN KEY (volume_condition_id) REFERENCES volume_conditions(id),
    FOREIGN KEY (indicator_type_id) REFERENCES indicator_types(id),
    FOREIGN KEY (indicator_condition_id) REFERENCES indicator_conditions(id),
    FOREIGN KEY (sentiment_type_id) REFERENCES sentiment_types(id),
    FOREIGN KEY (alert_frequency_id) REFERENCES alert_frequencies(id),
    FOREIGN KEY (condition_logic_id) REFERENCES condition_logic_types(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_trigger_type (trigger_type_id),
    INDEX idx_stock_alert (stock_id, is_active),
    INDEX idx_last_triggered (last_triggered_at)
);
```

## Table: alert_history
Stores history of triggered alerts
```sql
CREATE TABLE st_alert_history (
    id UUID PRIMARY KEY,
    alert_id UUID NOT NULL,
    user_id UUID NOT NULL,
    stock_id UUID,
    
    -- Trigger details
    trigger_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    threshold_condition_id INT,
    
    -- Alert content
    alert_title VARCHAR(255),
    alert_message TEXT,
    alert_data JSON, -- Store additional trigger data as JSON
    
    -- Status tracking
    status_id INT NOT NULL,
    notification_method_id INT,
    
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    
    FOREIGN KEY (threshold_condition_id) REFERENCES threshold_conditions(id),
    FOREIGN KEY (status_id) REFERENCES alert_statuses(id),
    FOREIGN KEY (notification_method_id) REFERENCES notification_methods(id),
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, triggered_at),
    INDEX idx_alert_date (alert_id, triggered_at),
    INDEX idx_status (status_id),
    INDEX idx_stock_date (stock_id, triggered_at)
);
```

### Table: currencies
Stores currency information
```sql
CREATE TABLE st_currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO currencies (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('JPY', 'Japanese Yen', '¥'),
('CAD', 'Canadian Dollar', 'C$'),
('AUD', 'Australian Dollar', 'A$');
```

## Table: user_preferences
Stores user notification and alert preferences
```sql
CREATE TABLE st_user_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    webhook_notifications BOOLEAN DEFAULT FALSE,
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(20),
    webhook_url VARCHAR(500),
    
    -- Alert timing preferences
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Alert frequency limits
    max_alerts_per_hour INT DEFAULT 10,
    max_alerts_per_day INT DEFAULT 50,
    
    -- Portfolio preferences
    default_currency_id INT,
    risk_tolerance_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (default_currency_id) REFERENCES currencies(id),
    FOREIGN KEY (risk_tolerance_id) REFERENCES risk_tolerance_levels(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

## Table: watchlists
Stores user stock watchlists
```sql
CREATE TABLE st_watchlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_watchlist (user_id, name),
    UNIQUE KEY unique_user_default (user_id, is_default)
);
```

## Table: watchlist_stocks
Junction table for watchlist and stocks many-to-many relationship
```sql
CREATE TABLE st_watchlist_stocks (
    id UUID PRIMARY KEY,
    watchlist_id UUID NOT NULL,
    stock_id UUID NOT NULL,
    position_order INT DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_watchlist_stock (watchlist_id, stock_id),
    INDEX idx_watchlist_order (watchlist_id, position_order)
);
```

### Table: news_sources
Stores news sources information
```sql
CREATE TABLE st_news_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(500),
    reliability_score DECIMAL(3,2), -- 0.00 to 1.00
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO news_sources (name, url, reliability_score) VALUES
('Bloomberg', 'https://www.bloomberg.com', 0.95),
('Reuters', 'https://www.reuters.com', 0.95),
('CNBC', 'https://www.cnbc.com', 0.85),
('Financial Times', 'https://www.ft.com', 0.90),
('Wall Street Journal', 'https://www.wsj.com', 0.90);
```

## Table: news_mentions
Stores news articles and mentions related to stocks
```sql
CREATE TABLE st_news_mentions (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL,
    
    -- News article details
    title VARCHAR(500) NOT NULL,
    content TEXT,
    url VARCHAR(1000),
    source_id INT,
    author VARCHAR(255),
    
    -- Analysis
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    sentiment_type_id INT,
    keywords TEXT, -- Comma-separated keywords
    relevance_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Timestamps
    published_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_id) REFERENCES news_sources(id),
    FOREIGN KEY (sentiment_type_id) REFERENCES sentiment_types(id),
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    INDEX idx_stock_published (stock_id, published_at),
    INDEX idx_sentiment (sentiment_type_id, published_at),
    INDEX idx_relevance (relevance_score, published_at),
    FULLTEXT INDEX idx_content_fulltext (title, content, keywords)
);
```

### Table: priority_levels
Stores notification priority levels
```sql
CREATE TABLE st_priority_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level TINYINT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO priority_levels (level, name, description) VALUES
(1, 'Critical', 'Highest priority, immediate attention required'),
(2, 'High', 'High priority notifications'),
(3, 'Medium', 'Standard priority'),
(4, 'Low', 'Low priority, can be delayed'),
(5, 'Lowest', 'Lowest priority, informational only');
```

## Table: notification_queue
Queue for managing outbound notifications
```sql
CREATE TABLE st_notification_queue (
    id UUID PRIMARY KEY,
    alert_history_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Notification details
    notification_method_id INT NOT NULL,
    recipient VARCHAR(255) NOT NULL, -- email, phone, device_token, or webhook_url
    subject VARCHAR(255),
    message TEXT NOT NULL,
    message_data JSON, -- Additional structured data
    
    -- Delivery tracking
    status_id INT NOT NULL,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    
    -- Error handling
    error_message TEXT,
    last_error_at TIMESTAMP NULL,
    
    -- Scheduling
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Priority (reference to priority_levels)
    priority_id INT DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notification_method_id) REFERENCES notification_methods(id),
    FOREIGN KEY (status_id) REFERENCES notification_statuses(id),
    FOREIGN KEY (priority_id) REFERENCES priority_levels(id),
    FOREIGN KEY (alert_history_id) REFERENCES alert_history(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status_priority (status_id, priority_id, scheduled_at),
    INDEX idx_user_status (user_id, status_id),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_attempts (attempts, max_attempts)
);
```

## Table: technical_indicators
Stores calculated technical indicators for stocks
```sql
CREATE TABLE st_technical_indicators (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL,
    indicator_type_id INT NOT NULL,
    period_length INT NOT NULL,
    indicator_value DECIMAL(15,6),
    calculation_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    FOREIGN KEY (indicator_type_id) REFERENCES indicator_types(id),
    INDEX idx_stock_indicator_date (stock_id, indicator_type_id, calculation_date),
    UNIQUE KEY unique_stock_indicator_period_date (stock_id, indicator_type_id, period_length, calculation_date)
);
```