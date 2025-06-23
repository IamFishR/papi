/**
 * Stock validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing stocks with filters
 */
const listStocks = {
  query: Joi.object().keys({
    search: Joi.string().allow('', null),
    exchange: Joi.number().integer().allow(null),
    sector: Joi.number().integer().allow(null),
    detailedSector: Joi.number().integer().allow(null),
    isin: Joi.string().length(12).allow(null),
    fnoEnabled: Joi.boolean().allow(null),
    tradingStatus: Joi.string().valid('Active', 'Suspended', 'Delisted').allow(null),
    surveillanceStage: Joi.string().allow(null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'company_name', 'market_cap', 'listing_date').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting a stock by ID
 */
const getStockById = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for getting stock prices
 */
const getStockPrices = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    interval: Joi.string().valid('day', 'week', 'month').default('day'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(100),
  }),
};

/**
 * Schema for adding stock prices
 */
const addStockPrices = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    price: Joi.number().positive().required(),
    volume: Joi.number().positive(),
    high: Joi.number().positive(),
    low: Joi.number().positive(),
    open_price: Joi.number().positive(),
    close_price: Joi.number().positive(),
    price_date: Joi.date().iso().required(),
  }).or('high', 'low', 'open_price', 'close_price'),
};

/**
 * Schema for getting stock news
 */
const getStockNews = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    sentiment: Joi.string().valid('positive', 'negative', 'neutral', 'any'),
    from: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * Schema for getting stock technical indicators
 */
const getStockIndicators = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    type: Joi.string().valid('RSI', 'SMA', 'EMA', 'MACD', 'bollinger_bands'),
    period: Joi.number().integer().min(1).max(200),
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * Schema for creating a stock
 */
const createStock = {
  body: Joi.object().keys({
    symbol: Joi.string().min(1).max(20).required(),
    companyName: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow('', null),
    exchangeId: Joi.number().integer().positive().required(),
    sectorId: Joi.number().integer().positive().allow(null),
    sectorDetailedId: Joi.number().integer().positive().allow(null),
    currencyId: Joi.number().integer().positive().required(),
    marketCap: Joi.number().positive().allow(null),
    peRatio: Joi.number().positive().allow(null),
    dividendYield: Joi.number().min(0).max(100).allow(null),
    beta: Joi.number().allow(null),
    isActive: Joi.boolean().default(true),
    // New Indian-specific fields
    isin: Joi.string().length(12).allow(null),
    faceValue: Joi.number().positive().default(1.00),
    issuedSize: Joi.number().integer().positive().allow(null),
    listingDate: Joi.date().allow(null),
    isFnoEnabled: Joi.boolean().default(false),
    isCasEnabled: Joi.boolean().default(false),
    isSlbEnabled: Joi.boolean().default(false),
    isDebtSec: Joi.boolean().default(false),
    isEtfSec: Joi.boolean().default(false),
    isDelisted: Joi.boolean().default(false),
    isSuspended: Joi.boolean().default(false),
    isMunicipalBond: Joi.boolean().default(false),
    isHybridSymbol: Joi.boolean().default(false),
    isTop10: Joi.boolean().default(false),
    identifier: Joi.string().max(50).allow(null),
    tradingStatus: Joi.string().valid('Active', 'Suspended', 'Delisted').default('Active'),
    tradingSegment: Joi.string().max(50).default('Normal Market'),
    boardStatus: Joi.string().max(20).default('Main'),
    classOfShare: Joi.string().max(20).default('Equity'),
    derivativesAvailable: Joi.boolean().default(false),
    surveillanceStage: Joi.string().max(50).allow(null),
    surveillanceDescription: Joi.string().allow(null),
    tickSize: Joi.number().positive().default(0.05),
    tempSuspendedSeries: Joi.array().allow(null),
    activeSeries: Joi.array().allow(null),
    debtSeries: Joi.array().allow(null),
  }),
};

/**
 * Schema for updating a stock
 */
