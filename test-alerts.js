const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config/database');

// Import models
const UserModel = require('./src/database/models/user.model');
const StockModel = require('./src/database/models/stock.model');
const AlertModel = require('./src/database/models/alert.model');
const TradingTickerModel = require('./src/database/models/tradingTicker.model');

// Import alert service
const alertService = require('./src/api/v1/alerts/alert.service');

// Create database connection
const sequelize = new Sequelize(config.development);

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Stock = StockModel(sequelize, DataTypes);
const Alert = AlertModel(sequelize, DataTypes);
const TradingTicker = TradingTickerModel(sequelize, DataTypes);

// Set up associations
User.hasMany(Alert, { foreignKey: 'userId' });
Alert.belongsTo(User, { foreignKey: 'userId' });
Stock.hasMany(Alert, { foreignKey: 'stockId' });
Alert.belongsTo(Stock, { foreignKey: 'stockId' });
Stock.hasMany(TradingTicker, { foreignKey: 'stockId' });
TradingTicker.belongsTo(Stock, { foreignKey: 'stockId' });

async function testAlertsSystem() {
  try {
    console.log('🔄 Testing Alerts System...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Create or get test user
    const [testUser] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Test user created/found:', testUser.email);
    
    // Use existing stock from database or create a simple one
    let testStock = await Stock.findOne({ limit: 1 });
    
    if (!testStock) {
      // If no stocks exist, create a minimal one
      testStock = await Stock.create({
        symbol: 'TESTSTOCK',
        companyName: 'Test Stock Company',
        exchangeId: 1, // Assuming NSE has ID 1
        currencyId: 1, // Assuming INR has ID 1
        isin: 'INE123456789',
        isActive: true
      });
      console.log('✅ Test stock created:', testStock.symbol);
    } else {
      console.log('✅ Using existing stock:', testStock.symbol);
    }
    
    // Create test stock price data
    const currentPrice = 100.50;
    await TradingTicker.create({
      stockId: testStock.id,
      ltp: currentPrice,
      volume: 10000,
      timestamp: new Date()
    });
    console.log('✅ Test stock price data created:', currentPrice);
    
    // Create test alert data with all required fields
    const testAlert1 = await Alert.create({
      userId: testUser.id,
      stockId: testStock.id,
      name: 'Test Alert - Above Current Price',
      description: 'Alert when stock goes above 150',
      triggerTypeId: 1, // stock_price
      priceThreshold: 150.00,
      thresholdConditionId: 1, // above
      frequencyId: 1, // once
      notificationMethodId: 1, // email
      statusId: 1, // active
      priorityId: 1, // low
      startDate: new Date(),
      cooldownMinutes: 0,
      isActive: true,
      baselinePrice: currentPrice,
      baselineTimestamp: new Date()
    });
    console.log('✅ Test Alert 1 created - Above current price (should NOT trigger)');
    
    // Create test alert - Price below current price (should trigger)
    const testAlert2 = await Alert.create({
      userId: testUser.id,
      stockId: testStock.id,
      name: 'Test Alert - Below Current Price',
      description: 'Alert when stock goes below 50',
      triggerTypeId: 1, // stock_price
      priceThreshold: 50.00,
      thresholdConditionId: 2, // below
      frequencyId: 1, // once
      notificationMethodId: 1, // email
      statusId: 1, // active
      priorityId: 1, // low
      startDate: new Date(),
      cooldownMinutes: 0,
      isActive: true,
      baselinePrice: currentPrice,
      baselineTimestamp: new Date()
    });
    console.log('✅ Test Alert 2 created - Below current price (should trigger)');
    
    // Test alert processing
    console.log('\n🔄 Testing alert processing...\n');
    
    // Process all alerts
    await alertService.processAllAlerts();
    
    // Check alert history
    try {
      const alertHistory = await alertService.getAlertHistory(
        { userId: testUser.id },
        { limit: 10, offset: 0 }
      );
      
      console.log('📊 Alert History Results:');
      console.log('Total alerts in history:', alertHistory.alerts.length);
      
      if (alertHistory.alerts.length > 0) {
        alertHistory.alerts.forEach((history, index) => {
          console.log(`\n🔔 Alert ${index + 1}:`);
          console.log('  Alert Name:', history.Alert?.name);
          console.log('  Stock Symbol:', history.Alert?.Stock?.symbol);
          console.log('  Triggered At:', history.triggeredAt);
          console.log('  Trigger Price:', history.triggerPrice);
          console.log('  Threshold:', history.Alert?.priceThreshold);
          console.log('  Condition:', history.Alert?.thresholdConditionId === 1 ? 'above' : 'below');
        });
      } else {
        console.log('❌ No alerts were triggered');
      }
    } catch (error) {
      console.log('⚠️  Error checking alert history:', error.message);
    }
    
    // Check current alert statuses
    const currentAlerts = await Alert.findAll({
      where: { userId: testUser.id },
      include: [{ model: Stock, attributes: ['symbol', 'companyName'] }]
    });
    
    console.log('\n📋 Current Alert Status:');
    currentAlerts.forEach((alert, index) => {
      console.log(`\n🔔 Alert ${index + 1}:`);
      console.log('  Name:', alert.name);
      console.log('  Stock:', alert.Stock?.symbol);
      console.log('  Threshold:', alert.priceThreshold);
      console.log('  Condition:', alert.thresholdConditionId === 1 ? 'above' : 'below');
      console.log('  Active:', alert.isActive);
      console.log('  Last Triggered:', alert.lastTriggered || 'Never');
    });
    
    console.log('\n✅ Alert system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing alerts system:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testAlertsSystem();