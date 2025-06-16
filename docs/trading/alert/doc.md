# Stock Alert System Documentation

## Overview

The Stock Alert System provides comprehensive functionality for monitoring and receiving alerts on stock price movements, volume changes, technical indicators, and news. This system allows users to set up various types of alerts, manage their watchlists, and receive notifications through different channels.

## API Endpoints

All API endpoints follow RESTful conventions and are available under the `/api/v1` path prefix. Authentication is required for most endpoints.

### Authentication

All endpoints except public reference data require authentication using JWT tokens:

```
Authorization: Bearer <your_jwt_token>
```

### Error Handling

All endpoints follow a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message description",
  "errors": [
    {
      "field": "field_name",
      "message": "Detailed validation error"
    }
  ]
}
```

Common HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication error
- `403 Forbidden`: Permission error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Core Endpoints

### Stocks & Market Data

#### GET /api/v1/stocks

Retrieves a list of stocks with optional filtering.

**Query Parameters:**
- `search`: Search term for stock symbol or company name
- `exchange`: Filter by exchange ID
- `sector`: Filter by sector ID
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "stocks": [
      {
        "id": "uuid-here",
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "exchange": {
          "id": 1,
          "name": "NASDAQ"
        },
        "sector": {
          "id": 1,
          "name": "Technology"
        },
        "market_cap": 2850000000000,
        "is_active": true
      }
    ],
    "pagination": {
      "total": 120,
      "pages": 6,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### GET /api/v1/stocks/{id}

Retrieves detailed information for a specific stock.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "symbol": "AAPL",
    "company_name": "Apple Inc.",
    "exchange": {
      "id": 1,
      "name": "NASDAQ",
      "country": "USA",
      "timezone": "America/New_York",
      "open_time": "09:30:00",
      "close_time": "16:00:00"
    },
    "sector": {
      "id": 1,
      "name": "Technology"
    },
    "market_cap": 2850000000000,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/v1/stocks/{id}/prices

Retrieves historical price data for a stock with date range filtering.

**Query Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `interval`: Data interval (daily, weekly, monthly) (default: daily)

**Response:**
```json
{
  "status": "success",
  "data": {
    "stock_id": "uuid-here",
    "symbol": "AAPL",
    "prices": [
      {
        "id": "uuid-here",
        "price": 180.25,
        "volume": 75000000,
        "high": 182.30,
        "low": 179.80,
        "open_price": 180.00,
        "close_price": 180.25,
        "price_date": "2025-06-15",
        "price_timestamp": "2025-06-15T16:00:00Z"
      }
    ]
  }
}
```

#### POST /api/v1/stocks/{id}/prices

Adds new price data for a stock (requires admin authorization).

**Request Body:**
```json
{
  "price": 180.25,
  "volume": 75000000,
  "high": 182.30,
  "low": 179.80,
  "open_price": 180.00,
  "close_price": 180.25,
  "price_date": "2025-06-15"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "stock_id": "uuid-here",
    "price": 180.25,
    "volume": 75000000,
    "high": 182.30,
    "low": 179.80,
    "open_price": 180.00,
    "close_price": 180.25,
    "price_date": "2025-06-15",
    "price_timestamp": "2025-06-15T16:00:00Z"
  }
}
```

### Alerts Management

#### GET /api/v1/alerts

Retrieves a list of alerts for the authenticated user with optional filtering.

**Query Parameters:**
- `active`: Filter active/inactive alerts (true/false)
- `type`: Filter by trigger type ID
- `stock`: Filter by stock ID
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "id": "uuid-here",
        "name": "AAPL Price Alert",
        "description": "Alert when Apple stock crosses $200",
        "trigger_type": {
          "id": 1,
          "name": "stock_price"
        },
        "stock": {
          "id": "uuid-here",
          "symbol": "AAPL",
          "company_name": "Apple Inc."
        },
        "threshold_value": 200.00,
        "threshold_condition": {
          "id": 3,
          "name": "crosses_above"
        },
        "is_active": true,
        "last_triggered_at": "2025-06-10T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "pages": 1,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### POST /api/v1/alerts

Creates a new alert for the authenticated user.

**Request Body:**
```json
{
  "name": "AAPL Price Alert",
  "description": "Alert when Apple stock crosses $200",
  "trigger_type_id": 1,
  "stock_id": "uuid-here",
  "threshold_value": 200.00,
  "threshold_condition_id": 3,
  "alert_frequency_id": 1,
  "is_active": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "AAPL Price Alert",
    "description": "Alert when Apple stock crosses $200",
    "trigger_type": {
      "id": 1,
      "name": "stock_price"
    },
    "stock": {
      "id": "uuid-here",
      "symbol": "AAPL",
      "company_name": "Apple Inc."
    },
    "threshold_value": 200.00,
    "threshold_condition": {
      "id": 3,
      "name": "crosses_above"
    },
    "alert_frequency": {
      "id": 1,
      "name": "immediate"
    },
    "is_active": true,
    "created_at": "2025-06-16T10:00:00Z",
    "updated_at": "2025-06-16T10:00:00Z"
  }
}
```

#### GET /api/v1/alerts/{id}

Retrieves detailed information for a specific alert.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "AAPL Price Alert",
    "description": "Alert when Apple stock crosses $200",
    "trigger_type": {
      "id": 1,
      "name": "stock_price"
    },
    "stock": {
      "id": "uuid-here",
      "symbol": "AAPL",
      "company_name": "Apple Inc."
    },
    "threshold_value": 200.00,
    "threshold_condition": {
      "id": 3,
      "name": "crosses_above"
    },
    "alert_frequency": {
      "id": 1,
      "name": "immediate"
    },
    "is_active": true,
    "created_at": "2025-06-16T10:00:00Z",
    "updated_at": "2025-06-16T10:00:00Z",
    "last_triggered_at": null
  }
}
```

