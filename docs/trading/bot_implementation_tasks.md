# Live Trading Bot Implementation Tasks

## Project Overview
Implementation of an integrated NSE data fetching bot within the existing Express.js API to collect live stock market data and process alerts.

**API Test Status**: ✅ **PASSED** - NSE API URL working successfully
- URL: `https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050`
- Status: 200 OK
- Data Size: 63,423 characters of live data
- Update Frequency: Real-time (every few seconds)

---

## Database Schema Requirements

### New Table: `api_endpoints`

This table will store multiple API endpoints for different data sources and purposes.

```sql
CREATE TABLE api_endpoints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(500) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    description TEXT,
    request_info JSON,
    response_info JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table Schema Details:
- **id**: Primary key, auto-increment
- **url**: The API endpoint URL (up to 500 chars for query parameters)
- **purpose**: Short description of what this endpoint does (e.g., "NIFTY_50_DATA", "BANK_NIFTY_DATA")
- **description**: Detailed description of the endpoint functionality
- **request_info**: JSON field containing request details:
  ```json
  {
    "method": "GET",
    "headers": {...},
    "timeout": 10000,
    "retry_attempts": 3,
    "rate_limit_per_minute": 12
  }
  ```
- **response_info**: JSON field containing response structure info:
  ```json
  {
    "expected_status": 200,
    "content_type": "application/json",
    "data_structure": {...},
    "key_fields": ["symbol", "lastPrice", "change"],
    "data_path": "data"
  }
  ```
- **is_active**: Boolean to enable/disable specific endpoints
- **created_at/updated_at**: Audit timestamps

#### Sample Data:
```sql
INSERT INTO api_endpoints (url, purpose, description, request_info, response_info) VALUES
(
    'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050',
    'NIFTY_50_DATA',
    'Fetches real-time NIFTY 50 stock index data including individual stock prices, changes, and metadata',
    '{"method":"GET","headers":{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},"timeout":10000,"retry_attempts":3,"rate_limit_per_minute":12}',
    '{"expected_status":200,"content_type":"application/json","data_structure":"array","key_fields":["symbol","lastPrice","change","pChange"],"data_path":"data"}'
);
```

---

## Implementation Plan

### **Phase 1: Core Services** 🔄

#### ✅ Task 1: Project Structure Setup
- **Status**: ✅ Complete
- **Task**: Create directory structure and task tracking
- **Files Created**: 
  - `/docs/trading/bot_implementation_tasks.md`

#### ✅ Task 2: API Endpoints Database Table & Model
- **Status**: ✅ Complete
- **Priority**: High
- **Requirements**:
  - ✅ Created database migration for `api_endpoints` table
  - ✅ Created Sequelize model for ApiEndpoint
  - ✅ Added table schema with JSON fields for request/response info
  - ✅ Enabled multiple API URL management with metadata
  - ✅ Tested with sample NIFTY 50 endpoint data
- **Files Created**:
  - `/src/database/migrations/20250620052204-create-api-endpoints-table.js`
  - `/src/database/models/apiEndpoint.model.js`

#### ✅ Task 3: NSE API Service
- **Status**: ✅ Complete
- **Priority**: High
- **File**: `/src/services/external/nseService.js`
- **Requirements**:
  - ✅ Fetch API endpoints from `api_endpoints` table
  - ✅ Dynamic API client supporting multiple endpoints
  - ✅ Request configuration from database (headers, timeout, retries)
  - ✅ Data fetching with endpoint-specific error handling  
  - ✅ Rate limiting and retry logic per endpoint
  - ✅ Response validation based on stored response_info
  - ✅ Support for different data structures and response formats
  - ✅ Comprehensive testing with live NSE data

#### ✅ Task 5: Stock Update Service
- **Status**: ✅ Complete
- **Priority**: High
- **File**: `/src/services/stock/stockUpdateService.js`
- **Requirements**:
  - ✅ Batch stock updates using existing Stock model
  - ✅ Data transformation and validation from NSE API format
  - ✅ Duplicate handling and conflict resolution
  - ✅ Integration with existing database models
  - ✅ Cache management for exchanges, sectors, and currencies
  - ✅ Transaction-based batch processing

#### ✅ Task 6: Price Service
- **Status**: ✅ Complete
- **Priority**: High
- **File**: `/src/services/stock/priceService.js`
- **Requirements**:
  - ✅ Price history updates using StockPrice model
  - ✅ Bulk insert optimization for performance
  - ✅ Date handling and validation
  - ✅ Historical data management
  - ✅ API data transformation to price format
  - ✅ Comprehensive price statistics and querying

### **Phase 2: Job Scheduling** ✅

#### ✅ Task 7: Job Scheduler
- **Status**: ✅ Complete
- **Priority**: Medium
- **File**: `/src/jobs/schedulers/stockDataScheduler.js`
- **Requirements**:
  - ✅ Market hours cron configuration (9:15 AM - 3:30 PM IST)
  - ✅ Job orchestration and coordination
  - ✅ Error handling and recovery mechanisms
  - ✅ Performance monitoring and logging
  - ✅ Environment-based configuration
  - ✅ Manual job triggering
  - ✅ Market status monitoring

#### ✅ Task 8: Stock Data Worker
- **Status**: ✅ Complete
- **Priority**: Medium  
- **File**: `/src/jobs/workers/stockDataWorker.js`
- **Requirements**:
  - ✅ Main execution logic coordination
  - ✅ Service integration and data flow
  - ✅ Comprehensive logging and monitoring
  - ✅ Performance metrics and optimization
  - ✅ Health checks and status reporting
  - ✅ Separate stock and price data processing
  - ✅ Full data synchronization capability

### **Phase 3: Alert Integration** 🔄

#### 🔄 Task 9: Alert Processor
- **Status**: ⏳ Pending
- **Priority**: Medium
- **File**: `/src/services/alert/alertProcessor.js`
- **Requirements**:
  - Real-time alert condition checking
  - Price threshold and condition evaluation
  - Integration with existing Alert/AlertHistory models
  - Notification triggering system

### **Phase 4: API Integration** 🔄

#### 🔄 Task 10: Bot Management Endpoints (Optional)
- **Status**: ⏳ Pending
- **Priority**: Low
- **Endpoints**:
  - `GET /api/v1/admin/bot/status` - Bot status and health
  - `POST /api/v1/admin/bot/trigger` - Manual data fetch trigger
  - `PUT /api/v1/admin/bot/config` - Update bot configuration

#### 🔄 Task 11: App.js Integration
- **Status**: ⏳ Pending
- **Priority**: Medium
- **Requirements**:
  - Initialize job schedulers on app startup
  - Environment-based bot enabling/disabling
  - Graceful shutdown handling
  - Error recovery and restart logic

#### 🔄 Task 12: Environment Configuration
- **Status**: ⏳ Pending
- **Priority**: Medium
- **Variables Needed**:
  ```bash
  NSE_FETCH_ENABLED=true
  NSE_FETCH_INTERVAL_MINUTES=5
  NSE_MARKET_HOURS_ONLY=true
  NSE_ENABLE_ALERTS=true
  NSE_BATCH_SIZE=10
  NSE_RETRY_ATTEMPTS=3
  NSE_RETRY_DELAY_MS=5000
  ```

### **Phase 5: Testing & Validation** 🔄

#### 🔄 Task 13: Integration Testing
- **Status**: ⏳ Pending
- **Priority**: High
- **Requirements**:
  - Test data fetching and processing
  - Validate database operations
  - Test alert triggering system
  - Performance and load testing
  - Error handling validation

---

## Dependencies

### Required Packages
- ✅ `sequelize` - Already installed
- ✅ `winston` - Already installed  
- ✅ `dotenv` - Already installed
- 🔄 `node-cron` - **Need to install**

### Installation Command
```bash
npm install node-cron
```

---

## Technical Architecture

### Data Flow
```
NSE API → nseService → stockUpdateService → Database (Stock/StockPrice)
                    → alertProcessor → Alert System → Notifications
