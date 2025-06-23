/**
 * Payload Format Configuration
 * Manages different payload formats and their corresponding transformers
 */

const { 
  transformNSEMarketData,
  autoTransformCompleteMarketData 
} = require('./stockPayloadTransformers');

const { transformNSELivePrice } = require('./nseLivePriceTransformer');

/**
 * Convert NSE date format to ISO format
 * @param {string} nseDate - Date in NSE format (DD-MMM-YYYY) or other formats
 * @param {boolean} includeTime - Whether to include time component
 * @returns {string|null} ISO date string or null
 */
const convertNSEDateToISO = (nseDate, includeTime = false) => {
  if (!nseDate) return null;
  
  try {
    // If it's already ISO format, return as is
    if (nseDate.includes('T')) {
      return includeTime ? new Date(nseDate).toISOString() : new Date(nseDate).toISOString().split('T')[0];
    }
    
    if (nseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return includeTime ? new Date(nseDate).toISOString() : nseDate;
    }
    
    // Handle DD-MMM-YYYY format (like "19-Jun-2024")
    if (nseDate.match(/^\d{1,2}-[A-Za-z]{3}-\d{4}$/)) {
      const [day, month, year] = nseDate.split('-');
      const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const isoDate = `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
      return includeTime ? new Date(isoDate).toISOString() : isoDate;
    }
    
    // Handle DD-MMM-YYYY HH:MM:SS format (like "20-Jun-2025 16:00:00")
    if (nseDate.match(/^\d{1,2}-[A-Za-z]{3}-\d{4} \d{1,2}:\d{2}:\d{2}$/)) {
      const [datePart, timePart] = nseDate.split(' ');
      const [day, month, year] = datePart.split('-');
      const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const isoDateTime = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T${timePart}`;
      return includeTime ? new Date(isoDateTime).toISOString() : new Date(isoDateTime).toISOString().split('T')[0];
    }
    
    // Try parsing as is and convert to ISO
    const parsed = new Date(nseDate);
    return includeTime ? parsed.toISOString() : parsed.toISOString().split('T')[0];
  } catch (error) {
    console.warn(`Failed to convert NSE date "${nseDate}" to ISO format:`, error.message);
    return null;
  }
};

/**
 * Payload format definitions
 * Each format has a detector function and a transformer function
 */
