/**
 * Stock Alert Sample Stock Prices seeders
 */
'use strict';
const moment = require('moment');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if stock prices already exist to avoid duplicates
    const [priceResults] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_stock_prices');
    if (priceResults[0].count > 0) {
      console.log('Sample stock prices already exist, skipping seeder');
      return;
    }

    // Get stock IDs
    const stocks = await queryInterface.sequelize.query(
      'SELECT id, symbol FROM st_stocks',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Map stock symbols to their IDs
    const stockMap = {};
    stocks.forEach(stock => {
      stockMap[stock.symbol] = stock.id;
    });
    
    // Generate historical price data for the last 30 days
    const priceData = [];
    const symbols = Object.keys(stockMap);
    const today = moment().startOf('day');
    
    // Base prices for each stock (approximate current values in INR)
    const basePrices = {
      'RELIANCE': 2500.0,
      'TCS': 3800.0,
      'HDFCBANK': 1600.0,
      'INFY': 1450.0,
      'HINDUNILVR': 2700.0,
      'ICICIBANK': 1200.0,
      'BHARTIARTL': 950.0,
      'KOTAKBANK': 1800.0,
      'LT': 3200.0,
      'HCLTECH': 1250.0,
      'MARUTI': 10500.0,
      'SBIN': 820.0
    };
    
    // Generate 30 days of price data for each stock
    for (let symbol of symbols) {
      if (!basePrices[symbol]) continue; // Skip if no base price defined
      
      const basePrice = basePrices[symbol];
      const volatility = 0.02; // 2% daily volatility
      
      let currentPrice = basePrice;
      
      for (let i = 30; i >= 0; i--) {
        const date = moment(today).subtract(i, 'days');
        if (date.day() === 0 || date.day() === 6) continue; // Skip weekends
        
        // Generate random price movement (up to +/- volatility)
        const changePercent = (Math.random() - 0.5) * 2 * volatility;
        currentPrice = currentPrice * (1 + changePercent);
        
        // Calculate open, high, low based on close
        const openPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
        const highPrice = Math.max(openPrice, currentPrice) * (1 + Math.random() * 0.01);
        const lowPrice = Math.min(openPrice, currentPrice) * (1 - Math.random() * 0.01);
        
        // Generate random volume
        const volume = Math.floor(Math.random() * 10000000) + 1000000;
        
        priceData.push({
          stock_id: stockMap[symbol],
          price_date: date.format('YYYY-MM-DD'),
          open_price: parseFloat(openPrice.toFixed(2)),
          close_price: parseFloat(currentPrice.toFixed(2)),
          high_price: parseFloat(highPrice.toFixed(2)),
          low_price: parseFloat(lowPrice.toFixed(2)),
          adjusted_close: parseFloat(currentPrice.toFixed(2)),
          volume: volume,
          data_source: 'Seeder',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    
    // Insert all price data in batches of 100
    const batchSize = 100;
    for (let i = 0; i < priceData.length; i += batchSize) {
      const batch = priceData.slice(i, i + batchSize);
      await queryInterface.bulkInsert('st_stock_prices', batch);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_stock_prices', null, {});
  }
};
