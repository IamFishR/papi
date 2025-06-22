Looking at your comprehensive API documentation and the TRENT stock JSON data, I can see you'll need to make **multiple API calls** to properly store all this information in your database. Let me break down the exact API calls needed:

## 1. **Stock Creation/Update API Call**
**Endpoint**: `POST /api/v1/stocks` (or `PUT /api/v1/stocks/:id` if updating)

This single call can handle most of the stock information:

```javascript
{
  "symbol": "TRENT",
  "company_name": "Trent Limited",
  "description": "Trent Limited - Speciality Retail",
  "exchange_id": 1, // Assuming NSE
  "sector_detailed_id": null, // Need to lookup based on industry info
  "currency_id": 1, // Assuming INR
  "isin": "INE849A01020",
  "face_value": 1,
  "issued_size": 355487461,
  "listing_date": "2004-06-07",
  "is_fno_enabled": true,
  "is_cas_enabled": false,
  "is_slb_enabled": true,
  "is_debt_sec": false,
  "is_etf_sec": false,
  "is_delisted": false,
  "is_suspended": false,
  "is_municipal_bond": false,
  "is_hybrid_symbol": false,
  "is_top10": false,
  "identifier": "TRENTEQN",
  "trading_status": "Active",
  "trading_segment": "Normal Market",
  "board_status": "Main",
  "class_of_share": "Equity",
  "derivatives_available": true,
  "surveillance_stage": "LTASM - I (13)",
  "surveillance_description": "Long Term Additional Surveillance Measure (LTASM) - Stage I",
  "tick_size": 0.5,
  "temp_suspended_series": ["N1", "Q1", "Q2", "W1", "IL"],
  "active_series": ["EQ", "T0"],
  "debt_series": [],
  "is_active": true
}
```

## 2. **Detailed Sector Lookup/Creation**
**Endpoint**: `GET /api/v1/sectors/detailed/search?basic_industry=Speciality%20Retail`

First, check if the sector exists. If not, create it:

**Endpoint**: `POST /api/v1/sectors/detailed` (admin only)
```javascript
{
  "macro_sector": "Consumer Discretionary",
  "sector": "Consumer Services", 
  "industry": "Retailing",
  "basic_industry": "Speciality Retail",
  "code": "CD-CS-RT-SR", // Generate a unique code
  "description": "Speciality Retail sector",
  "is_active": true
}
```

## 3. **Stock Price Data**
**Endpoint**: `POST /api/v1/stocks/:stockId/prices`
```javascript
{
  "price_date": "2025-06-20",
  "open_price": 5756,
  "close_price": 5897.5,
  "high_price": 6030,
  "low_price": 5720,
  "last_price": 5950,
  "previous_close": 5723.5,
  "price_change": 226.5,
  "price_change_percent": 3.9573687429020703,
  "vwap": 5889.65,
  "base_price": 5723.5,
  "lower_circuit_price": 5151.50,
  "upper_circuit_price": 6295.50,
  "intraday_min": 5720,
  "intraday_max": 6030,
  "week_52_high": 8345,
  "week_52_low": 4488,
  "week_52_high_date": "2024-10-14",
  "week_52_low_date": "2025-04-07",
  "session_type": "Regular",
  "market_type": "NM",
  "series": "EQ",
  "price_band": "No Band",
  "volume": null, // Not provided in your JSON
  "data_source": "NSE"
}
```

## 4. **Pre-Market Data**
**Endpoint**: `POST /api/v1/pre-market/data`
```javascript
{
  "stock_id": stockId, // From step 1
  "trading_date": "2025-06-20",
  "session_start_time": "09:00:00",
  "session_end_time": "09:07:43",
  "iep": 5756,
  "iep_change": 32.5,
  "iep_change_percent": 0.57,
  "total_traded_volume": 2306,
  "total_traded_value": null, // Calculate if needed
  "total_buy_quantity": 6837,
  "total_sell_quantity": 16750,
  "ato_buy_qty": 0,
  "ato_sell_qty": 0,
  "final_iep": 5756,
  "final_iep_qty": 2306,
  "market_type": "REGULAR",
  "data_source": "NSE"
}
```

