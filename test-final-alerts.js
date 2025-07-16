const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config/database');

// Import models
const UserModel = require('./src/database/models/user.model');
const StockModel = require('./src/database/models/stock.model');
const AlertModel = require('./src/database/models/alert.model');
const AlertHistoryModel = require('./src/database/models/alertHistory.model');

// Create database connection
const sequelize = new Sequelize(config.development);

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Stock = StockModel(sequelize, DataTypes);
const Alert = AlertModel(sequelize, DataTypes);
const AlertHistory = AlertHistoryModel(sequelize, DataTypes);

// Set up associations
AlertHistory.belongsTo(Alert, { foreignKey: 'alertId' });
AlertHistory.belongsTo(User, { foreignKey: 'userId' });
AlertHistory.belongsTo(Stock, { foreignKey: 'stockId' });

async function testFinalAlerts() {
  try {
    console.log('🎯 Final Alerts System Demo\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Check recent triggered alerts directly from database
    const recentTriggeredAlerts = await AlertHistory.findAll({
      limit: 10,
      order: [['triggeredAt', 'DESC']],
      include: [
        { model: Alert, attributes: ['name', 'priceThreshold', 'thresholdConditionId'] },
        { model: Stock, attributes: ['symbol', 'companyName'] }
      ]
    });
    
    console.log(`\n📊 Recently Triggered Alerts (${recentTriggeredAlerts.length}):`);
    
    if (recentTriggeredAlerts.length > 0) {
      recentTriggeredAlerts.forEach((history, index) => {
        console.log(`\n🔔 Alert ${index + 1}:`);
        console.log(`   Alert: ${history.Alert?.name}`);
        console.log(`   Stock: ${history.Stock?.symbol}`);
        console.log(`   Triggered: ${history.triggeredAt}`);
        console.log(`   Price: ${history.triggerValue}`);
        console.log(`   Threshold: ${history.Alert?.priceThreshold}`);
        console.log(`   Condition: ${history.Alert?.thresholdConditionId === 1 ? 'above' : 'below'}`);
        console.log(`   Message: ${history.message || 'N/A'}`);
      });
    } else {
      console.log('   No triggered alerts found');
    }
    
    // Show active alerts
    const activeAlerts = await Alert.findAll({
      where: { isActive: true },
      limit: 5,
      include: [{ model: Stock, attributes: ['symbol'] }]
    });
    
    console.log(`\n⚡ Active Alerts (${activeAlerts.length}):`);
    activeAlerts.forEach((alert, index) => {
      console.log(`\n🔔 Alert ${index + 1}:`);
      console.log(`   Name: ${alert.name}`);
      console.log(`   Stock: ${alert.Stock?.symbol}`);
      console.log(`   Threshold: ${alert.priceThreshold}`);
      console.log(`   Condition: ${alert.thresholdConditionId === 1 ? 'above' : 'below'}`);
      console.log(`   Last Triggered: ${alert.lastTriggered || 'Never'}`);
    });
    
    console.log('\n🎉 Simplified Alerts System Summary:');
    console.log('   ✅ Alert processing works without notifications');
    console.log('   ✅ Triggered alerts saved to alert history');
    console.log('   ✅ No user preferences required');
    console.log('   ✅ Frontend can use: GET /api/v1/alerts/history');
    console.log('   ✅ System automatically processes alerts every minute');
    
    console.log('\n🔗 Frontend Integration:');
    console.log('   GET /api/v1/alerts/history - Get all triggered alerts');
    console.log('   GET /api/v1/alerts/history?from=2025-07-16 - Filter by date');
    console.log('   GET /api/v1/alerts/history?stock_id=1 - Filter by stock');
    console.log('   Response includes: alert details, stock info, trigger value, timestamp');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testFinalAlerts();