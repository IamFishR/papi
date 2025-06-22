# StockPrice Duplicate Issue Fix

## Problem
The `st_stock_prices` table has a unique constraint on `(stock_id, price_date)` which prevents storing multiple price records for the same stock on the same date with different data sources (e.g., regular market data and pre-market data).

## Solution
1. **Migration**: Modified the unique constraint to include `data_source` field
2. **Code Fix**: Updated the stock service to handle potential duplicates more robustly

## Steps to Apply the Fix

### 1. Run the Database Migration
```bash
cd /root/projects/tracking/papi
npm run migration:up
# or
npx sequelize-cli db:migrate
```

### 2. Verify the Changes
After running the migration, you should be able to:
- Store regular market data with `data_source: 'NSE'`
- Store pre-market data with `data_source: 'NSE_PREMARKET'`
- Both for the same stock on the same date

### 3. Test the Fix
The updated service code now:
- Uses `upsert` for better duplicate handling
- Falls back to merging data if there are constraint conflicts
- Provides better error handling

## Database Schema Changes

### Before:
```sql
UNIQUE KEY `st_stock_prices_stock_id_price_date_unique` (`stock_id`, `price_date`)
```

### After:
```sql
UNIQUE KEY `st_stock_prices_stock_id_price_date_data_source_unique` (`stock_id`, `price_date`, `data_source`)
INDEX `data_source` (`data_source`)
```

## Code Changes
- Updated `processCompleteMarketData()` function in `stock.service.js`
- Added robust duplicate handling with upsert and fallback mechanisms
- Added merge logic for conflicting data sources

## Testing
After applying these changes, test with data that has:
1. Regular market data and pre-market data for the same stock/date
2. Multiple calls with the same data to verify upsert works
3. Edge cases with missing or conflicting data sources
