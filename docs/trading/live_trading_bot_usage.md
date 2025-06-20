# Live Trading Bot - Usage Guide

## Overview
The Live Trading Bot automatically fetches real-time stock data from NSE (National Stock Exchange) and processes it for stocks, prices, and alerts. The system is fully automated and runs during market hours.

---

## 🚀 Quick Start

### 1. Installation & Setup

```bash
# Install dependencies (already done)
npm install node-cron

# Run database migrations (already done)
npm run db:migrate

# Start the application
npm run dev
```

### 2. Environment Configuration

Add these variables to your `.env` file:

```bash
# Bot Configuration
NSE_FETCH_ENABLED=true                    # Enable/disable the bot
NSE_MARKET_HOURS_ONLY=true               # Only run during market hours
NSE_STOCK_INTERVAL_MINUTES=15            # Update stocks every 15 minutes
NSE_PRICE_INTERVAL_MINUTES=5             # Update prices every 5 minutes

# Optional Advanced Settings
NSE_BATCH_SIZE=50                        # Batch size for processing
NSE_RETRY_ATTEMPTS=3                     # API retry attempts
NSE_RETRY_DELAY_MS=5000                  # Delay between retries
```

### 3. Basic Usage

The bot starts automatically when the application starts (if enabled). No manual intervention required!

---

## 📊 System Components

### Core Services

1. **NSE API Service** (`/src/services/external/nseService.js`)
   - Fetches live data from multiple API endpoints
   - Handles rate limiting and retries
   - Validates responses

2. **Stock Update Service** (`/src/services/stock/stockUpdateService.js`)
   - Creates/updates stock information
   - Manages company metadata
   - Handles market cap updates

3. **Price Service** (`/src/services/stock/priceService.js`)
   - Records historical price data
   - Manages daily OHLC data
   - Tracks volume information

4. **Job Scheduler** (`/src/jobs/schedulers/stockDataScheduler.js`)
   - Automates data fetching during market hours
   - Manages cron jobs
   - Monitors market status

5. **Stock Data Worker** (`/src/jobs/workers/stockDataWorker.js`)
   - Coordinates all data processing
   - Provides health checks
   - Collects performance metrics

---

## 🕐 Market Hours & Scheduling

### Indian Market Hours
- **Trading Hours**: 9:15 AM - 3:30 PM IST (Monday-Friday)
- **Timezone**: Asia/Kolkata
- **Weekends**: Automatically skipped

### Default Schedule
- **Stock Data**: Every 15 minutes during market hours
- **Price Data**: Every 5 minutes during market hours
- **Market Status**: Checked every minute

### Outside Market Hours
- Bot automatically pauses when markets are closed
- Can be configured to run 24/7 by setting `NSE_MARKET_HOURS_ONLY=false`

---

## 🎛️ Manual Controls

### Starting/Stopping the Bot

```javascript
const stockDataScheduler = require('./src/jobs/schedulers/stockDataScheduler');

// Start the bot
stockDataScheduler.start();

// Stop the bot
stockDataScheduler.stop();

// Restart the bot
stockDataScheduler.restart();
```

### Manual Data Fetch

```javascript
const stockDataWorker = require('./src/jobs/workers/stockDataWorker');

// Fetch stock data only
await stockDataWorker.fetchStockData();

// Fetch price data only
await stockDataWorker.fetchPriceData();

// Fetch both stocks and prices
await stockDataWorker.fetchAllData();
```

### Manual Job Triggering

```javascript
// Trigger specific jobs manually
await stockDataScheduler.triggerJob('stock-data');
await stockDataScheduler.triggerJob('price-data');
await stockDataScheduler.triggerJob('market-status');
```

---

## 📈 Data Sources & Endpoints

### API Endpoints Database
All API endpoints are stored in the `st_api_endpoints` table:

```sql
-- View all active endpoints
SELECT purpose, url, description FROM st_api_endpoints WHERE is_active = true;

-- Add new endpoint
INSERT INTO st_api_endpoints (
    url, 
    purpose, 
    description, 
    request_info, 
    response_info
) VALUES (
    'https://www.nseindia.com/api/equity-stockIndices?index=BANK%20NIFTY',
    'BANK_NIFTY_DATA',
    'Fetches Bank Nifty stock data',
    '{"method":"GET","timeout":10000,"retry_attempts":3}',
    '{"expected_status":200,"content_type":"application/json"}'
);
```

