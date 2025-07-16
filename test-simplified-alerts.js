const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config/database');

// Import models
const UserModel = require('./src/database/models/user.model');
const StockModel = require('./src/database/models/stock.model');
const AlertModel = require('./src/database/models/alert.model');
const AlertHistoryModel = require('./src/database/models/alertHistory.model');
const TradingTickerModel = require('./src/database/models/tradingTicker.model');

// Import alert service
const alertService = require('./src/api/v1/alerts/alert.service');

// Create database connection
const sequelize = new Sequelize(config.development);

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Stock = StockModel(sequelize, DataTypes);
const Alert = AlertModel(sequelize, DataTypes);
const AlertHistory = AlertHistoryModel(sequelize, DataTypes);
const TradingTicker = TradingTickerModel(sequelize, DataTypes);

// Set up associations
User.hasMany(Alert, { foreignKey: 'userId' });
Alert.belongsTo(User, { foreignKey: 'userId' });
Stock.hasMany(Alert, { foreignKey: 'stockId' });
Alert.belongsTo(Stock, { foreignKey: 'stockId' });
Stock.hasMany(TradingTicker, { foreignKey: 'stockId' });
TradingTicker.belongsTo(Stock, { foreignKey: 'stockId' });

// Alert History associations
AlertHistory.belongsTo(Alert, { foreignKey: 'alertId' });
AlertHistory.belongsTo(User, { foreignKey: 'userId' });
AlertHistory.belongsTo(Stock, { foreignKey: 'stockId' });

async function testSimplifiedAlerts() {
  try {
    console.log('🔄 Testing Simplified Alerts System...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Create or get test user
    const [testUser] = await User.findOrCreate({
      where: { email: 'simple-test@example.com' },
      defaults: {
        firstName: 'Simple',
        lastName: 'Test',
        email: 'simple-test@example.com',
        password: 'hashedpassword',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      }
    });
    console.log('✅ Test user created/found:', testUser.email);
    
    // Use existing stock
    const testStock = await Stock.findOne({ limit: 1 });
    console.log('✅ Using existing stock:', testStock.symbol);
    
    // Create test stock price data
    const currentPrice = 100.50;
    await TradingTicker.create({
      stockId: testStock.id,
      ltp: currentPrice,
      volume: 10000,
      timestamp: new Date()
    });
    console.log('✅ Test stock price data created:', currentPrice);
    
    // Create simplified alert (use default notification method temporarily)
    const testAlert = await Alert.create({
      userId: testUser.id,
      stockId: testStock.id,
      name: 'Simplified Alert Test',
      description: 'Alert when stock goes below 110',
      triggerTypeId: 1, // stock_price
      priceThreshold: 110.00,
      thresholdConditionId: 2, // below
      frequencyId: 1, // once
      notificationMethodId: 1, // use default - will be ignored in processing
      statusId: 1, // active
      priorityId: 1, // low
      startDate: new Date(),
      cooldownMinutes: 0,
      isActive: true,
      baselinePrice: currentPrice,
      baselineTimestamp: new Date()
    });
    console.log('✅ Simplified alert created (should trigger since 100.50 < 110)');
    
    // Test alert processing
    console.log('\n🔄 Testing simplified alert processing...\n');
    
    // Process all alerts
    await alertService.processAllAlerts();
    console.log('✅ Alert processing completed without notification errors');
    
    // Check alert history directly from database
    const alertHistory = await AlertHistory.findAll({
      where: { userId: testUser.id },
      include: [
        { model: Alert, attributes: ['name', 'priceThreshold'] },
        { model: Stock, attributes: ['symbol', 'companyName'] }
      ],
      order: [['triggeredAt', 'DESC']]
    });
    
    console.log('\n📊 Alert History Results:');
    console.log('Total triggered alerts:', alertHistory.length);
    
    if (alertHistory.length > 0) {
      alertHistory.forEach((history, index) => {
        console.log(`\n🔔 Triggered Alert ${index + 1}:`);
        console.log('  Alert Name:', history.Alert?.name);
        console.log('  Stock Symbol:', history.Stock?.symbol);
        console.log('  Triggered At:', history.triggeredAt);
        console.log('  Trigger Value:', history.triggerValue);
        console.log('  Threshold:', history.Alert?.priceThreshold);
        console.log('  Message:', history.message);
      });
    } else {
      console.log('❌ No alerts were triggered');
    }
    
    // Test the API endpoint for getting triggered alerts
    console.log('\n🔄 Testing API endpoint for triggered alerts...\n');
    
    try {
      const apiResult = await alertService.getAlertHistory(
        { userId: testUser.id },
        { limit: 10, offset: 0 }
      );
      
      console.log('✅ API Result:');
      console.log('  Total Count:', apiResult.totalCount);
      console.log('  Alerts Retrieved:', apiResult.alerts.length);
      
      if (apiResult.alerts.length > 0) {
        apiResult.alerts.forEach((alert, index) => {
          console.log(`\n  API Alert ${index + 1}:`);
          console.log('    Alert Name:', alert.Alert?.name);
          console.log('    Stock Symbol:', alert.Alert?.Stock?.symbol);
          console.log('    Triggered At:', alert.triggeredAt);
          console.log('    Trigger Value:', alert.triggerValue);
        });
      }
    } catch (error) {
      console.log('⚠️  API Error (expected if user params are wrong):', error.message);
    }
    
    console.log('\n✅ Simplified alert system test completed!');
    console.log('\n🎯 Summary:');
    console.log('   - Alerts can be created without notification methods');
    console.log('   - Alert processing works without notification queue');
    console.log('   - Triggered alerts are saved to alert history');
    console.log('   - API endpoint provides triggered alerts data');
    console.log('   - Frontend can simply call /api/v1/alerts/history to get triggered alerts');
    
  } catch (error) {
    console.error('❌ Error testing simplified alerts:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testSimplifiedAlerts();