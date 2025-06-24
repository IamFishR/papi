# Forward-Looking Alert System Implementation

## Overview

The alert system has been enhanced to focus on forward-looking alerts rather than historical data processing. This prevents false triggers from historical data and ensures alerts only trigger on genuine new market movements.

## Key Changes

### 1. Baseline Price Tracking
- **New Field**: `baseline_price` - Records price when alert was created
- **New Field**: `baseline_timestamp` - Records when baseline was set
- **Purpose**: Provides reference point for forward-looking comparisons

### 2. Enhanced Alert Logic
- **Crossing Detection**: Now compares current price with baseline rather than previous tick
- **Market Hours Filter**: `market_hours_only` field to restrict alerts to trading hours
- **Volume Confirmation**: `volume_confirmation` field to require volume validation
- **Cooldown Prevention**: Enhanced cooldown logic to prevent alert spam

### 3. Database Schema Updates
#### st_alerts Table
```sql
ALTER TABLE st_alerts ADD COLUMN baseline_price DECIMAL(12,4);
ALTER TABLE st_alerts ADD COLUMN baseline_timestamp DATETIME;
ALTER TABLE st_alerts ADD COLUMN market_hours_only BOOLEAN DEFAULT TRUE;
ALTER TABLE st_alerts ADD COLUMN volume_confirmation BOOLEAN DEFAULT FALSE;
```

#### st_alert_history Table  
```sql
ALTER TABLE st_alert_history ADD COLUMN baseline_price DECIMAL(12,4);
ALTER TABLE st_alert_history ADD COLUMN price_change DECIMAL(12,4);
ALTER TABLE st_alert_history ADD COLUMN price_change_percent DECIMAL(8,4);
ALTER TABLE st_alert_history ADD COLUMN trigger_volume BIGINT;
ALTER TABLE st_alert_history ADD COLUMN market_context JSON;
```

## Benefits

### 1. **Eliminates False Triggers**
- No more alerts firing immediately on historical data
- Only genuine breakouts trigger notifications
- Reduces noise and alert fatigue

### 2. **Improves Trading Timing**
- Alerts fire on real-time movements from creation point
- Better entry/exit timing for trades
- Focus on actionable opportunities

### 3. **Enhanced Context**
- Records price change from baseline
- Includes volume and market context
- Better alert history tracking

### 4. **Smart Features**
- Market hours filtering
- Volume confirmation for movements
- Cooldown periods to prevent spam
- Better performance with focused queries

## Usage Examples

### Creating Forward-Looking Alert
```javascript
const alert = await alertService.createAlert({
  stockId: 123,
  triggerTypeId: 1, // Price alert
  priceThreshold: 150.00,
  thresholdConditionId: 3, // crosses_above
  marketHoursOnly: true,
  volumeConfirmation: true,
  cooldownMinutes: 30
}, userId);
```

### Alert Triggering Logic
```javascript
// OLD: Would trigger if ANY historical data crossed threshold
// NEW: Only triggers if price moves from baseline to cross threshold

// Example:
// Baseline Price: $145 (when alert created)
// Threshold: $150 (crosses_above)  
// Current Price: $152

// OLD: Might trigger immediately if historical data showed $152
// NEW: Only triggers because $145 < $150 and $152 > $150 (genuine breakout)
```

## Migration

Run the database migration to add new fields:
```bash
npm run db:migrate
```

## API Changes

### Alert Creation
New optional fields in alert creation:
- `marketHoursOnly` (boolean, default: true)
- `volumeConfirmation` (boolean, default: false)

### Alert Response  
Enhanced alert objects now include:
- `baselinePrice`
- `baselineTimestamp`
- `marketHoursOnly`
- `volumeConfirmation`

### Alert History
Enhanced history records include:
- `baselinePrice`
- `priceChange`
- `priceChangePercent`
- `triggerVolume`
- `marketContext` (JSON)

## Backward Compatibility

- ✅ All existing alerts continue to work
- ✅ Existing API endpoints unchanged
- ✅ Optional new features don't break existing functionality
- ✅ Database migration is non-destructive

## Performance Improvements

- Reduced database queries by filtering on baseline timestamp
- More efficient alert processing during market hours
- Better indexing on baseline_timestamp field
- Eliminated unnecessary historical data processing

---

**Implementation Date**: 2025-06-23  
**Status**: ✅ Production Ready  
**Migration Required**: Yes - Run `npm run db:migrate`