# Payload Transformation System

This system provides a flexible way to handle different payload formats for API endpoints, automatically transforming them to match our API schema before validation.

## Overview

The payload transformation system consists of:

1. **Payload Transformer Middleware** (`payloadTransformer.js`) - Generic middleware that applies transformations
2. **Format-Specific Transformers** (`stockPayloadTransformers.js`) - Functions that transform specific payload formats
3. **Format Configuration** (`payloadFormatConfig.js`) - Configuration and detection logic for different formats
4. **Route Integration** - Middleware applied before validation in routes

## How It Works

```
Incoming Request → Payload Transformer → Format Detection → Transform → Validation → Controller
```

1. Request hits the endpoint with payload
2. Payload transformer middleware analyzes the payload
3. System detects the format using detector functions
4. Appropriate transformer function is applied
5. Transformed payload continues to validation
6. If validation passes, request goes to controller

## Currently Supported Formats

### NSE Market Data Format
**Detection**: Payload has `data.info`, `data.priceInfo`, and `source: "NSE"`

**Input Structure**:
```json
{
  "symbol": "TRENT",
  "company": "Trent Limited", 
  "timestamp": "2025-06-22T16:09:55.660Z",
  "source": "NSE",
  "data": {
    "info": { ... },
    "priceInfo": { ... },
    "preOpenMarket": { ... },
    "metadata": { ... }
  }
}
```

**Output**: Transformed to standard API format with `stockInfo`, `priceInfo`, etc.

### Standard API Format
**Detection**: Payload has `stockInfo` and `priceInfo` at root level

**Input/Output**: No transformation needed

## Adding New Formats

### 1. Create Transformer Function

Add to `stockPayloadTransformers.js`:

```javascript
const transformBloombergData = (payload) => {
  return {
    stockInfo: {
      symbol: payload.bloomberg_data.ticker,
      company_name: payload.bloomberg_data.company_name,
      // ... map other fields
    },
    priceInfo: {
      // ... map price fields
    }
    // ... other required sections
  };
};
```

### 2. Add Format Configuration

Add to `payloadFormatConfig.js`:

```javascript
BLOOMBERG_FORMAT: {
  name: 'Bloomberg Data Format',
  description: 'Bloomberg API format',
  detector: (payload) => {
    return payload.bloomberg_data && payload.security_info;
  },
  transformer: transformBloombergData,
  endpoints: ['/complete-market-data']
}
```

### 3. Export Transformer

Add to exports in `stockPayloadTransformers.js`:

```javascript
module.exports = {
  transformNSEMarketData,
  transformBloombergData,  // Add this
  autoTransformCompleteMarketData
};
```

## Usage in Routes

```javascript
// Import the system
const payloadTransformer = require('../../../core/middlewares/payloadTransformer');
const { createTransformerForEndpoint } = require('./transformers/payloadFormatConfig');

// Apply to route (before validation)
router.post(
  '/complete-market-data',
  authenticate,
  authorize('admin'),
  payloadTransformer(createTransformerForEndpoint('/complete-market-data')),
  validate(stocksValidation.completeMarketData.body),
  catchAsync(stocksController.completeMarketData)
);
```

## Field Mapping Guide

When creating transformers, map fields according to the validation schema:

### Stock Info Mapping
```javascript
stockInfo: {
  symbol: source.symbol,                    // Required
  company_name: source.companyName,         // Required  
  exchange_id: 1,                          // Required (1 = NSE)
  isin: source.isin,                       // Optional
  listing_date: formatDate(source.date),   // Optional ISO date
  is_fno_enabled: source.isFNO || false,   // Boolean
  // ... other fields
}
```

### Price Info Mapping
```javascript
priceInfo: {
  price_date: new Date().toISOString(),     // Required ISO date
  close_price: source.lastPrice,           // Required
  open_price: source.open,                 // Optional
  high_price: source.high,                 // Optional
  low_price: source.low,                   // Optional
  // ... other fields
}
```

## Error Handling

The system handles errors gracefully:

1. **Unknown Format**: Returns 400 with supported formats list
2. **Transformation Error**: Returns 400 with error details
3. **Missing Transformer**: Returns 400 with implementation needed message

## Logging

All transformations are logged with:
- Original payload structure
- Transformed payload structure  
- Endpoint information
- Timestamp and request details

## Testing

Test your transformers by:

1. **Unit Testing**: Test transformer functions directly
2. **Integration Testing**: Send payloads to endpoints
3. **Format Detection**: Verify detectors work correctly
4. **Error Cases**: Test invalid payloads

## Best Practices

1. **Detector Functions**: Make them specific to avoid false positives
2. **Default Values**: Use appropriate defaults for missing optional fields
3. **Data Types**: Ensure correct data types (dates as ISO strings, numbers as numbers)
4. **Error Messages**: Provide clear error messages for debugging
5. **Performance**: Keep transformations efficient for high-volume endpoints

## Future Enhancements

1. **Async Transformers**: Support for async transformation functions
2. **Validation Bypass**: Option to bypass validation for trusted sources
3. **Format Versioning**: Support for multiple versions of the same format
4. **Caching**: Cache transformation results for identical payloads
5. **Metrics**: Add transformation performance metrics