const updateStock = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    symbol: Joi.string().min(1).max(20),
    companyName: Joi.string().min(1).max(100),
    description: Joi.string().allow('', null),
    exchangeId: Joi.number().integer().positive(),
    sectorId: Joi.number().integer().positive().allow(null),
    sectorDetailedId: Joi.number().integer().positive().allow(null),
    currencyId: Joi.number().integer().positive(),
    marketCap: Joi.number().positive().allow(null),
    peRatio: Joi.number().positive().allow(null),
    dividendYield: Joi.number().min(0).max(100).allow(null),
    beta: Joi.number().allow(null),
    isActive: Joi.boolean(),
    // New Indian-specific fields
    isin: Joi.string().length(12).allow(null),
    faceValue: Joi.number().positive(),
    issuedSize: Joi.number().integer().positive().allow(null),
    listingDate: Joi.date().allow(null),
    isFnoEnabled: Joi.boolean(),
    isCasEnabled: Joi.boolean(),
    isSlbEnabled: Joi.boolean(),
    isDebtSec: Joi.boolean(),
    isEtfSec: Joi.boolean(),
    isDelisted: Joi.boolean(),
    isSuspended: Joi.boolean(),
    isMunicipalBond: Joi.boolean(),
    isHybridSymbol: Joi.boolean(),
    isTop10: Joi.boolean(),
    identifier: Joi.string().max(50).allow(null),
    tradingStatus: Joi.string().valid('Active', 'Suspended', 'Delisted'),
    tradingSegment: Joi.string().max(50),
    boardStatus: Joi.string().max(20),
    classOfShare: Joi.string().max(20),
    derivativesAvailable: Joi.boolean(),
    surveillanceStage: Joi.string().max(50).allow(null),
    surveillanceDescription: Joi.string().allow(null),
    tickSize: Joi.number().positive(),
    tempSuspendedSeries: Joi.array().allow(null),
    activeSeries: Joi.array().allow(null),
    debtSeries: Joi.array().allow(null),
  }).min(1),
};

/**
 * Schema for deleting a stock
 */
const deleteStock = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for bulk updating prices from NSE JSON data (enhanced for Indian market)
 */
const bulkUpdatePrices = {
  body: Joi.object().keys({
    priceData: Joi.array().items(
      Joi.object().keys({
        symbol: Joi.string().required(),
        identifier: Joi.string().allow(''),
        open: Joi.number().positive().allow(null),
        dayHigh: Joi.number().positive().allow(null),
        dayLow: Joi.number().positive().allow(null),
        lastPrice: Joi.number().positive().allow(null),
        previousClose: Joi.number().positive().allow(null),
        change: Joi.number().allow(null),
        pChange: Joi.number().allow(null),
        totalTradedVolume: Joi.number().integer().min(0).allow(null),
        averagePrice: Joi.number().positive().allow(null),
        basePrice: Joi.number().positive().allow(null),
        lowerCP: Joi.number().positive().allow(null),
        upperCP: Joi.number().positive().allow(null),
        intraDayHighLow: Joi.object().keys({
          min: Joi.number().positive().allow(null),
          max: Joi.number().positive().allow(null)
        }).allow(null),
        weekHighLow: Joi.object().keys({
          min: Joi.number().positive().allow(null),
          max: Joi.number().positive().allow(null),
          minDate: Joi.date().allow(null),
          maxDate: Joi.date().allow(null)
        }).allow(null),
        sessionType: Joi.string().allow(null),
        marketType: Joi.string().allow(null),
        series: Joi.string().allow(null),
        priceBand: Joi.string().allow(null),
        lastUpdateTime: Joi.string().allow(''),
        meta: Joi.object().allow(null)
      }).required()
    ).min(1).required(),
    priceDate: Joi.date().iso().default(() => new Date().toISOString().split('T')[0])
  })
};

/**
 * Schema for getting stock by ISIN
 */
const getStockByISIN = {
  params: Joi.object().keys({
    isin: Joi.string().length(12).required(),
  }),
};

/**
 * Schema for getting stocks by detailed sector
 */
const getStocksByDetailedSector = {
  params: Joi.object().keys({
    sectorId: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'company_name', 'market_cap').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting FNO enabled stocks
 */
const getFNOEnabledStocks = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'company_name', 'market_cap').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting stocks by surveillance stage
 */
const getStocksBySurveillanceStage = {
  params: Joi.object().keys({
    stage: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'company_name', 'market_cap').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for updating stock Indian fields
 */
const updateStockIndianFields = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    isin: Joi.string().length(12).allow(null),
    faceValue: Joi.number().positive(),
    issuedSize: Joi.number().integer().positive().allow(null),
    listingDate: Joi.date().allow(null),
    isFnoEnabled: Joi.boolean(),
    isCasEnabled: Joi.boolean(),
    isSlbEnabled: Joi.boolean(),
    isDebtSec: Joi.boolean(),
    isEtfSec: Joi.boolean(),
    isDelisted: Joi.boolean(),
    isSuspended: Joi.boolean(),
    isMunicipalBond: Joi.boolean(),
    isHybridSymbol: Joi.boolean(),
    isTop10: Joi.boolean(),
    identifier: Joi.string().max(50).allow(null),
    tradingStatus: Joi.string().valid('Active', 'Suspended', 'Delisted'),
    tradingSegment: Joi.string().max(50),
    boardStatus: Joi.string().max(20),
    classOfShare: Joi.string().max(20),
    derivativesAvailable: Joi.boolean(),
    surveillanceStage: Joi.string().max(50).allow(null),
    surveillanceDescription: Joi.string().allow(null),
    tickSize: Joi.number().positive(),
    sectorDetailedId: Joi.number().integer().positive().allow(null),
    tempSuspendedSeries: Joi.array().allow(null),
    activeSeries: Joi.array().allow(null),
    debtSeries: Joi.array().allow(null),
  }).min(1),
};

