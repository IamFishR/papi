# NSE Live Price Update API - Daily once

## Overview

The NSE Live Price Update API provides a dedicated endpoint for updating stock prices in real-time from NSE (National Stock Exchange) data feeds. This endpoint is designed to handle bulk updates of multiple stocks at once, along with market metadata.

## Endpoint Specification

### Bulk Live Price Update

**Endpoint**: `POST /api/v1/stocks/bulk/prices/live`

**Authentication**: Required (Admin only)

**Request Body Structure**:

```json
{
    "name": "NIFTY 50",
    "advance": {
        "declines": "41",
        "advances": "9",
        "unchanged": "0"
    },
    "timestamp": "23-Jun-2025 11:10:43",
    "data": [
        {
            "symbol": "NIFTY 50",
            "identifier": "NIFTY 50",
            "open": 24939.75,
            "dayHigh": 24988.1,
            "dayLow": 24824.85,
            "lastPrice": 24915.4,
            "previousClose": 25112.4,
            "change": -197,
            "pChange": -0.78,
            "totalTradedVolume": 95186766,
            "lastUpdateTime": "23-Jun-2025 11:10:43",
            "yearHigh": 26277.35,
            "yearLow": 21743.65
        },
        {
            "symbol": "BEL",
            "identifier": "BELEQN",
            "series": "EQ",
            "open": 411,
            "dayHigh": 418.5,
            "dayLow": 409.05,
            "lastPrice": 417.85,
            "previousClose": 408.25,
            "change": 9.6,
            "pChange": 2.35,
            "totalTradedVolume": 22654210,
            "yearHigh": 418.5,
            "yearLow": 240.25,
            "meta": {
                "symbol": "BEL",
                "companyName": "Bharat Electronics Limited",
                "industry": "Aerospace & Defense"
            }
        }
    ],
    "metadata": {
        "indexName": "NIFTY 50",
        "open": 24939.75,
        "high": 24988.1,
        "low": 24824.85,
        "previousClose": 25112.4,
        "last": 24915.4,
        "percChange": -0.78,
        "change": -197
    },
    "marketStatus": {
        "market": "Capital Market",
        "marketStatus": "Open",
        "tradeDate": "23-Jun-2025 11:11",
        "index": "NIFTY 50",
        "last": 24916.2,
        "variation": -196.20000000000073,
        "percentChange": -0.78,
        "marketStatusMessage": "Normal Market is Open"
    }
}
```

**Response Structure**:

```json
{
  "success": true,
  "message": "Live price update completed successfully",
  "data": {
    "summary": {
      "totalSubmitted": 2,
      "processed": 1,
      "created": 0,
      "updated": 1,
      "skipped": 1,
      "errors": 0
    },
    "details": {
      "skipped": [
        {
          "symbol": "NIFTY 50",
          "reason": "Stock not found in database"
        }
      ],
      "errors": []
    },
    "priceDate": "2025-06-23",
    "marketDataProcessed": true
  },
  "timestamp": "2025-06-23T11:15:22.321Z"
}
```

## Data Transformation Process

The endpoint performs the following transformations on the incoming NSE data:

1. Extracts and normalizes stock price data from the `data` array
2. Converts NSE date format (DD-MMM-YYYY HH:MM:SS) to ISO format
3. Maps NSE fields to stock price database fields
4. Updates the current price in the stocks table
5. Creates or updates price records in the stock_prices table
6. Stores market status data (advances, declines, etc.) in the market_status table

## Implementation Details

The implementation leverages the existing payload transformation system to handle NSE's specific JSON format. The transformation pipeline includes:

1. **Format Detection**: Identifies NSE live price format based on the payload structure
2. **Data Transformation**: Maps NSE fields to our internal data structure
3. **Bulk Database Update**: Uses Sequelize's bulkCreate with updateOnDuplicate for efficient updates
4. **Result Aggregation**: Provides detailed results including processed/skipped/error counts

## Usage Recommendations

This endpoint is designed for:

1. Real-time price updates from NSE data feeds
2. Intraday price tracking
3. Market breadth monitoring (advances/declines)
4. Trading status updates

It should be used in conjunction with scheduled jobs or event-driven updates from live market data sources.