const PAYLOAD_FORMATS = {
  NSE_MARKET_DATA: {
    name: 'NSE Market Data',
    description: 'NSE API format with nested data structure',
    detector: (payload) => {
      return payload.data && 
             payload.data.info && 
             payload.data.priceInfo && 
             payload.source === 'NSE';
    },
    transformer: transformNSEMarketData,
    endpoints: ['/complete-market-data']
  },
  
  // Future format examples:
  BLOOMBERG_FORMAT: {
    name: 'Bloomberg Data Format',
    description: 'Bloomberg API format',
    detector: (payload) => {
      return payload.bloomberg_data && payload.security_info;
    },
    transformer: null, // To be implemented
    endpoints: ['/complete-market-data']
  },
  
  YAHOO_FINANCE_FORMAT: {
    name: 'Yahoo Finance Format',
    description: 'Yahoo Finance API format',
    detector: (payload) => {
      return payload.quoteSummary && payload.quoteSummary.result;
    },
    transformer: null, // To be implemented
    endpoints: ['/complete-market-data']
  },
  
  STANDARD_API_FORMAT: {
    name: 'Standard API Format',
    description: 'Our standard API format',
    detector: (payload) => {
      return payload.stockInfo && payload.priceInfo;
    },
    transformer: (payload) => payload, // No transformation needed
    endpoints: ['/complete-market-data']
  },
  
  NSE_LIVE_PRICE_FORMAT: {
    name: 'NSE Live Price Format',
    description: 'NSE live price data with array of stocks',
    detector: (payload) => {
      return payload.data && 
             Array.isArray(payload.data) && 
             payload.timestamp &&
             (payload.advance || payload.metadata);
    },
    transformer: transformNSELivePrice,
    endpoints: ['/bulk/prices/live']
  },
  
  NSE_DIRECT_FORMAT: {
    name: 'NSE Direct Format', 
    description: 'NSE data with info, metadata, industryInfo, priceInfo structure',
    detector: (payload) => {
      return payload.info && 
             payload.metadata && 
             payload.priceInfo && 
             payload.industryInfo;
    },
    transformer: (payload) => {
      console.log('========== NSE_DIRECT_FORMAT TRANSFORMER ==========');
      console.log('Input payload industryInfo:', payload.industryInfo);
      
      // Transform NSE direct format to standard format
      const result = {
        stockInfo: {
          symbol: payload.info.symbol,
          company_name: payload.info.companyName,
          description: null,
          exchange_id: 1, // NSE default
          currency_id: 1, // INR default
          isin: payload.info.isin,
          face_value: payload.securityInfo?.faceValue,
          issued_size: payload.securityInfo?.issuedSize,
          listing_date: payload.info.listingDate,
          is_fno_enabled: payload.info.isFNOSec,
          is_cas_enabled: payload.info.isCASec,
          is_slb_enabled: payload.info.isSLBSec,
          is_debt_sec: payload.info.isDebtSec,
          is_etf_sec: payload.info.isETFSec,
          is_delisted: payload.info.isDelisted,
          is_suspended: payload.info.isSuspended,
          is_municipal_bond: payload.info.isMunicipalBond,
          is_hybrid_symbol: payload.info.isHybridSymbol,
          is_top10: payload.info.isTop10,
          identifier: payload.info.identifier,
          trading_status: payload.securityInfo?.tradingStatus || 'Active',
          trading_segment: payload.securityInfo?.tradingSegment,
          board_status: payload.securityInfo?.boardStatus,
          class_of_share: payload.securityInfo?.classOfShare,
          derivatives_available: payload.securityInfo?.derivatives === 'Yes',
          surveillance_stage: payload.securityInfo?.surveillance?.surv,
          surveillance_description: payload.securityInfo?.surveillance?.desc,
          tick_size: payload.priceInfo?.tickSize,
          temp_suspended_series: payload.info.tempSuspendedSeries || [],
          active_series: payload.info.activeSeries || [],
          debt_series: payload.info.debtSeries || [],
          is_active: !payload.info.isDelisted && !payload.info.isSuspended
        },
        
        priceInfo: {
          price_date: new Date().toISOString().split('T')[0],
          open_price: payload.priceInfo?.open,
          close_price: payload.priceInfo?.close || payload.priceInfo?.lastPrice,
          high_price: payload.priceInfo?.intraDayHighLow?.max,
          low_price: payload.priceInfo?.intraDayHighLow?.min,
          last_price: payload.priceInfo?.lastPrice,
          previous_close: payload.priceInfo?.previousClose,
          price_change: payload.priceInfo?.change,
          price_change_percent: payload.priceInfo?.pChange,
          vwap: payload.priceInfo?.vwap,
          base_price: payload.priceInfo?.basePrice,
          lower_circuit_price: parseFloat(payload.priceInfo?.lowerCP?.replace(/,/g, '') || 0),
          upper_circuit_price: parseFloat(payload.priceInfo?.upperCP?.replace(/,/g, '') || 0),
          intraday_min: payload.priceInfo?.intraDayHighLow?.min,
          intraday_max: payload.priceInfo?.intraDayHighLow?.max,
          week_52_high: payload.priceInfo?.weekHighLow?.max,
          week_52_low: payload.priceInfo?.weekHighLow?.min,
          week_52_high_date: convertNSEDateToISO(payload.priceInfo?.weekHighLow?.maxDate),
          week_52_low_date: convertNSEDateToISO(payload.priceInfo?.weekHighLow?.minDate),
          session_type: 'Regular',
          market_type: payload.currentMarketType,
          series: payload.metadata?.series,
          price_band: payload.priceInfo?.pPriceBand,
          volume: null,
          total_traded_volume: payload.preOpenMarket?.totalTradedVolume,
          data_source: 'NSE'
        },
        
        preMarketData: payload.preOpenMarket ? {
          trading_date: new Date().toISOString().split('T')[0],
          iep: payload.preOpenMarket.IEP,
          iep_change: payload.preOpenMarket.Change,
          iep_change_percent: payload.preOpenMarket.perChange,
          total_traded_volume: payload.preOpenMarket.totalTradedVolume,
          total_buy_quantity: payload.preOpenMarket.totalBuyQuantity,
          total_sell_quantity: payload.preOpenMarket.totalSellQuantity,
          ato_buy_qty: payload.preOpenMarket.atoBuyQty,
          ato_sell_qty: payload.preOpenMarket.atoSellQty,
          final_iep: payload.preOpenMarket.finalPrice,
          final_iep_qty: payload.preOpenMarket.finalQuantity,
          market_type: 'REGULAR',
          data_source: 'NSE'
        } : null,
        
        preMarketOrders: payload.preOpenMarket?.preopen ? 
          payload.preOpenMarket.preopen.map((order, index) => ({
            order_type: order.buyQty > 0 ? 'BUY' : 'SELL',
            price: order.price,
            quantity: order.buyQty || order.sellQty,
            number_of_orders: 1,
            is_iep: order.iep || false,
            order_rank: index + 1,
            timestamp: payload.preOpenMarket.lastUpdateTime ? 
              convertNSEDateToISO(payload.preOpenMarket.lastUpdateTime, true) : null
          })) : [],
        
        valuationMetrics: payload.metadata ? {
          metric_date: new Date().toISOString().split('T')[0],
          sector_pe: payload.metadata.pdSectorPe,
          symbol_pe: payload.metadata.pdSymbolPe,
          data_source: 'NSE',
          is_ttm: true
        } : null,
        
        indexMemberships: payload.metadata?.pdSectorIndAll ? 
          payload.metadata.pdSectorIndAll.map(indexName => ({
            index_name: indexName,
            index_code: indexName.replace(/\s+/g, '_').toUpperCase(),
            index_type: 'BROAD_MARKET',
            weightage: null,
            is_active: true
          })) : [],
        
        industryInfo: payload.industryInfo ? {
          macro: payload.industryInfo.macro,
          sector: payload.industryInfo.sector,
          industry: payload.industryInfo.industry,
          basicIndustry: payload.industryInfo.basicIndustry
        } : null
      };
      
      console.log('Output result industryInfo:', result.industryInfo);
      console.log('========== END NSE_DIRECT_FORMAT TRANSFORMER ==========');
      return result;
    },
    endpoints: ['/complete-market-data']
  }
};