#### PUT /api/v1/alerts/{id}

Updates an existing alert.

**Request Body:**
```json
{
  "name": "AAPL Price Alert",
  "description": "Alert when Apple stock crosses $205",
  "threshold_value": 205.00,
  "is_active": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "AAPL Price Alert",
    "description": "Alert when Apple stock crosses $205",
    "trigger_type": {
      "id": 1,
      "name": "stock_price"
    },
    "stock": {
      "id": "uuid-here",
      "symbol": "AAPL",
      "company_name": "Apple Inc."
    },
    "threshold_value": 205.00,
    "threshold_condition": {
      "id": 3,
      "name": "crosses_above"
    },
    "alert_frequency": {
      "id": 1,
      "name": "immediate"
    },
    "is_active": true,
    "updated_at": "2025-06-16T11:00:00Z"
  }
}
```

#### DELETE /api/v1/alerts/{id}

Deletes an alert.

**Response:**
```json
{
  "status": "success",
  "message": "Alert deleted successfully"
}
```

#### GET /api/v1/alerts/history

Retrieves alert history with date filtering.

**Query Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `status`: Filter by status ID
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "history": [
      {
        "id": "uuid-here",
        "alert_id": "uuid-here",
        "alert_title": "AAPL Price Alert",
        "alert_message": "Apple Inc. stock crossed above $200.00",
        "trigger_value": 201.50,
        "threshold_value": 200.00,
        "threshold_condition": {
          "id": 3,
          "name": "crosses_above"
        },
        "status": {
          "id": 2,
          "name": "sent"
        },
        "notification_method": {
          "id": 1,
          "name": "email"
        },
        "triggered_at": "2025-06-15T14:30:00Z",
        "processed_at": "2025-06-15T14:30:05Z"
      }
    ],
    "pagination": {
      "total": 35,
      "pages": 2,
      "page": 1,
      "limit": 20
    }
  }
}
```

### Watchlists

#### GET /api/v1/watchlists

Retrieves watchlists for the authenticated user.

**Response:**
```json
{
  "status": "success",
  "data": {
    "watchlists": [
      {
        "id": "uuid-here",
        "name": "Tech Stocks",
        "description": "Top technology companies",
        "is_default": true,
        "is_public": false,
        "created_at": "2025-06-01T00:00:00Z",
        "updated_at": "2025-06-01T00:00:00Z",
        "stock_count": 10
      }
    ]
  }
}
```

#### POST /api/v1/watchlists

Creates a new watchlist.

**Request Body:**
```json
{
  "name": "Tech Stocks",
  "description": "Top technology companies",
  "is_default": false,
  "is_public": false
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "Tech Stocks",
    "description": "Top technology companies",
    "is_default": false,
    "is_public": false,
    "created_at": "2025-06-16T12:00:00Z",
    "updated_at": "2025-06-16T12:00:00Z"
  }
}
```

#### GET /api/v1/watchlists/{id}

Retrieves a specific watchlist with its stocks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "Tech Stocks",
    "description": "Top technology companies",
    "is_default": true,
    "is_public": false,
    "created_at": "2025-06-01T00:00:00Z",
    "updated_at": "2025-06-01T00:00:00Z",
    "stocks": [
      {
        "id": "uuid-here",
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "current_price": 180.25,
        "position_order": 1,
        "notes": "Watching for earnings announcement",
        "added_at": "2025-06-01T00:00:00Z"
      }
    ]
  }
}
```

