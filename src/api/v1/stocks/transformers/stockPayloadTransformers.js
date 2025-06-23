/**
 * Stock Payload Transformers
 * Handles different payload formats for stock-related endpoints
 */

/**
 * Transforms NSE market data payload to complete-market-data format
 * @param {Object} payload - Original NSE payload
 * @returns {Object} Transformed payload matching the API schema
 */
const transformNSEMarketData = (payload) => {
  // Handle NSE format: { symbol, company, timestamp, source, data: { info, metadata, priceInfo, preOpenMarket, etc. } }
  if (payload.data && payload.data.info && payload.data.priceInfo) {
    const { data } = payload;
    console.log('----------------- Transforming NSE Market Data -----------------');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    return {
      stockInfo: {
        symbol: data.info.symbol || payload.symbol,
        company_name: data.info.companyName || payload.company,
        description: null,
        exchange_id: 1, // Default to NSE (assuming 1 is NSE ID)
        sector_detailed_id: null, // Will need mapping if needed
        currency_id: 1, // Default to INR
        isin: data.info.isin,
        face_value: data.securityInfo?.faceValue || null,
        issued_size: data.securityInfo?.issuedSize || null,
        listing_date: data.info.listingDate ? new Date(data.info.listingDate).toISOString() : null,
        is_fno_enabled: data.info.isFNOSec || false,
        is_cas_enabled: data.info.isCASec || false,
        is_slb_enabled: data.info.isSLBSec || false,
        is_debt_sec: data.info.isDebtSec || false,
        is_etf_sec: data.info.isETFSec || false,
        is_delisted: data.info.isDelisted || false,
        is_suspended: data.info.isSuspended || false,
        is_municipal_bond: data.info.isMunicipalBond || false,
        is_hybrid_symbol: data.info.isHybridSymbol || false,
        is_top10: data.info.isTop10 || false,
        identifier: data.info.identifier,
        trading_status: data.securityInfo?.tradingStatus || 'Active',
        trading_segment: data.securityInfo?.tradingSegment,
        board_status: data.securityInfo?.boardStatus,
        class_of_share: data.securityInfo?.classOfShare,
        derivatives_available: data.securityInfo?.derivatives === 'Yes',
        surveillance_stage: data.securityInfo?.surveillance?.surv,
        surveillance_description: data.securityInfo?.surveillance?.desc || null,
        tick_size: data.priceInfo?.tickSize,
        temp_suspended_series: data.info.tempSuspendedSeries || [],
        active_series: data.info.activeSeries || [],
        debt_series: data.info.debtSeries || [],
        is_active: !data.info.isDelisted && !data.info.isSuspended
      },
      
      priceInfo: {
        price_date: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
        open_price: data.priceInfo?.open,
        close_price: data.priceInfo?.close || data.priceInfo?.lastPrice,
        high_price: data.priceInfo?.intraDayHighLow?.max,
        low_price: data.priceInfo?.intraDayHighLow?.min,
        last_price: data.priceInfo?.lastPrice,
        previous_close: data.priceInfo?.previousClose,
        price_change: data.priceInfo?.change,
        price_change_percent: data.priceInfo?.pChange,
        vwap: data.priceInfo?.vwap,
        base_price: data.priceInfo?.basePrice,
        lower_circuit_price: parseFloat(data.priceInfo?.lowerCP?.replace(/,/g, '')),
        upper_circuit_price: parseFloat(data.priceInfo?.upperCP?.replace(/,/g, '')),
        intraday_min: data.priceInfo?.intraDayHighLow?.min,
        intraday_max: data.priceInfo?.intraDayHighLow?.max,
        week_52_high: data.priceInfo?.weekHighLow?.max,
        week_52_low: data.priceInfo?.weekHighLow?.min,
        week_52_high_date: data.priceInfo?.weekHighLow?.maxDate ? 
          new Date(data.priceInfo.weekHighLow.maxDate).toISOString() : null,
        week_52_low_date: data.priceInfo?.weekHighLow?.minDate ? 
          new Date(data.priceInfo.weekHighLow.minDate).toISOString() : null,
        session_type: 'Regular',
        market_type: data.currentMarketType,
        series: data.metadata?.series,
        price_band: data.priceInfo?.pPriceBand,
        volume: null, // Not available in current payload
        total_traded_value: null, // Not available in current payload
        total_traded_volume: data.preOpenMarket?.totalTradedVolume,
        data_source: payload.source || 'NSE'
      },
      
      preMarketData: data.preOpenMarket ? {
        trading_date: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
        session_start_time: null, // Not available in payload
        session_end_time: null, // Not available in payload
        iep: data.preOpenMarket.IEP,
        iep_change: data.preOpenMarket.Change,
        iep_change_percent: data.preOpenMarket.perChange,
        total_traded_volume: data.preOpenMarket.totalTradedVolume,
        total_traded_value: null, // Not available
        total_buy_quantity: data.preOpenMarket.totalBuyQuantity,
        total_sell_quantity: data.preOpenMarket.totalSellQuantity,
        ato_buy_qty: data.preOpenMarket.atoBuyQty,
        ato_sell_qty: data.preOpenMarket.atoSellQty,
        final_iep: data.preOpenMarket.finalPrice || null,
        final_iep_qty: data.preOpenMarket.finalQuantity || null,
        market_type: 'REGULAR',
        data_source: payload.source || 'NSE'
      } : null,
      
      preMarketOrders: data.preOpenMarket?.preopen ? 
        data.preOpenMarket.preopen.map((order, index) => ({
          order_type: order.buyQty > 0 ? 'BUY' : 'SELL',
          price: order.price,
          quantity: order.buyQty || order.sellQty,
          number_of_orders: 1,
          is_iep: order.iep || false,
          order_rank: index + 1,
          timestamp: data.preOpenMarket.lastUpdateTime ? 
            new Date(data.preOpenMarket.lastUpdateTime).toISOString() : null
        })) : [],
      
      valuationMetrics: data.metadata ? {
        metric_date: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
        sector_pe: data.metadata.pdSectorPe,
        symbol_pe: data.metadata.pdSymbolPe,
        data_source: payload.source || 'NSE',
        is_ttm: true
      } : null,
      
      indexMemberships: data.metadata?.pdSectorIndAll ? 
        data.metadata.pdSectorIndAll.map(indexName => ({
          index_name: indexName,
          index_code: indexName.replace(/\s+/g, '_').toUpperCase(),
          index_type: 'BROAD_MARKET', // Default, could be improved with mapping
          weightage: null,
          is_active: true
        })) : [],
      
      industryInfo: data.industryInfo ? {
        macro: data.industryInfo.macro,
        sector: data.industryInfo.sector,
        industry: data.industryInfo.industry,
        basicIndustry: data.industryInfo.basicIndustry
      } : null
    };
  }
  
  // If it's already in the expected format, return as is
  if (payload.stockInfo && payload.priceInfo) {
    return payload;
  }
  
  throw new Error('Unsupported payload format for complete-market-data endpoint');
};

/**
 * Auto-detect payload format and apply appropriate transformer
 * @param {Object} payload - Original payload
 * @returns {Object} Transformed payload
 */
const autoTransformCompleteMarketData = (payload) => {
  // NSE format detection
  if (payload.data && payload.data.info && payload.data.priceInfo) {
    return transformNSEMarketData(payload);
  }
  
  // Already in expected format
  if (payload.stockInfo && payload.priceInfo) {
    return payload;
  }
  
  // Add more format detectors here as needed
  // Example: Bloomberg format, Yahoo Finance format, etc.
  
  throw new Error('Unknown payload format - unable to auto-transform');
};

module.exports = {
  transformNSEMarketData,
  autoTransformCompleteMarketData
};