### Currently Supported
- **NIFTY 50**: Top 50 stocks by market cap
- **Real-time prices**: Open, High, Low, Close, Volume
- **Company metadata**: Name, sector, market cap

### Adding New Data Sources
1. Insert new endpoint into `st_api_endpoints` table
2. Configure request/response format in JSON fields
3. Bot automatically picks up new active endpoints

---

## 📊 Monitoring & Status

### Health Checks

```javascript
// Check overall system health
const health = await stockDataWorker.healthCheck();
console.log(health);

// Get detailed statistics
const stats = await stockDataWorker.getDetailedStats();
console.log(stats);

// Get scheduler status
const status = stockDataScheduler.getStatus();
console.log(status);
```

### Market Status

```javascript
// Check if market is currently open
const marketStatus = stockDataScheduler.getMarketStatus();
console.log({
    isOpen: marketStatus.isOpen,
    currentTime: marketStatus.currentTime,
    nextCloseTime: marketStatus.nextCloseTime
});
```

### Performance Metrics

```javascript
// Worker statistics
const workerStatus = stockDataWorker.getStatus();
console.log({
    executionCount: workerStatus.executionCount,
    totalStocksProcessed: workerStatus.stats.totalStocksProcessed,
    totalPricesProcessed: workerStatus.stats.totalPricesProcessed,
    successRate: workerStatus.stats.successfulExecutions / workerStatus.stats.totalExecutions
});
```

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NSE_FETCH_ENABLED` | `false` | Enable/disable the entire bot |
| `NSE_MARKET_HOURS_ONLY` | `true` | Restrict to market hours only |
| `NSE_STOCK_INTERVAL_MINUTES` | `15` | Stock data fetch interval |
| `NSE_PRICE_INTERVAL_MINUTES` | `5` | Price data fetch interval |
| `NSE_BATCH_SIZE` | `50` | Batch size for database operations |
| `NSE_RETRY_ATTEMPTS` | `3` | Number of API retry attempts |
| `NSE_RETRY_DELAY_MS` | `5000` | Delay between retries |

### Runtime Configuration

```javascript
// Update scheduler configuration
stockDataScheduler.updateConfig({
    enabled: true,
    stockInterval: 10,  // Change to 10 minutes
    priceInterval: 3    // Change to 3 minutes
});
```

---

## 📝 Logging

### Log Levels
- **INFO**: Normal operations, job starts/completions
- **WARN**: Non-critical issues, rate limits
- **ERROR**: Failures, exceptions

### Key Log Messages
```
✅ Stock data fetch execution #1 completed successfully
⚠️  Rate limit exceeded for endpoint: NIFTY_50_DATA
❌ Stock data fetch execution #2 failed: API timeout
📊 Processing 50 stocks (45 created, 5 updated)
🕐 Market status changed: OPEN
```

### Log Files
Logs are written to the configured Winston logger (see `/src/config/logger.js`)

---

## 🗄️ Database Tables

### Stock Data
```sql
-- View latest stock updates
SELECT symbol, company_name, market_cap, last_updated 
FROM st_stocks 
WHERE is_active = true 
ORDER BY last_updated DESC;
```

### Price Data
```sql
-- View today's prices
SELECT s.symbol, sp.close_price, sp.volume, sp.price_date
FROM st_stock_prices sp
JOIN st_stocks s ON sp.stock_id = s.id
WHERE sp.price_date = CURDATE()
ORDER BY sp.close_price DESC;
```

### API Endpoints
```sql
-- View all configured endpoints
SELECT purpose, url, is_active
FROM st_api_endpoints
ORDER BY purpose;
```

---

## 🚨 Troubleshooting

### Common Issues

#### Bot Not Starting
```javascript
// Check if enabled
const status = stockDataScheduler.getStatus();
console.log('Enabled:', status.enabled);