## 5. **Pre-Market Orders** (Multiple calls)
**Endpoint**: `POST /api/v1/pre-market/data/:preMarketDataId/orders`

You'll need to make 10 calls for each order book entry:
```javascript
// Example for one entry:
{
  "stock_id": stockId,
  "order_type": "BUY",
  "price": 5745,
  "quantity": 1,
  "number_of_orders": 1,
  "is_iep": false,
  "order_rank": 1,
  "timestamp": "2025-06-20 09:07:43",
  "data_source": "NSE"
}
```

## 6. **Valuation Metrics**
**Endpoint**: `POST /api/v1/valuation/metrics`
```javascript
{
  "stock_id": stockId,
  "metric_date": "2025-06-20",
  "sector_pe": 144.79,
  "symbol_pe": 144.79,
  "data_source": "NSE",
  "is_ttm": true
}
```

## 7. **Stock Index Memberships** (Multiple calls)
For each index in `pdSectorIndAll`, you'll need to:

1. First check if index exists: `GET /api/v1/indices?index_name=NIFTY%2050`
2. If not, create it: `POST /api/v1/indices`
3. Then add membership: `POST /api/v1/indices/:indexId/stocks`

This could be 29 index membership calls based on your data.

## Summary of API Calls Needed:

### Minimum Calls (if all references exist):
1. **1 call** - Stock creation/update
2. **1 call** - Stock price data
3. **1 call** - Pre-market data
4. **10 calls** - Pre-market orders
5. **1 call** - Valuation metrics
6. **29 calls** - Index memberships (one for each index)

**Total Minimum: ~43 API calls**

