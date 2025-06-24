/**
 * NSE Ticker Data Transformer
 * Transforms NIFTY 50 live ticker data payload to our ticker table format
 */

/**
 * Convert NSE timestamp to ISO format
 * @param {string} nseTimestamp - NSE timestamp format (DD-MMM-YYYY HH:MM:SS)
 * @returns {string|null} ISO timestamp string or null
 */
const convertNSETimestampToISO = (nseTimestamp) => {
  if (!nseTimestamp) return null;
  
  try {
    // Handle format: "23-Jun-2025 11:57:37"
    if (nseTimestamp.match(/^\d{1,2}-[A-Za-z]{3}-\d{4} \d{1,2}:\d{2}:\d{2}$/)) {
      const [datePart, timePart] = nseTimestamp.split(' ');
      const [day, month, year] = datePart.split('-');
      const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const isoDateTime = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T${timePart}.000Z`;
      return new Date(isoDateTime).toISOString();
    }
    
    // Try parsing as is
    return new Date(nseTimestamp).toISOString();
  } catch (error) {
    console.warn(`Failed to convert NSE timestamp "${nseTimestamp}" to ISO format:`, error.message);
    return new Date().toISOString(); // Fallback to current time
  }
};

/**
 * Parse numeric value from string or number
 * @param {string|number} value - Value to parse
 * @returns {number|null} Parsed number or null
 */
const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

/**
 * Parse integer value from string or number
 * @param {string|number} value - Value to parse
 * @returns {number|null} Parsed integer or null
 */
const parseIntegerValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/,/g, ''));
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

/**
 * Transform individual ticker item to our ticker table format
 * @param {Object} tickerItem - Individual ticker data from NSE
 * @returns {Object} Transformed ticker data
 */
const transformTickerItem = (tickerItem) => {
  const lastUpdateTime = convertNSETimestampToISO(tickerItem.lastUpdateTime);
  
  return {
    symbol: tickerItem.symbol,
    identifier: tickerItem.identifier || null,
    // Core Real-time Price Data
    ltp: parseNumericValue(tickerItem.lastPrice),
    openPrice: parseNumericValue(tickerItem.open),
    highPrice: parseNumericValue(tickerItem.dayHigh),
    lowPrice: parseNumericValue(tickerItem.dayLow),
    previousClose: parseNumericValue(tickerItem.previousClose),
    // Change Metrics
    priceChange: parseNumericValue(tickerItem.change),
    priceChangePercent: parseNumericValue(tickerItem.pChange),
    // Volume Data
    volume: parseIntegerValue(tickerItem.totalTradedVolume) || 0,
    totalTrades: null, // Not provided in this format
    vwap: null, // Not provided in this format
    // Circuit Limits - not provided in this format, set to null
    upperCircuitPrice: null,
    lowerCircuitPrice: null,
    // Order Book (L1 data) - not provided in this format
    bidPrice: null,
    bidQty: null,
    askPrice: null,
    askQty: null,
    // Trading Status
    isTradable: true, // Assume tradable if data is present
    marketSession: 'REGULAR', // Default to regular session
    // Update tracking
    lastUpdateTime: lastUpdateTime,
    // Additional NSE specific data for reference
    meta: {
      priority: tickerItem.priority,
      yearHigh: parseNumericValue(tickerItem.yearHigh),
      yearLow: parseNumericValue(tickerItem.yearLow),
      totalTradedValue: parseNumericValue(tickerItem.totalTradedValue),
      ffmc: parseNumericValue(tickerItem.ffmc),
      nearWKH: parseNumericValue(tickerItem.nearWKH),
      nearWKL: parseNumericValue(tickerItem.nearWKL),
      perChange365d: parseNumericValue(tickerItem.perChange365d),
      perChange30d: parseNumericValue(tickerItem.perChange30d),
      series: tickerItem.series || null,
      stockIndClosePrice: parseNumericValue(tickerItem.stockIndClosePrice),
      companyInfo: tickerItem.meta ? {
        companyName: tickerItem.meta.companyName,
        industry: tickerItem.meta.industry,
        isin: tickerItem.meta.isin,
        listingDate: tickerItem.meta.listingDate,
        isFNOSec: tickerItem.meta.isFNOSec,
        isCASec: tickerItem.meta.isCASec,
        isSLBSec: tickerItem.meta.isSLBSec,
        isDebtSec: tickerItem.meta.isDebtSec,
        isETFSec: tickerItem.meta.isETFSec,
        isDelisted: tickerItem.meta.isDelisted,
        isSuspended: tickerItem.meta.isSuspended,
        activeSeries: tickerItem.meta.activeSeries,
        debtSeries: tickerItem.meta.debtSeries,
        tempSuspendedSeries: tickerItem.meta.tempSuspendedSeries
      } : null
    }
  };
};

/**
 * Transform NSE ticker data payload to our expected format
 * @param {Object} payload - NSE ticker payload
 * @returns {Object} Transformed payload for ticker operations
 */
const transformNSETickerData = (payload) => {
  
  try {
    // Filter out indices (like NIFTY 50) and only process individual stocks
    const stockItems = payload.data.filter(item => {
      // Skip if it's an index (priority 1 typically indicates index)
      if (item.priority === 1 && item.symbol.includes('NIFTY')) {
        return false;
      }
      // Ensure we have essential price data
      return item.symbol && item.lastPrice !== undefined && item.lastPrice !== null;
    });
    
    console.log(`Filtered ${stockItems.length} stock items from ${payload.data.length} total items`);
    
    // Transform each stock item
    const tickerData = stockItems.map(transformTickerItem);
    
    // Create the transformed payload
    const result = {
      tickerData: tickerData,
      marketContext: {
        name: payload.name,
        timestamp: convertNSETimestampToISO(payload.timestamp),
        advance: payload.advance ? {
          advances: parseIntegerValue(payload.advance.advances),
          declines: parseIntegerValue(payload.advance.declines),
          unchanged: parseIntegerValue(payload.advance.unchanged)
        } : null,
        metadata: payload.metadata || null,
        marketStatus: payload.marketStatus || null,
        date30dAgo: payload.date30dAgo || null,
        date365dAgo: payload.date365dAgo || null
      }
    };
    return result;
    
  } catch (error) {
    console.error('NSE Ticker Transformer Error:', error);
    throw new Error(`Failed to transform NSE ticker data: ${error.message}`);
  }
};

module.exports = {
  transformNSETickerData,
  transformTickerItem,
  convertNSETimestampToISO,
  parseNumericValue,
  parseIntegerValue
};