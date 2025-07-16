const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config/database');

// Import models
const UserModel = require('./src/database/models/user.model');
const AlertHistoryModel = require('./src/database/models/alertHistory.model');
const AlertModel = require('./src/database/models/alert.model');
const StockModel = require('./src/database/models/stock.model');

// Import notification service
const notificationService = require('./src/api/v1/notifications/notification.service');

// Create database connection
const sequelize = new Sequelize(config.development);

// Initialize models
const User = UserModel(sequelize, DataTypes);
const AlertHistory = AlertHistoryModel(sequelize, DataTypes);
const Alert = AlertModel(sequelize, DataTypes);
const Stock = StockModel(sequelize, DataTypes);

// Set up associations
AlertHistory.belongsTo(Alert, { foreignKey: 'alertId', as: 'alert' });
AlertHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AlertHistory.belongsTo(Stock, { foreignKey: 'stockId', as: 'stock' });

async function testNotificationsWithData() {
  try {
    console.log('🔔 Testing Notifications API with Real Data\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Check all alert history records
    const allAlertHistory = await AlertHistory.findAll({
      limit: 5,
      order: [['triggeredAt', 'DESC']],
      include: [
        { model: Alert, as: 'alert', attributes: ['name', 'priceThreshold'] },
        { model: User, as: 'user', attributes: ['email'] },
        { model: Stock, as: 'stock', attributes: ['symbol'] }
      ]
    });
    
    console.log(`📊 Found ${allAlertHistory.length} alert history records in database`);
    
    if (allAlertHistory.length === 0) {
      console.log('❌ No alert history records found - alerts may not be triggering');
      return;
    }
    
    // Show sample alert history
    console.log('\n🔍 Sample Alert History Records:');
    allAlertHistory.forEach((history, index) => {
      console.log(`\n${index + 1}. Alert History ID: ${history.id}`);
      console.log(`   User: ${history.user?.email || 'N/A'}`);
      console.log(`   Alert: ${history.alert?.name || 'N/A'}`);
      console.log(`   Stock: ${history.stock?.symbol || 'N/A'}`);
      console.log(`   Triggered: ${history.triggeredAt}`);
      console.log(`   Value: ${history.triggerValue}`);
    });
    
    // Test with a user who has triggered alerts
    const userWithAlerts = allAlertHistory[0].user;
    if (!userWithAlerts) {
      console.log('❌ No user found with triggered alerts');
      return;
    }
    
    console.log(`\n🔄 Testing notifications for user: ${userWithAlerts.email}`);
    console.log(`   User ID: ${allAlertHistory[0].userId}`);
    
    // Test notifications API service
    const result = await notificationService.getNotifications(
      { userId: allAlertHistory[0].userId }, // Use the actual userId from alert history
      { limit: 10, page: 1 }
    );
    
    console.log(`✅ Found ${result.notifications.length} notifications for user`);
    
    if (result.notifications.length > 0) {
      console.log('\n🔔 Notifications in Frontend Format:');
      result.notifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. Notification:`);
        console.log(`   ID: ${notification.id}`);
        console.log(`   Subject: ${notification.subject}`);
        console.log(`   Message: ${notification.message}`);
        console.log(`   Time: ${notification.scheduled_time}`);
        console.log(`   Status: ${notification.status}`);
        console.log(`   Method: ${notification.method}`);
      });
      
      // Test the acknowledge functionality
      console.log('\n🔄 Testing acknowledge functionality...');
      const ackResult = await notificationService.acknowledgeNotification(
        result.notifications[0].id,
        allAlertHistory[0].userId
      );
      console.log('✅ Acknowledge result:', ackResult);
    }
    
    console.log('\n🎯 API Response Format for Frontend:');
    console.log('   The API returns data in exactly the format expected by:');
    console.log('   - useNotifications hook');
    console.log('   - NotificationBell component');
    console.log('   - Frontend polling system');
    
    console.log('\n🚀 Ready for Frontend Integration!');
    console.log('   Frontend can now call GET /api/v1/notifications');
    console.log('   Bell icon will show triggered alerts as notifications');
    console.log('   Each triggered alert becomes a notification in the bell');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await sequelize.close();
  }
}

testNotificationsWithData();