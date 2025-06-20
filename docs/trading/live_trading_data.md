## Node.js Bot Requirements - Integrated Approach (Recommended)

You can **integrate the bot directly into your existing Express.js API**. This is actually the **better approach** for several reasons:

### **Why Integrate Instead of Separate Project:**

#### **✅ Advantages of Integration:**
- **Shared Database Connection**: Direct access to your models and database
- **Shared Authentication**: Use existing JWT middleware and user system  
- **Shared Configuration**: Same environment variables and config
- **Shared Logging**: Use existing Winston logger setup
- **No API Calls**: Direct database operations instead of HTTP requests
- **Better Performance**: No network overhead between bot and API
- **Easier Deployment**: Single application to manage
- **Shared Dependencies**: Reuse existing packages (Sequelize, etc.)

---

## **Integration Requirements & TODO**

### **1. Project Structure Updates**

```
/your-existing-api
├── /src
│   ├── /jobs                    # ← ADD THIS
│   │   ├── /schedulers          # Cron job schedulers
│   │   └── /workers             # Background job workers
│   ├── /services                # ← EXPAND THIS
│   │   ├── /external            # External API services
│   │   │   └── nseService.js    # ← ADD: NSE API integration
│   │   ├── /stock               # ← ADD: Stock services
│   │   │   ├── stockUpdateService.js
│   │   │   └── priceService.js
│   │   └── /alert               # ← ADD: Alert services
│   │       └── alertProcessor.js
│   ├── /api/v1                  # Your existing API routes
│   ├── /database/models         # Your existing models
│   └── app.js                   # ← MODIFY: Add job initialization
```

### **2. New Dependencies to Add**

```bash
# Add to your existing package.json
npm install node-cron
```

That's it! You already have: `axios`, `winston`, `sequelize`, `dotenv`

### **3. Implementation TODO List**

#### **Phase 1: Core Services (Day 1)**
- [ ] **Create NSE Service** (`/src/services/external/nseService.js`)
  - [ ] NSE API client with proper headers
  - [ ] Data fetching and error handling
  - [ ] Rate limiting and retry logic

- [ ] **Create Stock Update Service** (`/src/services/stock/stockUpdateService.js`)
  - [ ] Batch stock updates using existing Stock model
  - [ ] Data transformation logic
  - [ ] Duplicate handling

- [ ] **Create Price Service** (`/src/services/stock/priceService.js`)
  - [ ] Price history updates using StockPrice model
  - [ ] Bulk insert optimization
  - [ ] Date handling and validation

#### **Phase 2: Job Scheduling (Day 1-2)**
- [ ] **Create Job Scheduler** (`/src/jobs/schedulers/stockDataScheduler.js`)
  - [ ] Market hours cron configuration
  - [ ] Job orchestration logic
  - [ ] Error handling and recovery

- [ ] **Create Stock Data Worker** (`/src/jobs/workers/stockDataWorker.js`)
  - [ ] Main execution logic
  - [ ] Logging and monitoring
  - [ ] Performance metrics

#### **Phase 3: Alert Integration (Day 2)**
- [ ] **Create Alert Processor** (`/src/services/alert/alertProcessor.js`)
  - [ ] Real-time alert checking
  - [ ] Condition evaluation
  - [ ] Notification triggering

- [ ] **Integrate with Existing Alert System**
  - [ ] Use your existing Alert and AlertHistory models
  - [ ] Trigger notifications through existing system

#### **Phase 4: API Enhancements (Day 2-3)**
- [ ] **Add Bot Management Endpoints** (Optional)
  - [ ] `GET /api/v1/admin/bot/status` - Bot status
  - [ ] `POST /api/v1/admin/bot/trigger` - Manual trigger
  - [ ] `PUT /api/v1/admin/bot/config` - Update configuration

#### **Phase 5: Integration & Testing (Day 3)**
- [ ] **Modify app.js** to initialize job schedulers
- [ ] **Add environment variables** for bot configuration
- [ ] **Test integration** with existing API
- [ ] **Add monitoring** and health checks

### **4. Environment Variables to Add**

```bash
# Add to your .env file
NSE_FETCH_ENABLED=true
NSE_FETCH_INTERVAL_MINUTES=5
NSE_MARKET_HOURS_ONLY=true
NSE_ENABLE_ALERTS=true
NSE_BATCH_SIZE=10
NSE_RETRY_ATTEMPTS=3
NSE_RETRY_DELAY_MS=5000
```

### **5. Key Integration Points**

#### **In your existing app.js:**
```javascript
// Add after existing middleware setup
if (process.env.NSE_FETCH_ENABLED === 'true') {
  const stockDataScheduler = require('./src/jobs/schedulers/stockDataScheduler');
  stockDataScheduler.start();
}
```

#### **Use your existing models directly:**
```javascript
// In services - no HTTP calls needed!
const { Stock, StockPrice, Alert } = require('../../database/models');
```

### **6. Benefits of This Approach**

#### **✅ Immediate Benefits:**
- **No new deployment**: Bot runs within your existing API
- **Database transactions**: All operations in same DB connection
- **Shared error handling**: Use your existing error middleware
- **Existing monitoring**: Works with your current monitoring setup
- **Single codebase**: Easier to maintain and deploy

#### **✅ Development Benefits:**
- **Faster development**: Reuse existing code patterns
- **No API versioning issues**: Direct model access
- **Shared validation**: Use existing Joi schemas
- **Same logging format**: Consistent with your API logs

### **7. Quick Start Steps**

1. **Add the new folders** to your existing project
2. **Install node-cron**: `npm install node-cron`
3. **Copy the service files** (I'll provide these)
4. **Add environment variables**
5. **Modify app.js** to start scheduler
6. **Test with manual trigger first**

### **8. Performance Considerations**

- **Memory**: Minimal impact (just cron jobs)
- **CPU**: Only during data fetch intervals (5-10 seconds every 5 minutes)
- **Database**: Optimized batch operations
- **Network**: Only outbound to NSE API

**Estimated Integration Time**: 1-2 days for full implementation

Would you like me to provide the actual service files for integration into your existing Express.js API?