/**
 * Auto-detect payload format for a specific endpoint
 * @param {Object} payload - The payload to analyze
 * @param {string} endpoint - The endpoint being called
 * @returns {Object|null} Format configuration or null if not detected
 */
const detectPayloadFormat = (payload, endpoint) => {
  for (const [formatKey, formatConfig] of Object.entries(PAYLOAD_FORMATS)) {
    
    // Check if this format applies to the current endpoint
    if (!formatConfig.endpoints.includes(endpoint)) {
      continue;
    }
    
    
    // Check if the payload matches this format
    if (formatConfig.detector(payload)) {
      return {
        key: formatKey,
        ...formatConfig
      };
    } else {
      console.log(`- No match for ${formatKey}`);
    }
  }
  
  return null;
};

/**
 * Get available formats for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {Array} Array of format configurations
 */
const getAvailableFormats = (endpoint) => {
  return Object.entries(PAYLOAD_FORMATS)
    .filter(([key, config]) => config.endpoints.includes(endpoint))
    .map(([key, config]) => ({
      key,
      name: config.name,
      description: config.description
    }));
};

/**
 * Transformer factory - creates endpoint-specific transformers
 * @param {string} endpoint - The endpoint path
 * @returns {Function} Transformer function for the endpoint
 */
const createTransformerForEndpoint = (endpoint) => {
  return (payload) => {
    const detectedFormat = detectPayloadFormat(payload, endpoint);
    
    if (!detectedFormat) {
      const availableFormats = getAvailableFormats(endpoint);
      throw new Error(
        `Unsupported payload format for endpoint ${endpoint}. ` +
        `Supported formats: ${availableFormats.map(f => f.name).join(', ')}`
      );
    }
    
    if (!detectedFormat.transformer) {
      throw new Error(
        `Transformer not implemented for format: ${detectedFormat.name}`
      );
    }
    
    return detectedFormat.transformer(payload);
  };
};

module.exports = {
  PAYLOAD_FORMATS,
  detectPayloadFormat,
  getAvailableFormats,
  createTransformerForEndpoint,
  // Export specific transformers for direct use
  autoTransformCompleteMarketData,
  transformNSELivePrice
};