### Maximum Calls (if references need creation):
- Add **1 call** for sector creation
- Add **29 calls** for index creation (if indices don't exist)
- Add **1 call** for sector lookup

**Total Maximum: ~74 API calls**

## Optimization Suggestions:

1. **Create Bulk Endpoints**: Consider creating bulk endpoints for:
   - Pre-market orders: `POST /api/v1/pre-market/data/:id/orders/bulk`
   - Index memberships: `POST /api/v1/indices/memberships/bulk`

2. **Single Composite Endpoint**: Create a specialized endpoint like:
   - `POST /api/v1/stocks/complete-data` that accepts the entire JSON and handles all operations internally

3. **Transaction Management**: Wrap all these operations in a database transaction to ensure data consistency

Would you like me to help you design any of these optimized endpoints or show you how to handle the live price updates next?

---

# Complete Market Data Endpoint Specification

## Overview
A comprehensive endpoint that accepts complete market data for a stock and handles all database operations in a single atomic transaction.

## Endpoint Details
**Method**: `POST`  
**Path**: `/api/v1/stocks/complete-market-data`  
**Description**: Create/update comprehensive stock data including stock info, pricing, pre-market data, valuation metrics, and index memberships

## Request Body Structure

```json
{
  "stockInfo": {
    "symbol": "TRENT",
    "company_name": "Trent Limited",
    "description": "Trent Limited - Speciality Retail",
    "exchange_id": 1,
    "sector_detailed_id": null,
    "currency_id": 1,
    "isin": "INE849A01020",
    "face_value": 1.0,
    "issued_size": 355487461,
    "listing_date": "2004-06-07",
    "is_fno_enabled": true,
    "is_cas_enabled": false,
    "is_slb_enabled": true,
    "is_debt_sec": false,
    "is_etf_sec": false,
    "is_delisted": false,
    "is_suspended": false,
    "is_municipal_bond": false,
    "is_hybrid_symbol": false,
    "is_top10": false,
    "identifier": "TRENTEQN",
    "trading_status": "Active",
    "trading_segment": "Normal Market",
    "board_status": "Main",
    "class_of_share": "Equity",
    "derivatives_available": true,
    "surveillance_stage": "LTASM - I (13)",
    "surveillance_description": "Long Term Additional Surveillance Measure (LTASM) - Stage I",
    "tick_size": 0.5,
    "temp_suspended_series": ["N1", "Q1", "Q2", "W1", "IL"],
    "active_series": ["EQ", "T0"],
    "debt_series": [],
    "is_active": true
  },
  "priceInfo": {
    "price_date": "2025-06-20",
    "open_price": 5756.0,
    "close_price": 5897.5,
    "high_price": 6030.0,
    "low_price": 5720.0,
    "last_price": 5950.0,
    "previous_close": 5723.5,
    "price_change": 226.5,
    "price_change_percent": 3.9573687429020703,
    "vwap": 5889.65,
    "base_price": 5723.5,
    "lower_circuit_price": 5151.50,
    "upper_circuit_price": 6295.50,
    "intraday_min": 5720.0,
    "intraday_max": 6030.0,
    "week_52_high": 8345.0,
    "week_52_low": 4488.0,
    "week_52_high_date": "2024-10-14",
    "week_52_low_date": "2025-04-07",
    "session_type": "Regular",
    "market_type": "NM",
    "series": "EQ",
    "price_band": "No Band",
    "volume": null,
    "total_traded_value": null,
    "total_traded_volume": null,
    "data_source": "NSE"
  },
  "preMarketData": {
    "trading_date": "2025-06-20",
    "session_start_time": "09:00:00",
    "session_end_time": "09:07:43",
    "iep": 5756.0,
    "iep_change": 32.5,
    "iep_change_percent": 0.57,
    "total_traded_volume": 2306,
    "total_traded_value": null,
    "total_buy_quantity": 6837,
    "total_sell_quantity": 16750,
    "ato_buy_qty": 0,
    "ato_sell_qty": 0,
    "final_iep": 5756.0,
    "final_iep_qty": 2306,
    "market_type": "REGULAR",
    "data_source": "NSE"
  },
  "preMarketOrders": [
    {
      "order_type": "BUY",
      "price": 5745.0,
      "quantity": 1,
      "number_of_orders": 1,
      "is_iep": false,
      "order_rank": 1,
      "timestamp": "2025-06-20 09:07:43"
    },
    {
      "order_type": "SELL",
      "price": 5760.0,
      "quantity": 50,
      "number_of_orders": 1,
      "is_iep": false,
      "order_rank": 1,
      "timestamp": "2025-06-20 09:07:43"
    }
  ],
  "valuationMetrics": {
    "metric_date": "2025-06-20",
    "sector_pe": 144.79,
    "symbol_pe": 144.79,
    "data_source": "NSE",
    "is_ttm": true
  },
  "indexMemberships": [
    {
      "index_name": "NIFTY 50",
      "index_code": "NIFTY50",
      "index_type": "BROAD_MARKET",
      "weightage": 2.45,
      "is_active": true
    },
    {
      "index_name": "NIFTY NEXT 50",
      "index_code": "NIFTYNEXT50",
      "index_type": "BROAD_MARKET",
      "weightage": 1.85,
      "is_active": true
    }
  ]
}
```

## Validation Schema

### Required Fields
- `stockInfo.symbol` (string, 1-20 chars, uppercase)
- `stockInfo.company_name` (string, 1-255 chars)
- `stockInfo.exchange_id` (integer, positive)
- `priceInfo.price_date` (date, YYYY-MM-DD format)
- `priceInfo.close_price` (number, positive)

### Optional Fields
- All other fields are optional with appropriate defaults
- Null values allowed for most numeric fields
- Boolean fields default to false if not provided

### Validation Rules
```javascript
const completeMarketDataSchema = {
  body: Joi.object().keys({
    stockInfo: Joi.object().keys({
      symbol: Joi.string().uppercase().min(1).max(20).required(),
      company_name: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(500).allow(null),
      exchange_id: Joi.number().integer().positive().required(),
      sector_detailed_id: Joi.number().integer().positive().allow(null),
      currency_id: Joi.number().integer().positive().default(1),
      isin: Joi.string().length(12).allow(null),
      face_value: Joi.number().positive().allow(null),
      issued_size: Joi.number().integer().positive().allow(null),
      listing_date: Joi.date().iso().allow(null),
      is_fno_enabled: Joi.boolean().default(false),
      is_cas_enabled: Joi.boolean().default(false),
      is_slb_enabled: Joi.boolean().default(false),
      is_debt_sec: Joi.boolean().default(false),
      is_etf_sec: Joi.boolean().default(false),
      is_delisted: Joi.boolean().default(false),
      is_suspended: Joi.boolean().default(false),
      is_municipal_bond: Joi.boolean().default(false),
      is_hybrid_symbol: Joi.boolean().default(false),
      is_top10: Joi.boolean().default(false),
      identifier: Joi.string().max(50).allow(null),
      trading_status: Joi.string().valid('Active', 'Suspended', 'Delisted').default('Active'),
      trading_segment: Joi.string().max(100).allow(null),
      board_status: Joi.string().max(50).allow(null),
      class_of_share: Joi.string().max(50).allow(null),
      derivatives_available: Joi.boolean().default(false),
      surveillance_stage: Joi.string().max(100).allow(null),
      surveillance_description: Joi.string().max(255).allow(null),
      tick_size: Joi.number().positive().allow(null),
      temp_suspended_series: Joi.array().items(Joi.string()).default([]),
      active_series: Joi.array().items(Joi.string()).default([]),
      debt_series: Joi.array().items(Joi.string()).default([]),
      is_active: Joi.boolean().default(true)
    }).required(),
    
    priceInfo: Joi.object().keys({
      price_date: Joi.date().iso().required(),
      open_price: Joi.number().positive().allow(null),
      close_price: Joi.number().positive().required(),
      high_price: Joi.number().positive().allow(null),
      low_price: Joi.number().positive().allow(null),
      last_price: Joi.number().positive().allow(null),
      previous_close: Joi.number().positive().allow(null),
      price_change: Joi.number().allow(null),
      price_change_percent: Joi.number().allow(null),
      vwap: Joi.number().positive().allow(null),
      base_price: Joi.number().positive().allow(null),
      lower_circuit_price: Joi.number().positive().allow(null),
      upper_circuit_price: Joi.number().positive().allow(null),
      intraday_min: Joi.number().positive().allow(null),
      intraday_max: Joi.number().positive().allow(null),
      week_52_high: Joi.number().positive().allow(null),
      week_52_low: Joi.number().positive().allow(null),
      week_52_high_date: Joi.date().iso().allow(null),
      week_52_low_date: Joi.date().iso().allow(null),
      session_type: Joi.string().valid('Regular', 'Extended', 'Pre-Market', 'Post-Market').default('Regular'),
      market_type: Joi.string().max(10).allow(null),
      series: Joi.string().max(10).allow(null),
      price_band: Joi.string().max(50).allow(null),
      volume: Joi.number().integer().min(0).allow(null),
      total_traded_value: Joi.number().positive().allow(null),
      total_traded_volume: Joi.number().integer().min(0).allow(null),
      data_source: Joi.string().max(50).default('NSE')
    }).required(),
    
    preMarketData: Joi.object().keys({
      trading_date: Joi.date().iso().required(),
      session_start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
      session_end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
      iep: Joi.number().positive().allow(null),
      iep_change: Joi.number().allow(null),
      iep_change_percent: Joi.number().allow(null),
      total_traded_volume: Joi.number().integer().min(0).allow(null),
      total_traded_value: Joi.number().positive().allow(null),
      total_buy_quantity: Joi.number().integer().min(0).allow(null),
      total_sell_quantity: Joi.number().integer().min(0).allow(null),
      ato_buy_qty: Joi.number().integer().min(0).allow(null),
      ato_sell_qty: Joi.number().integer().min(0).allow(null),
      final_iep: Joi.number().positive().allow(null),
      final_iep_qty: Joi.number().integer().min(0).allow(null),
      market_type: Joi.string().valid('REGULAR', 'EXTENDED', 'SPECIAL').default('REGULAR'),
      data_source: Joi.string().max(50).default('NSE')
    }).allow(null),
    
    preMarketOrders: Joi.array().items(
      Joi.object().keys({
        order_type: Joi.string().valid('BUY', 'SELL').required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        number_of_orders: Joi.number().integer().positive().default(1),
        is_iep: Joi.boolean().default(false),
        order_rank: Joi.number().integer().positive().allow(null),
        timestamp: Joi.date().iso().allow(null)
      })
    ).max(50).default([]),
    
    valuationMetrics: Joi.object().keys({
      metric_date: Joi.date().iso().required(),
      sector_pe: Joi.number().positive().allow(null),
      symbol_pe: Joi.number().positive().allow(null),
      data_source: Joi.string().max(50).default('NSE'),
      is_ttm: Joi.boolean().default(true)
    }).allow(null),
    
    indexMemberships: Joi.array().items(
      Joi.object().keys({
        index_name: Joi.string().min(1).max(100).required(),
        index_code: Joi.string().min(1).max(50).required(),
        index_type: Joi.string().valid('BROAD_MARKET', 'SECTORAL', 'THEMATIC', 'STRATEGY').default('BROAD_MARKET'),
        weightage: Joi.number().min(0).max(100).allow(null),
        is_active: Joi.boolean().default(true)
      })
    ).max(100).default([])
  })
};
```

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Complete market data processed successfully",
  "data": {
    "stock": {
      "id": 1234,
      "symbol": "TRENT",
      "company_name": "Trent Limited",
      "created_at": "2025-06-22T10:30:00.000Z",
      "updated_at": "2025-06-22T10:30:00.000Z"
    },
    "operations_summary": {
      "stock_created": true,
      "price_data_added": true,
      "pre_market_data_added": true,
      "pre_market_orders_added": 2,
      "valuation_metrics_added": true,
      "index_memberships_added": 2,
      "total_operations": 7
    }
  },
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "stockInfo.symbol",
      "message": "Symbol is required and must be uppercase"
    },
    {
      "field": "priceInfo.close_price",
      "message": "Close price must be a positive number"
    }
  ],
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

