# Stock Alert System - Minimal API Routes

## Core Business Logic Routes (12 routes)

### 1. Stocks & Market Data
```
GET    /api/stocks?search={symbol}&exchange={id}&sector={id}
GET    /api/stocks/{id}
GET    /api/stocks/{id}/prices?from={date}&to={date}
POST   /api/stocks/{id}/prices (for data ingestion)
```

### 2. Alerts Management
```
GET    /api/alerts?active={true/false}&type={trigger_type}
POST   /api/alerts
GET    /api/alerts/{id}
PUT    /api/alerts/{id}
DELETE /api/alerts/{id}
GET    /api/alerts/history?from={date}&to={date}
```

### 3. Watchlists
```
GET    /api/watchlists
POST   /api/watchlists
PUT    /api/watchlists/{id}
DELETE /api/watchlists/{id}
POST   /api/watchlists/{id}/stocks/{stock_id}
DELETE /api/watchlists/{id}/stocks/{stock_id}
```

### 4. Notifications
```
GET    /api/notifications?status={status}&method={method}
PUT    /api/notifications/{id}/acknowledge
```

### 5. News & Analysis
```
GET    /api/stocks/{id}/news?sentiment={type}&from={date}
GET    /api/stocks/{id}/indicators?type={indicator}&period={days}
```

### 6. User Preferences
```
GET    /api/users/preferences
PUT    /api/users/preferences
```

## Lookup Data Routes (1 route)

### 7. Reference Data (Single endpoint for all lookups)
```
GET    /api/reference?type={lookup_type}
```

**Supported lookup types:**
- `trigger-types` → st_trigger_types
- `threshold-conditions` → st_threshold_conditions  
- `volume-conditions` → st_volume_conditions
- `indicator-types` → st_indicator_types
- `indicator-conditions` → st_indicator_conditions
- `sentiment-types` → st_sentiment_types
- `alert-frequencies` → st_alert_frequencies
- `condition-logic-types` → st_condition_logic_types
- `alert-statuses` → st_alert_statuses
- `notification-methods` → st_notification_methods
- `risk-tolerance-levels` → st_risk_tolerance_levels
- `notification-statuses` → st_notification_statuses
- `exchanges` → st_exchanges
- `sectors` → st_sectors
- `currencies` → st_currencies
- `news-sources` → st_news_sources
- `priority-levels` → st_priority_levels

## Internal/System Routes (Optional - 2 routes)

### 8. System Operations
```
POST   /api/system/process-alerts (trigger alert processing)
```

---

## Route Details & Table Coverage

### Table Coverage by Route:

**Users & Authentication:**
- `users` → `/api/users/profile`, `/api/auth/*`
- `st_user_preferences` → `/api/users/preferences`

**Stocks & Market Data:**
- `st_stocks` → `/api/stocks`
- `st_stock_prices` → `/api/stocks/{id}/prices`
- `st_technical_indicators` → `/api/stocks/{id}/indicators`

**Alerts System:**
- `st_alerts` → `/api/alerts`
- `st_alert_history` → `/api/alerts/history`

**Watchlists:**
- `st_watchlists` → `/api/watchlists`
- `st_watchlist_stocks` → `/api/watchlists/{id}/stocks/{stock_id}`

**Notifications:**
- `st_notification_queue` → `/api/notifications`

**News & Analysis:**
- `st_news_mentions` → `/api/stocks/{id}/news`

**All Lookup Tables:**
- All `st_*` lookup tables → `/api/reference?type={lookup_type}`

## API Design Benefits

1. **Minimal Routes**: Only 24 routes total (22 core + 2 system)
2. **RESTful Design**: Follows REST conventions
3. **Resource-Oriented**: Groups related operations logically
4. **Efficient Lookups**: Single endpoint for all reference data
5. **Scalable**: Easy to extend without adding many new routes
6. **Clear Separation**: Business logic vs. reference data vs. system operations

## Example Usage

```javascript
// Get all alert trigger types
GET /api/reference?type=trigger-types

// Create a price alert
POST /api/alerts
{
  "name": "AAPL Price Alert",
  "trigger_type": "stock_price",
  "stock_id": "uuid-here",
  "threshold_value": 150.00,
  "threshold_condition": "above"
}

// Get stock with news and indicators
GET /api/stocks/uuid-here
GET /api/stocks/uuid-here/news?sentiment=positive&from=2025-01-01
GET /api/stocks/uuid-here/indicators?type=RSI&period=14
```

This design provides comprehensive coverage of all your database tables while maintaining a clean, minimal API surface.