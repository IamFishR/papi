#!/usr/bin/env node

/**
 * Verify Restore Results
 * 
 * This script verifies that the restore process worked correctly
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/config');

const localConfig = {
  dialect: config.db.localDialect,
  host: config.db.localHost,
  port: config.db.localPort,
  database: config.db.localName,
  username: config.db.localUser,
  password: config.db.localPassword,
  logging: false
};

async function verifyRestore() {
  let localDb;
  
  try {
    console.log('🔍 Verifying restore results...');
    
    localDb = new Sequelize(localConfig);
    await localDb.authenticate();
    console.log('✅ Connected to local MySQL');
    
    // Check key tables
    const tables = [
      'st_stocks', 
      'st_stock_prices', 
      'st_trading_tickers', 
      'users', 
      'st_alerts',
      'st_alert_history',
      'user_custom_tags',
      'trade_journal_entries'
    ];
    
    console.log('\n📊 Table record counts:');
    for (const table of tables) {
      try {
        const [result] = await localDb.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: Error - ${error.message}`);
      }
    }
    
    // Show sample data
    console.log('\n🔍 Sample data verification:');
    
    try {
      const [stocks] = await localDb.query('SELECT id, symbol, company_name FROM st_stocks LIMIT 5');
      console.log('   Stocks:');
      stocks.forEach(stock => console.log(`     ${stock.id}: ${stock.symbol} - ${stock.company_name}`));
    } catch (error) {
      console.log('   Stocks: Error -', error.message);
    }
    
    try {
      const [prices] = await localDb.query('SELECT stock_id, priceDate, closePrice FROM st_stock_prices ORDER BY priceDate DESC LIMIT 3');
      console.log('   Recent stock prices:');
      prices.forEach(price => console.log(`     Stock ${price.stock_id}: ${price.priceDate} - $${price.closePrice}`));
    } catch (error) {
      console.log('   Stock prices: Error -', error.message);
    }
    
    try {
      const [tickers] = await localDb.query('SELECT stock_id, ltp, last_update_time FROM st_trading_tickers ORDER BY last_update_time DESC LIMIT 3');
      console.log('   Recent trading tickers:');
      tickers.forEach(ticker => console.log(`     Stock ${ticker.stock_id}: LTP ${ticker.ltp} at ${ticker.last_update_time}`));
    } catch (error) {
      console.log('   Trading tickers: Error -', error.message);
    }
    
    try {
      const [users] = await localDb.query('SELECT id, email, name FROM users');
      console.log('   Users:');
      users.forEach(user => console.log(`     ${user.id}: ${user.email} - ${user.name}`));
    } catch (error) {
      console.log('   Users: Error -', error.message);
    }
    
    console.log('\n✅ Verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    if (localDb) await localDb.close();
  }
}

// Run verification
if (require.main === module) {
  verifyRestore();
}

module.exports = { verifyRestore };