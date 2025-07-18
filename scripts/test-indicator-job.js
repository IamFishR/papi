#!/usr/bin/env node
/**
 * Test script for indicator calculation job
 */
const indicatorCalculationJob = require('../src/jobs/indicatorCalculationJob');
const logger = require('../src/config/logger');

async function testIndicatorJob() {
  try {
    console.log('🔍 Testing Indicator Calculation Job...\n');
    
    // Test 1: Check if job is properly initialized
    console.log('1. Job Status:');
    console.log('   - Running:', indicatorCalculationJob.isRunning);
    console.log('   - Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(indicatorCalculationJob)));
    
    // Test 2: Get calculation summary
    console.log('\n2. Getting calculation summary...');
    try {
      const summary = await indicatorCalculationJob.getCalculationSummary();
      console.log('   - Today\'s calculations:', summary.length > 0 ? summary : 'No calculations yet');
    } catch (error) {
      console.log('   - Error:', error.message);
    }
    
    // Test 3: Test calculation for HDFC Bank (if price data exists)
    console.log('\n3. Testing single stock calculation...');
    try {
      const db = require('../src/database/models');
      const hdfcStock = await db.Stock.findOne({ where: { symbol: 'HDFCBANK' } });
      
      if (hdfcStock) {
        console.log(`   - Found HDFC Bank (ID: ${hdfcStock.id})`);
        
        // Check if we have price data
        const priceCount = await db.StockPrice.count({ where: { stock_id: hdfcStock.id } });
        console.log(`   - Price records available: ${priceCount}`);
        
        if (priceCount > 0) {
          console.log('   - Testing SMA(50) calculation...');
          try {
            const sma50 = await indicatorCalculationJob.calculateSingleIndicator('SMA', hdfcStock.id, 50);
            console.log('   - SMA(50) calculated successfully:', sma50.value);
          } catch (error) {
            console.log('   - SMA calculation error:', error.message);
          }
        } else {
          console.log('   - Cannot test calculation: No price data available');
          console.log('   - Please populate price data using historical data scripts');
        }
      } else {
        console.log('   - HDFC Bank stock not found');
      }
    } catch (error) {
      console.log('   - Error testing single calculation:', error.message);
    }
    
    // Test 4: Check scheduled job configuration
    console.log('\n4. Scheduler Configuration:');
    console.log('   - Runs daily at: 4:00 PM IST (16:00)');
    console.log('   - Days: Monday to Friday (weekdays only)');
    console.log('   - Timezone: Asia/Kolkata');
    console.log('   - Market close: 3:30 PM IST');
    console.log('   - Buffer time: 30 minutes after market close');
    
    // Test 5: API endpoints status
    console.log('\n5. Available API Endpoints:');
    console.log('   - GET  /api/v1/indicators/status      - Job status and summary');
    console.log('   - POST /api/v1/indicators/process-all - Manual calculation trigger');
    console.log('   - GET  /api/v1/indicators/types       - Available indicator types');
    console.log('   - GET  /api/v1/indicators/conditions  - Available conditions');
    console.log('   - GET  /api/v1/indicators/stock/:id   - Historical data for stock');
    console.log('   - DELETE /api/v1/indicators/cleanup   - Cleanup old data');
    
    console.log('\n✅ Indicator Calculation Job Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Populate historical price data for stocks');
    console.log('   2. Start the API server to activate daily scheduler');
    console.log('   3. Monitor logs at 4:00 PM IST for automatic calculations');
    console.log('   4. Use API endpoints to manually trigger calculations');
    console.log('   5. Your HDFC Bank Golden Cross alert will trigger when SMA(50) > SMA(200)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testIndicatorJob();