#### PUT /api/v1/watchlists/{id}

Updates a watchlist.

**Request Body:**
```json
{
  "name": "Technology Companies",
  "description": "Top technology companies to watch",
  "is_public": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "name": "Technology Companies",
    "description": "Top technology companies to watch",
    "is_default": true,
    "is_public": true,
    "updated_at": "2025-06-16T13:00:00Z"
  }
}
```

#### DELETE /api/v1/watchlists/{id}

Deletes a watchlist.

**Response:**
```json
{
  "status": "success",
  "message": "Watchlist deleted successfully"
}
```

#### POST /api/v1/watchlists/{id}/stocks/{stock_id}

Adds a stock to a watchlist.

**Request Body:**
```json
{
  "position_order": 1,
  "notes": "Watching for earnings announcement"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "watchlist_id": "uuid-here",
    "stock_id": "uuid-here",
    "position_order": 1,
    "notes": "Watching for earnings announcement",
    "added_at": "2025-06-16T14:00:00Z"
  }
}
```

#### DELETE /api/v1/watchlists/{id}/stocks/{stock_id}

Removes a stock from a watchlist.

**Response:**
```json
{
  "status": "success",
  "message": "Stock removed from watchlist successfully"
}
```

### Notifications

#### GET /api/v1/notifications

Retrieves notifications for the authenticated user.

