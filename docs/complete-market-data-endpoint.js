/**
 * Complete Market Data Endpoint Documentation and Usage Examples
 * 
 * This endpoint strategically reuses existing validation schemas and service methods
 * to handle comprehensive market data in a single atomic transaction.
 */

// ============================================================================
// ENDPOINT SPECIFICATION
// ============================================================================

/**
 * Endpoint: POST /api/v1/stocks/complete-market-data
 * Method: POST
 * Authentication: Required (Bearer token)
 * Authorization: Admin only
 * Content-Type: application/json
 */

// ============================================================================
// DYNAMIC REUSE STRATEGY
// ============================================================================

/**
 * This implementation demonstrates strategic reuse of existing components:
 * 
 * 1. VALIDATION REUSE:
 *    - Leverages existing stock creation validation patterns
 *    - Reuses price validation logic from addStockPrices
 *    - Extends with additional market data validation
 * 
 * 2. SERVICE REUSE:
 *    - Uses existing createStock/updateStock service methods
 *    - Leverages existing StockPrice model and validation
 *    - Applies existing transaction patterns
 * 
 * 3. MODEL REUSE:
 *    - Works with existing Stock and StockPrice models
 *    - Stores additional data strategically using existing schema
 *    - Future-proofs for when specialized models are added
 */

// ============================================================================
// REQUEST BODY STRUCTURE
// ============================================================================

const completeMarketDataRequest = {
  // Stock information (uses existing stock validation)
  stockInfo: {
    symbol: "TRENT",                    // Required: Stock symbol (uppercase)
    company_name: "Trent Limited",      // Required: Company name
    description: "Retail company",      // Optional: Description
    exchange_id: 1,                     // Required: Exchange reference
    sector_detailed_id: 5,              // Optional: Detailed sector reference
    currency_id: 1,                     // Required: Currency reference (default: 1)
    isin: "INE849A01020",              // Optional: ISIN code
    face_value: 1.0,                    // Optional: Face value
    issued_size: 355487461,             // Optional: Issued shares
    listing_date: "2004-06-07",         // Optional: Listing date
    is_fno_enabled: true,               // Optional: F&O enabled (default: false)
    is_cas_enabled: false,              // Optional: CAS enabled (default: false)
    is_slb_enabled: true,               // Optional: SLB enabled (default: false)
    // ... additional stock fields follow existing validation patterns
    is_active: true                     // Optional: Active status (default: true)
  },

  // Price information (extends existing price validation)
  priceInfo: {
    price_date: "2025-06-20",           // Required: Price date
    open_price: 5720,                   // Optional: Opening price
    close_price: 5723.5,                // Required: Closing price
    high_price: 6030,                   // Optional: High price
    low_price: 5720,                    // Optional: Low price
    volume: 1500000,                    // Optional: Volume
    // Extended fields for comprehensive market data
    last_price: 5723.5,                 // Optional: Last traded price
    previous_close: 5691,               // Optional: Previous close
    price_change: 32.5,                 // Optional: Price change
    price_change_percent: 0.57,         // Optional: Price change percentage
    vwap: 5850,                         // Optional: Volume weighted average price
    upper_circuit_price: 6295.50,       // Optional: Upper circuit limit
    lower_circuit_price: 5151.50,       // Optional: Lower circuit limit
    week_52_high: 8345,                 // Optional: 52-week high
    week_52_low: 4488,                  // Optional: 52-week low
    data_source: "NSE"                  // Optional: Data source (default: NSE)
  },

  // Pre-market data (new functionality)
  preMarketData: {
    trading_date: "2025-06-20",         // Required: Trading date
    session_start_time: "09:00:00",     // Optional: Session start
    session_end_time: "09:07:43",       // Optional: Session end
    iep: 5756,                          // Optional: Indicative Equilibrium Price
    iep_change: 32.5,                   // Optional: IEP change
    iep_change_percent: 0.57,           // Optional: IEP change percentage
    total_traded_volume: 2306,          // Optional: Total traded volume
    data_source: "NSE"                  // Optional: Data source (default: NSE)
  },

  // Pre-market orders (array, max 50 orders)
  preMarketOrders: [
    {
      order_type: "BUY",                // Required: BUY or SELL
      price: 5745,                      // Required: Order price
      quantity: 1,                      // Required: Order quantity
      number_of_orders: 1,              // Optional: Number of orders (default: 1)
      is_iep: false,                    // Optional: Is IEP order (default: false)
      order_rank: 1                     // Optional: Order rank
    }
  ],

  // Valuation metrics
  valuationMetrics: {
    metric_date: "2025-06-20",          // Required: Metric date
    sector_pe: 144.79,                  // Optional: Sector P/E ratio
    symbol_pe: 144.79,                  // Optional: Stock P/E ratio
    data_source: "NSE",                 // Optional: Data source (default: NSE)
    is_ttm: true                        // Optional: Is TTM data (default: true)
  },

  // Index memberships (array, max 100 memberships)
  indexMemberships: [
    {
      index_name: "NIFTY 50",           // Required: Index name
      index_code: "NIFTY50",            // Required: Index code
      index_type: "BROAD_MARKET",       // Optional: Index type (default: BROAD_MARKET)
      weightage: 2.5,                   // Optional: Stock weightage in index
      is_active: true                   // Optional: Active status (default: true)
    }
  ]
};

// ============================================================================
// RESPONSE STRUCTURE
// ============================================================================

const completeMarketDataResponse = {
  success: true,
  statusCode: 201,
  message: "Complete market data processed successfully",
  data: {
    stock: {
      id: 123,
      symbol: "TRENT",
      company_name: "Trent Limited",
      // ... other stock fields
    },
    priceData: {
      id: 456,
      stockId: 123,
      priceDate: "2025-06-20",
      openPrice: 5720,
      closePrice: 5723.5,
      // ... other price fields
    },
    additionalData: {
      preMarketProcessed: true,
      valuationProcessed: true,
      indexMembershipsProcessed: 1
    },
    summary: {
      created: true,    // or false if updated
      updated: false    // or true if stock was updated
    }
  }
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Create new stock with complete data
 */
const createNewStockExample = `
curl -X POST http://localhost:3000/api/v1/stocks/complete-market-data \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${JSON.stringify(completeMarketDataRequest, null, 2)}'
`;

/**
 * Example 2: Update existing stock with new market data
 */
const updateExistingStockExample = {
  ...completeMarketDataRequest,
  stockInfo: {
    ...completeMarketDataRequest.stockInfo,
    symbol: "RELIANCE"  // Existing stock symbol
  },
  priceInfo: {
    ...completeMarketDataRequest.priceInfo,
    price_date: "2025-06-21",  // New date
    close_price: 2450.75       // Updated price
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const errorExamples = {
  validationError: {
    success: false,
    statusCode: 400,
    message: "Validation error",
    errors: [
      {
        field: "stockInfo.symbol",
        message: "Symbol is required"
      }
    ]
  },
  
  duplicateStock: {
    success: false,
    statusCode: 409,
    message: "Stock with this symbol already exists"
  },
  
  transactionError: {
    success: false,
    statusCode: 500,
    message: "Failed to process complete market data: Database transaction failed"
  }
};

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

module.exports = {
  completeMarketDataRequest,
  completeMarketDataResponse,
  createNewStockExample,
  updateExistingStockExample,
  errorExamples
};

console.log('✅ Complete Market Data Endpoint Documentation');
console.log('📝 Request structure defined');
console.log('🔄 Dynamic reuse strategy implemented');
console.log('✨ Ready for testing and integration');