// Enable if disabled
process.env.NSE_FETCH_ENABLED = 'true';
stockDataScheduler.restart();
```

#### No Data Being Fetched
```javascript
// Check market hours
const marketStatus = stockDataScheduler.getMarketStatus();
console.log('Market Open:', marketStatus.isOpen);

// Force a manual fetch
await stockDataWorker.fetchAllData();
```

#### API Errors
```javascript
// Test NSE service directly
const nseService = require('./src/services/external/nseService');
const result = await nseService.testEndpoint('NIFTY_50_DATA');
console.log(result);
```

#### Database Issues
```javascript
// Check service health
const health = await stockDataWorker.healthCheck();
console.log('Services:', health.services);
```

### Performance Issues

#### Slow Processing
- Reduce batch size: `NSE_BATCH_SIZE=25`
- Increase intervals: `NSE_PRICE_INTERVAL_MINUTES=10`
- Check database performance

#### Memory Usage
- Monitor worker statistics
- Check for memory leaks in logs
- Restart worker if needed

#### Rate Limiting
- Default: 12 requests per minute per endpoint
- Configure in `request_info` JSON field
- Increase delays if needed

---

## 🔮 Advanced Usage

### Custom Endpoints

```sql
-- Add custom endpoint with specific configuration
INSERT INTO st_api_endpoints (
    url, 
    purpose, 
    description,
    request_info,
    response_info
) VALUES (
    'https://api.custom-provider.com/stocks',
    'CUSTOM_DATA',
    'Custom stock data provider',
    '{
        "method": "GET",
        "headers": {"Authorization": "Bearer TOKEN"},
        "timeout": 15000,
        "retry_attempts": 5,
        "rate_limit_per_minute": 30
    }',
    '{
        "expected_status": 200,
        "content_type": "application/json",
        "data_path": "results.stocks",
        "key_fields": ["symbol", "price", "volume"]
    }'
);
```

### Service Integration

```javascript
// Integrate with existing alert system
const alertProcessor = require('./src/services/alert/alertProcessor');

// Process alerts after price updates
stockDataWorker.on('priceUpdate', async (data) => {
    await alertProcessor.checkPriceAlerts(data);
});
```

### Custom Scheduling

```javascript
// Create custom cron job
const cron = require('node-cron');

// Run every 30 seconds during market hours
cron.schedule('*/30 * * * * *', async () => {
    if (stockDataScheduler.isMarketHours()) {
        await stockDataWorker.fetchPriceData();
    }
}, {
    timezone: 'Asia/Kolkata'
});
```

---

## 📊 Production Deployment

### System Requirements
- **Memory**: 512MB minimum for smooth operation
- **Storage**: 10GB for historical data (grows over time)
- **Network**: Stable internet for API calls
- **Database**: MySQL with adequate connection pool

### Performance Tuning
```bash
# Optimize for production
NSE_BATCH_SIZE=100
NSE_STOCK_INTERVAL_MINUTES=30
NSE_PRICE_INTERVAL_MINUTES=10
NSE_RETRY_ATTEMPTS=5
```

### Monitoring Setup
- Set up health check endpoints
- Monitor log files for errors
- Track database growth
- Monitor API rate limits

### Backup Considerations
- Regular database backups
- Configuration backup (API endpoints)
- Log rotation setup

---

## 🆘 Support & Maintenance

### Regular Tasks
- **Daily**: Check logs for errors
- **Weekly**: Review performance metrics
- **Monthly**: Clean old price data if needed
- **Quarterly**: Update API configurations

### Maintenance Commands

```javascript
// Clean old price data (older than 1 year)
await priceService.cleanupOldPrices(365);

// Refresh service caches
await stockUpdateService.refreshCaches();
await priceService.refreshStockCache();

// Reset worker statistics
stockDataWorker.resetStats();
```

### Getting Help
- Check logs for detailed error messages
- Use health check endpoints for diagnostics
- Review configuration settings
- Test individual components manually

---

## 📚 Related Documentation
- [Implementation Tasks](./bot_implementation_tasks.md) - Development details
- [Database Schema](../database/) - Database structure
- [API Documentation](../api/) - API endpoints
- [Alert System](./telegram_bot_alert.md) - Alert integration

---

**Note**: This system is designed to run continuously during market hours. Ensure proper monitoring and error handling in production environments.