**Query Parameters:**
- `status`: Filter by notification status ID
- `method`: Filter by notification method ID
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid-here",
        "subject": "AAPL Price Alert",
        "message": "Apple Inc. stock crossed above $200.00",
        "status": {
          "id": 3,
          "name": "delivered"
        },
        "notification_method": {
          "id": 1,
          "name": "email"
        },
        "sent_at": "2025-06-15T14:30:05Z",
        "delivered_at": "2025-06-15T14:30:10Z"
      }
    ],
    "pagination": {
      "total": 25,
      "pages": 2,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### PUT /api/v1/notifications/{id}/acknowledge

Acknowledges a notification.

**Response:**
```json
{
  "status": "success",
  "message": "Notification acknowledged successfully"
}
```

### News & Analysis

#### GET /api/v1/stocks/{id}/news

Retrieves news for a specific stock with sentiment and date filtering.

**Query Parameters:**
- `sentiment`: Filter by sentiment type ID
- `from`: Start date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "news": [
      {
        "id": "uuid-here",
        "title": "Apple reports record quarterly earnings",
        "content": "Apple Inc. reported record quarterly earnings...",
        "url": "https://example.com/news/apple-earnings",
        "source": {
          "id": 1,
          "name": "Bloomberg"
        },
        "sentiment_score": 0.85,
        "sentiment_type": {
          "id": 1,
          "name": "positive"
        },
        "published_at": "2025-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "pages": 1,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### GET /api/v1/stocks/{id}/indicators

Retrieves technical indicators for a specific stock with type and period filtering.

**Query Parameters:**
- `type`: Filter by indicator type ID
- `period`: Filter by period length
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "status": "success",
  "data": {
    "indicators": [
      {
        "id": "uuid-here",
        "indicator_type": {
          "id": 1,
          "name": "RSI"
        },
        "period_length": 14,
        "indicator_value": 65.75,
        "calculation_date": "2025-06-15"
      }
    ]
  }
}
```

### User Preferences

#### GET /api/v1/users/preferences

Retrieves notification preferences for the authenticated user.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "webhook_notifications": false,
    "email": "user@example.com",
    "phone": null,
    "webhook_url": null,
    "quiet_hours_start": "22:00:00",
    "quiet_hours_end": "08:00:00",
    "timezone": "America/New_York",
    "max_alerts_per_hour": 10,
    "max_alerts_per_day": 50,
    "default_currency": {
      "id": 1,
      "code": "USD",
      "name": "US Dollar"
    },
    "risk_tolerance": {
      "id": 2,
      "name": "moderate"
    }
  }
}
```

#### PUT /api/v1/users/preferences

Updates notification preferences for the authenticated user.

**Request Body:**
```json
{
  "email_notifications": true,
  "sms_notifications": true,
  "push_notifications": true,
  "email": "user@example.com",
  "phone": "+15551234567",
  "quiet_hours_start": "23:00:00",
  "quiet_hours_end": "07:00:00",
  "timezone": "America/New_York",
  "max_alerts_per_day": 100,
  "default_currency_id": 1,
  "risk_tolerance_id": 3
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "email_notifications": true,
    "sms_notifications": true,
    "push_notifications": true,
    "webhook_notifications": false,
    "email": "user@example.com",
    "phone": "+15551234567",
    "webhook_url": null,
    "quiet_hours_start": "23:00:00",
    "quiet_hours_end": "07:00:00",
    "timezone": "America/New_York",
    "max_alerts_per_hour": 10,
    "max_alerts_per_day": 100,
    "default_currency": {
      "id": 1,
      "code": "USD",
      "name": "US Dollar"
    },
    "risk_tolerance": {
      "id": 3,
      "name": "aggressive"
    },
    "updated_at": "2025-06-16T15:00:00Z"
  }
}
```

### Reference Data

#### GET /api/v1/reference

Retrieves lookup data for reference tables.

**Query Parameters:**
- `type`: Lookup type (required)

**Supported lookup types:**
- `trigger-types`
- `threshold-conditions`
- `volume-conditions`
- `indicator-types`
- `indicator-conditions`
- `sentiment-types`
- `alert-frequencies`
- `condition-logic-types`
- `alert-statuses`
- `notification-methods`
- `risk-tolerance-levels`
- `notification-statuses`
- `exchanges`
- `sectors`
- `currencies`
- `news-sources`
- `priority-levels`

**Response Example (for type=trigger-types):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "stock_price",
      "description": "Alerts based on stock price changes or thresholds"
    },
    {
      "id": 2,
      "name": "volume",
      "description": "Alerts based on trading volume metrics"
    },
    {
      "id": 3,
      "name": "technical_indicator",
      "description": "Alerts based on technical analysis indicators"
    },
    {
      "id": 4,
      "name": "news",
      "description": "Alerts based on news mentions and sentiment"
    },
    {
      "id": 5,
      "name": "portfolio",
      "description": "Alerts based on portfolio performance metrics"
    }
  ]
}
```

## Database Schema

The alert system uses the following database tables:

### Lookup Tables
- `st_trigger_types`: Types of alert triggers
- `st_threshold_conditions`: Price and indicator threshold conditions
- `st_volume_conditions`: Volume alert conditions
- `st_indicator_types`: Technical indicator types
- `st_indicator_conditions`: Indicator conditions
- `st_sentiment_types`: Sentiment types for news analysis
- `st_alert_frequencies`: Alert frequency types
- `st_condition_logic_types`: Condition logic types for multi-condition alerts
- `st_alert_statuses`: Alert status types
- `st_notification_methods`: Notification delivery methods
- `st_risk_tolerance_levels`: User risk tolerance levels
- `st_notification_statuses`: Notification delivery status types
- `st_priority_levels`: Notification priority levels

### Reference Tables
- `st_exchanges`: Stock exchanges
- `st_sectors`: Industry sectors
- `st_currencies`: Currency information
- `st_news_sources`: News sources information

### Core Tables
- `st_stocks`: Basic stock information
- `st_stock_prices`: Historical and real-time stock price data
- `st_alerts`: Main alerts configuration
- `st_alert_history`: History of triggered alerts
- `st_user_preferences`: User notification and alert preferences
- `st_watchlists`: User stock watchlists
- `st_watchlist_stocks`: Junction table for watchlist and stocks
- `st_news_mentions`: News articles and mentions related to stocks
- `st_notification_queue`: Queue for managing outbound notifications
- `st_technical_indicators`: Calculated technical indicators for stocks

## Alert Triggering Logic

The alert system uses background jobs to continuously check for alert conditions and trigger notifications when conditions are met.

### Alert Processing Flow

1. **Data Collection**:
   - Stock prices are updated regularly through market data feeds.
   - Technical indicators are calculated based on price data.
   - News articles are processed and analyzed for sentiment.

2. **Alert Evaluation**:
   - For each active alert, the system evaluates the specified condition.
   - Price alerts check if the current price meets the threshold condition.
   - Volume alerts compare current volume against historical averages.
   - Technical indicator alerts evaluate indicator values against thresholds.
   - News alerts check for relevant news articles with specified sentiment.

3. **Alert Triggering**:
   - When a condition is met, the alert is triggered.
   - An entry is created in the `st_alert_history` table.
   - The alert's `last_triggered_at` timestamp is updated.

4. **Notification Generation**:
   - Based on the user's preferences, notifications are created.
   - Entries are added to the `st_notification_queue` table.

5. **Notification Delivery**:
   - A separate job processes the notification queue.
   - Notifications are sent via the specified methods (email, SMS, push, webhook).
   - Delivery status is tracked and updated.

### Cooldown Period

To prevent excessive notifications, alerts have a cooldown period:

- After an alert is triggered, it won't trigger again until the cooldown period expires.
- The cooldown period is specified in minutes in the `cooldown_minutes` field.

### Multi-Condition Alerts

Complex alerts can be created with multiple conditions:

- A parent alert can have multiple child alerts (linked via `parent_alert_id`).
- The `condition_logic_id` field specifies whether all conditions must be met ("AND") or any condition can trigger the alert ("OR").

## Background Jobs

The alert system runs several background jobs for data processing and alert evaluation:

### Alert Processing Job

- **Frequency**: Every 1 minute
- **Purpose**: Evaluates active alerts against current market data
- **Implementation**: Uses a queue-based approach to distribute workload

### Notification Sending Job

- **Frequency**: Every 1 minute
- **Purpose**: Processes the notification queue and sends notifications
- **Implementation**: Handles retries for failed delivery attempts

### Stock Price Update Job

- **Frequency**: Every 5 minutes during market hours, hourly outside market hours
- **Purpose**: Updates stock prices from external data sources
- **Implementation**: Uses API rate limiting to avoid exceeding quotas

### Technical Indicator Calculation Job

- **Frequency**: Hourly
- **Purpose**: Calculates technical indicators based on price data
- **Implementation**: Uses efficient algorithms to minimize computation time

### News Fetching and Analysis Job

- **Frequency**: Every 30 minutes
- **Purpose**: Fetches news articles and performs sentiment analysis
- **Implementation**: Uses natural language processing for sentiment scoring

## API Usage Examples

### Creating a Price Alert

```javascript
// Request
const response = await fetch('/api/v1/alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    name: 'AAPL Price Alert',
    description: 'Alert when Apple stock crosses $200',
    trigger_type_id: 1, // stock_price
    stock_id: 'stock-uuid-here',
    threshold_value: 200.00,
    threshold_condition_id: 3, // crosses_above
    alert_frequency_id: 1, // immediate
    is_active: true
  })
});