## Business Logic Requirements

### 1. Transaction Management
- All operations must be wrapped in a database transaction
- If any operation fails, rollback all changes
- Commit only when all operations succeed

### 2. Stock Creation/Update Logic
- Check if stock exists by symbol and exchange_id
- If exists, update non-null fields from stockInfo
- If doesn't exist, create new stock record
- Handle sector_detailed_id lookup/creation if needed

### 3. Price Data Logic
- Upsert price data based on stock_id and price_date
- Calculate derived fields (price_change, price_change_percent) if not provided
- Validate circuit limits against current price

### 4. Pre-Market Data Logic
- Create pre-market data record if provided
- Link pre-market orders to the pre-market data record
- Validate order book consistency (buy/sell quantities)

### 5. Valuation Metrics Logic
- Upsert valuation metrics based on stock_id and metric_date
- Calculate additional metrics if possible (market cap, etc.)

### 6. Index Membership Logic
- Check if indices exist, create if necessary
- Upsert stock-index relationships
- Handle weightage updates for existing memberships

### 7. Error Handling
- Validate all foreign key references
- Handle duplicate key conflicts gracefully
- Return detailed error messages for validation failures
- Log all operations for audit trail

## Implementation Considerations

### Performance Optimizations
1. **Bulk Operations**: Use bulk insert/update where possible
2. **Index Optimization**: Ensure proper database indexes on lookup fields
3. **Connection Pooling**: Manage database connections efficiently
4. **Caching**: Cache frequently accessed reference data (exchanges, currencies)

### Data Consistency
1. **Foreign Key Validation**: Verify all referenced IDs exist
2. **Data Validation**: Cross-validate related fields (e.g., circuit limits vs prices)
3. **Audit Trail**: Log all create/update operations with timestamps
4. **Conflict Resolution**: Handle concurrent updates with proper locking

### Security Considerations
1. **Input Sanitization**: Sanitize all string inputs
2. **SQL Injection Prevention**: Use parameterized queries
3. **Rate Limiting**: Implement rate limiting for bulk operations
4. **Authentication**: Require appropriate permissions for data modification

### Monitoring and Logging
1. **Operation Metrics**: Track success/failure rates
2. **Performance Metrics**: Monitor processing time per operation
3. **Error Logging**: Log detailed error information for debugging
4. **Data Quality Metrics**: Monitor data completeness and accuracy