```

### Integration Points
- **Database**: Direct access to existing Sequelize models
- **Logging**: Use existing Winston logger setup
- **Authentication**: Leverage existing JWT middleware  
- **Error Handling**: Integrate with existing error middleware
- **Configuration**: Use existing environment variable system

---

## Success Criteria

### Functional Requirements
- [ ] Fetch live NIFTY 50 data every 5 minutes during market hours
- [ ] Update Stock and StockPrice tables with latest data
- [ ] Process price alerts and trigger notifications
- [ ] Handle API failures gracefully with retry logic
- [ ] Maintain data consistency and avoid duplicates

### Technical Requirements  
- [ ] Zero impact on existing API performance
- [ ] Proper error logging and monitoring
- [ ] Environment-based configuration management
- [ ] Clean integration with existing codebase patterns
- [ ] Comprehensive testing coverage

### Performance Targets
- [ ] Data fetch completion within 30 seconds
- [ ] Database operations optimized for bulk updates
- [ ] Memory usage under 50MB additional overhead
- [ ] 99.9% uptime during market hours

---

## Risk Mitigation

### Identified Risks
1. **NSE API Rate Limiting**: Implement proper delays and retry logic
2. **Database Lock Conflicts**: Use transactions and proper isolation levels  
3. **Memory Leaks**: Implement proper cleanup and monitoring
4. **Market Hours Changes**: Make schedule configurable
5. **Data Quality**: Implement validation and sanity checks

### Mitigation Strategies
- Comprehensive error handling and logging
- Graceful degradation on failures
- Health check endpoints for monitoring
- Rollback capabilities for data corruption
- Alert system for critical failures

---

## Timeline Estimate
- **Phase 1-2**: 1-2 days (Core services and scheduling)
- **Phase 3-4**: 1 day (Alerts and API integration)
- **Phase 5**: 0.5 days (Testing and validation)
- **Total**: 2-3 days for full implementation

**Next Step**: Install `node-cron` and begin implementing NSE API service.