/**
 * Bulk update stock live prices from NSE data
 * @param {Array} priceData - Array of price data objects
 * @param {string} priceDate - Date for the price data
 * @param {Object} marketData - Market metadata
 * @returns {Object} Results of the bulk update
 */
const { StatusCodes } = require('http-status-codes');
const db = require('../../../../database/models');
const ApiError = require('../../../../core/utils/ApiError');

const bulkUpdateLivePrices = async (priceData, priceDate, marketData = null) => {
  const results = {
    totalSubmitted: priceData.length,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: [],
    errors: [],
    marketDataProcessed: false,
    priceDate
  };

  // Get all unique symbols from the price data
  const symbols = [...new Set(priceData.map(item => item.symbol))];
  
  // Find all stocks by symbol
  const stocks = await db.Stock.findAll({
    where: {
      symbol: {
        [db.Sequelize.Op.in]: symbols
      }
    }
  });

  const symbolToIdMap = {};
  stocks.forEach(stock => {
    symbolToIdMap[stock.symbol] = stock.id;
  });

  // Process each price data item
  const priceRecords = [];

  for (const item of priceData) {
    try {
      const stockId = symbolToIdMap[item.symbol];

      if (!stockId) {
        results.skipped.push({
          symbol: item.symbol,
          reason: 'Stock not found in database'
        });
        continue;
      }

      // Convert NSE data to our stock price format
      const priceRecord = {
        stockId: stockId,
        priceDate: priceDate,
        openPrice: item.open || null,
        closePrice: item.lastPrice || null, // Use last price as close for intraday
        highPrice: item.dayHigh || null,
        lowPrice: item.dayLow || null,
        lastPrice: item.lastPrice || null,
        previousClose: item.previousClose || null,
        priceChange: item.change || null,
        priceChangePercent: item.pChange || null,
        volume: item.totalTradedVolume || null,
        // Enhanced fields for Indian market
        vwap: null, // Not in provided data
        basePrice: item.previousClose || null, // Default to previous close
        lowerCircuitPrice: null, // Not in provided data
        upperCircuitPrice: null, // Not in provided data
        weekHigh: item.yearHigh || null,
        weekLow: item.yearLow || null,
        weekHighDate: null, // Not in provided data
        weekLowDate: null, // Not in provided data
        sessionType: 'Regular',
        marketType: 'NM', // Normal Market
        series: item.series || 'EQ',
        priceBand: null, // Not in provided data
        dataSource: 'NSE_LIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Also update the stock's current price
      await db.Stock.update(
        { 
          currentPrice: item.lastPrice,
          updatedAt: new Date()
        },
        { 
          where: { id: stockId } 
        }
      );

      priceRecords.push(priceRecord);
      results.processed++;

    } catch (error) {
      console.error(`Error processing ${item.symbol}:`, error);
      results.errors.push({
        symbol: item.symbol,
        error: error.message
      });
    }
  }

  // Bulk upsert to database
  if (priceRecords.length > 0) {
    try {
      const bulkResult = await db.StockPrice.bulkCreate(priceRecords, {
        updateOnDuplicate: [
          'openPrice',
          'closePrice',
          'highPrice',
          'lowPrice',
          'lastPrice',
          'previousClose',
          'priceChange',
          'priceChangePercent',
          'volume',
          'vwap',
          'basePrice',
          'lowerCircuitPrice',
          'upperCircuitPrice',
          'weekHigh',
          'weekLow',
          'sessionType',
          'marketType',
          'series',
          'priceBand',
          'dataSource',
          'updatedAt'
        ],
        returning: true
      });

      // Count created vs updated (approximate)
      results.created = bulkResult.filter(record => record._isNewRecord).length;
      results.updated = bulkResult.length - results.created;
    } catch (error) {
      console.error('Bulk upsert error:', error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Error during bulk price update: ${error.message}`);
    }
  }

  // Process market data if available
  if (marketData) {
    try {
      // Store market status data in a separate table or cache
      // This is placeholder code - implement based on your actual market data model
      await db.MarketStatus.upsert({
        date: priceDate,
        advances: parseInt(marketData.advances, 10) || 0,
        declines: parseInt(marketData.declines, 10) || 0,
        unchanged: parseInt(marketData.unchanged, 10) || 0,
        marketStatus: marketData.marketStatus?.marketStatus || 'Unknown',
        lastUpdated: new Date(),
        rawData: JSON.stringify(marketData)
      });
      
      results.marketDataProcessed = true;
    } catch (error) {
      console.warn('Failed to process market data:', error);
      // Don't fail the entire operation for market data issues
    }
  }

  return results;
};

module.exports = bulkUpdateLivePrices;