/**
 * Schema for complete market data endpoint - dynamically composed from existing schemas
 */
const completeMarketData = {
  body: Joi.object().keys({
    // Reuse existing stock creation schema with appropriate field names
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
    
    // Extended price info that leverages existing price validation patterns
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
    
    // Pre-market data schema (new, but follows existing patterns)
    preMarketData: Joi.object().keys({
      trading_date: Joi.date().iso().required(),
      session_start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).allow(null),
      session_end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).allow(null),
      iep: Joi.number().positive().allow(null),
      iep_change: Joi.number().allow(null),
      iep_change_percent: Joi.number().allow(null),
      total_traded_volume: Joi.number().integer().min(0).allow(null),
      total_traded_value: Joi.number().positive().allow(null),
      total_buy_quantity: Joi.number().integer().min(0).allow(null),
      total_sell_quantity: Joi.number().integer().min(0).allow(null),
      ato_buy_qty: Joi.number().integer().min(0).allow(null),
      ato_sell_qty: Joi.number().integer().min(0).allow(null),
      final_iep: Joi.number().allow(null),
      final_iep_qty: Joi.number().integer().min(0).allow(null),
      market_type: Joi.string().valid('REGULAR', 'EXTENDED', 'SPECIAL').default('REGULAR'),
      data_source: Joi.string().max(50).default('NSE')
    }).allow(null).default(null),
    
    // Pre-market orders array
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
    
    // Valuation metrics
    valuationMetrics: Joi.object().keys({
      metric_date: Joi.date().iso().required(),
      sector_pe: Joi.number().positive().allow(null),
      symbol_pe: Joi.number().positive().allow(null),
      data_source: Joi.string().max(50).default('NSE'),
      is_ttm: Joi.boolean().default(true)
    }).allow(null),
    
    // Index memberships
    indexMemberships: Joi.array().items(
      Joi.object().keys({
        index_name: Joi.string().min(1).max(100).required(),
        index_code: Joi.string().min(1).max(70).required(),
        index_type: Joi.string().valid('BROAD_MARKET', 'SECTORAL', 'THEMATIC', 'STRATEGY').default('BROAD_MARKET'),
        weightage: Joi.number().min(0).max(100).allow(null),
        is_active: Joi.boolean().default(true)
      })
    ).max(100).default([]),
    
    // Industry information for detailed sector processing
    industryInfo: Joi.object().keys({
      macro: Joi.string().min(1).max(100).required(),
      sector: Joi.string().min(1).max(100).required(),
      industry: Joi.string().min(1).max(100).required(),
      basicIndustry: Joi.string().min(1).max(100).required()
    }).allow(null)
  })
};

/**
 * Schema for bulk live updating prices (specific for live market data updates)
 */
const bulkUpdateLivePrices = {
  body: Joi.object().keys({
    data: Joi.array().items(
      Joi.object().keys({
        symbol: Joi.string().required(),
        identifier: Joi.string().allow(null),
        open: Joi.number().positive().allow(null),
        dayHigh: Joi.number().positive().allow(null),
        dayLow: Joi.number().positive().allow(null),
        lastPrice: Joi.number().positive().allow(null),
        previousClose: Joi.number().positive().allow(null),
        change: Joi.number().allow(null),
        pChange: Joi.number().allow(null),
        totalTradedVolume: Joi.number().integer().min(0).allow(null),
        totalTradedValue: Joi.number().positive().allow(null),
        lastUpdateTime: Joi.string().allow(null),
        yearHigh: Joi.number().positive().allow(null),
        yearLow: Joi.number().positive().allow(null),
        nearWKH: Joi.number().allow(null),
        nearWKL: Joi.number().allow(null),
        perChange365d: Joi.number().allow(null),
        perChange30d: Joi.number().allow(null),
        series: Joi.string().allow(null),
        meta: Joi.object().allow(null)
      })
    ).min(1).required(),
    name: Joi.string().allow(null),
    timestamp: Joi.string().required(),
    advance: Joi.object().keys({
      declines: Joi.string().allow(null),
      advances: Joi.string().allow(null),
      unchanged: Joi.string().allow(null)
    }).allow(null),
    metadata: Joi.object().allow(null),
    marketStatus: Joi.object().allow(null)
  }).required()
};

module.exports = {
  listStocks,
  getStockById,
  getStockPrices,
  addStockPrices,
  getStockNews,
  getStockIndicators,
  createStock,
  updateStock,
  updateStockIndianFields,
  deleteStock,
  bulkUpdatePrices,
  bulkUpdateLivePrices,
  completeMarketData,
};