// Response
const data = await response.json();
console.log(data);
```

### Creating a Technical Indicator Alert

```javascript
// Request
const response = await fetch('/api/v1/alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    name: 'AAPL RSI Alert',
    description: 'Alert when Apple RSI goes above 70',
    trigger_type_id: 3, // technical_indicator
    stock_id: 'stock-uuid-here',
    indicator_type_id: 1, // RSI
    indicator_period: 14,
    indicator_threshold: 70,
    indicator_condition_id: 1, // above
    alert_frequency_id: 1, // immediate
    is_active: true
  })
});

// Response
const data = await response.json();
console.log(data);
```

### Creating a News Alert

```javascript
// Request
const response = await fetch('/api/v1/alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    name: 'AAPL News Alert',
    description: 'Alert on positive news about Apple',
    trigger_type_id: 4, // news
    stock_id: 'stock-uuid-here',
    news_keywords: 'earnings,revenue,growth',
    sentiment_type_id: 1, // positive
    alert_frequency_id: 1, // immediate
    is_active: true
  })
});

// Response
const data = await response.json();
console.log(data);
```

### Creating and Using a Watchlist

```javascript
// Create a watchlist
const createResponse = await fetch('/api/v1/watchlists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    name: 'Tech Stocks',
    description: 'Top technology companies',
    is_default: false,
    is_public: false
  })
});

const watchlist = await createResponse.json();
const watchlistId = watchlist.data.id;

// Add a stock to the watchlist
const addStockResponse = await fetch(`/api/v1/watchlists/${watchlistId}/stocks/stock-uuid-here`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    position_order: 1,
    notes: 'Watching for earnings announcement'
  })
});

// Get the watchlist with stocks
const getResponse = await fetch(`/api/v1/watchlists/${watchlistId}`, {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});

const watchlistWithStocks = await getResponse.json();
console.log(watchlistWithStocks);
```

### Managing User Preferences

```javascript
// Update user preferences
const updateResponse = await fetch('/api/v1/users/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    email: 'user@example.com',
    phone: '+15551234567',
    timezone: 'America/New_York',
    risk_tolerance_id: 2 // moderate
  })
});

const preferences = await updateResponse.json();
console.log(preferences);
```
