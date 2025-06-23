/**
 * NSE Live Price Transformer
 * Transforms NSE Live Price data into StockPrice records for bulk updates
 */

/**
 * Parse NSE date string into ISO format date
 * @param {string} nseDate - Date in NSE format (e.g., "23-Jun-2025 11:10:43")
 * @returns {string} ISO date string
 */
const parseNSEDate = (nseDate) => {
  if (!nseDate) return null;
  
  try {
    // Handle DD-MMM-YYYY HH:MM:SS format (like "23-Jun-2025 11:10:43")
    if (nseDate.match(/^\d{1,2}-[A-Za-z]{3}-\d{4} \d{1,2}:\d{2}:\d{2}$/)) {
      const [datePart, timePart] = nseDate.split(' ');
      const [day, month, year] = datePart.split('-');
      const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const isoDateTime = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T${timePart}`;
      return new Date(isoDateTime).toISOString();
    }
    
    // Try parsing as is and convert to ISO
    return new Date(nseDate).toISOString();
  } catch (error) {
    console.warn(`Failed to convert NSE date "${nseDate}" to ISO format:`, error.message);
    return null;
  }
};

/**
 * Transform NSE live price payload to stock price update records
 * @param {Object} payload - NSE live price payload
 * @returns {Object} Transformed data for bulk price update
 */
const transformNSELivePrice = (payload) => {
  if (!payload || !payload.data || !Array.isArray(payload.data)) {
    throw new Error('Invalid NSE live price payload format');
  }
  
  const timestamp = payload.timestamp ? parseNSEDate(payload.timestamp) : new Date().toISOString();
  const priceDate = timestamp.split('T')[0]; // Extract the date portion
  
  // Process each stock in the data array
  const priceData = payload.data.map(stock => {
    // Skip non-stock entries (like indices) if they don't have a series
    if (!stock.series && stock.symbol === 'NIFTY 50') {
      return null;
    }
    
    return {
      symbol: stock.symbol,
      identifier: stock.identifier || null,
      open: typeof stock.open === 'number' ? stock.open : null,
      dayHigh: typeof stock.dayHigh === 'number' ? stock.dayHigh : null,
      dayLow: typeof stock.dayLow === 'number' ? stock.dayLow : null,
      lastPrice: typeof stock.lastPrice === 'number' ? stock.lastPrice : null,
      previousClose: typeof stock.previousClose === 'number' ? stock.previousClose : null,
      change: typeof stock.change === 'number' ? stock.change : null,
      pChange: typeof stock.pChange === 'number' ? stock.pChange : null,
      totalTradedVolume: typeof stock.totalTradedVolume === 'number' ? stock.totalTradedVolume : null,
      totalTradedValue: typeof stock.totalTradedValue === 'number' ? stock.totalTradedValue : null,
      lastUpdateTime: stock.lastUpdateTime ? parseNSEDate(stock.lastUpdateTime) : null,
      yearHigh: typeof stock.yearHigh === 'number' ? stock.yearHigh : null,
      yearLow: typeof stock.yearLow === 'number' ? stock.yearLow : null,
      nearWKH: typeof stock.nearWKH === 'number' ? stock.nearWKH : null,
      nearWKL: typeof stock.nearWKL === 'number' ? stock.nearWKL : null,
      perChange365d: typeof stock.perChange365d === 'number' ? stock.perChange365d : null,
      perChange30d: typeof stock.perChange30d === 'number' ? stock.perChange30d : null,
      series: stock.series || null,
      meta: stock.meta || null,
      // Pass through additional fields
      priority: typeof stock.priority === 'number' ? stock.priority : null,
      stockIndClosePrice: typeof stock.stockIndClosePrice === 'number' ? stock.stockIndClosePrice : null,
      ffmc: typeof stock.ffmc === 'number' ? stock.ffmc : null,
      date365dAgo: stock.date365dAgo || null,
      chart365dPath: stock.chart365dPath || null,
      date30dAgo: stock.date30dAgo || null,
      chart30dPath: stock.chart30dPath || null,
      chartTodayPath: stock.chartTodayPath || null
    };
  }).filter(Boolean); // Remove null entries
  
  return {
    priceData,
    priceDate,
    marketData: {
      name: payload.name,
      advances: payload.advance?.advances || "0",
      declines: payload.advance?.declines || "0",
      unchanged: payload.advance?.unchanged || "0",
      timestamp: payload.timestamp,
      metadata: payload.metadata || null,
      marketStatus: payload.marketStatus || null,
      // Pass through additional top-level fields
      date30dAgo: payload.date30dAgo || null,
      date365dAgo: payload.date365dAgo || null
    }
  };
};

module.exports = {
  transformNSELivePrice
};
