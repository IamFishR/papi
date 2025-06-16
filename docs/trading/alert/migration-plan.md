# Stock Alert System - Database Migration Plan

## Migration Files Organization

Based on the project's existing structure and the database schema in `table_structure.md`, we'll create the following migration files in order:

### 1. Lookup Tables (First batch - June 16, 2025)
1. `20250616000001-create-trigger-types-table.js` - ✓ Created
2. `20250616000002-create-threshold-conditions-table.js` - ✓ Created
3. `20250616000003-create-volume-conditions-table.js`
4. `20250616000004-create-indicator-types-table.js`
5. `20250616000005-create-indicator-conditions-table.js`
6. `20250616000006-create-sentiment-types-table.js`
7. `20250616000007-create-alert-frequencies-table.js`
8. `20250616000008-create-condition-logic-types-table.js`
9. `20250616000009-create-alert-statuses-table.js`
10. `20250616000010-create-notification-methods-table.js`
11. `20250616000011-create-risk-tolerance-levels-table.js`
12. `20250616000012-create-notification-statuses-table.js`
13. `20250616000013-create-priority-levels-table.js`

### 2. Reference Tables (Second batch - June 17, 2025)
14. `20250617000001-create-exchanges-table.js`
15. `20250617000002-create-sectors-table.js` 
16. `20250617000003-create-currencies-table.js`
17. `20250617000004-create-news-sources-table.js`

### 3. Core Tables (Third batch - June 18-19, 2025)
18. `20250618000001-create-stocks-table.js`
19. `20250618000002-create-stock-prices-table.js`
20. `20250618000003-create-alerts-table.js`
21. `20250618000004-create-alert-history-table.js`
22. `20250619000001-create-user-preferences-table.js`
23. `20250619000002-create-watchlists-table.js`
24. `20250619000003-create-watchlist-stocks-table.js`
25. `20250619000004-create-news-mentions-table.js`
26. `20250619000005-create-notification-queue-table.js`
27. `20250619000006-create-technical-indicators-table.js`

## Migration Execution Plan

### Migration Commands

To run migrations:
```bash
npx sequelize-cli db:migrate
```

To revert a specific migration:
```bash
npx sequelize-cli db:migrate:undo --name [migration-file-name]
```

To revert all migrations:
```bash
npx sequelize-cli db:migrate:undo:all
```

### Testing Procedure

1. Run migrations in batches (lookup tables first, then reference tables, then core tables)
2. Verify table creation and constraints using a database tool
3. Test rollback scenarios to ensure migrations can be safely undone
4. Verify indexes for query performance

## Database Indexing Strategy

The following indexes will be created for optimal performance:

### Stock-related Indexes
- `st_stocks`: Indexes on `symbol`, `sector_id`, `exchange_id`
- `st_stock_prices`: Indexes on `stock_id, price_date`, `price_timestamp`

### Alert-related Indexes
- `st_alerts`: Indexes on `user_id, is_active`, `trigger_type_id`, `stock_id, is_active`, `last_triggered_at`
- `st_alert_history`: Indexes on `user_id, triggered_at`, `alert_id, triggered_at`, `status_id`, `stock_id, triggered_at`

### Watchlist Indexes
- `st_watchlists`: Indexes on `user_id, name`
- `st_watchlist_stocks`: Indexes on `watchlist_id, position_order`

### News and Technical Indexes
- `st_news_mentions`: Indexes on `stock_id, published_at`, `sentiment_type_id, published_at`, `relevance_score, published_at`, fulltext index on `title, content, keywords`
- `st_technical_indicators`: Indexes on `stock_id, indicator_type_id, calculation_date`

### Notification Indexes
- `st_notification_queue`: Indexes on `status_id, priority_id, scheduled_at`, `user_id, status_id`, `scheduled_at`, `attempts, max_attempts`

## Rollback Plan

All migrations will include a proper `down` method to safely revert changes. Lookup tables that are referenced by other tables will only be dropped after dependent tables are dropped.
