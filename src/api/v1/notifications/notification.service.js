/**
 * Notification service - handles business logic for notification operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get notifications from alert history (simplified approach)
 * @param {Object} filter - Filter options (status, method)
 * @param {Object} options - Query options (pagination, sorting)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Paginated notifications with metadata
 */
const getNotifications = async (filter, options) => {
  const userId = filter.userId;
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions for alert history
  const whereConditions = { 
    userId 
  };
  
  // Add date filters if provided
  if (filter.from || filter.to) {
    whereConditions.triggeredAt = {};
    
    if (filter.from) {
      whereConditions.triggeredAt[Op.gte] = new Date(filter.from);
    }
    
    if (filter.to) {
      whereConditions.triggeredAt[Op.lte] = new Date(filter.to);
    }
  }

  // Execute query with includes for related data
  const { rows, count } = await db.AlertHistory.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'triggeredAt', sortOrder || 'DESC']],
    include: [
      { 
        model: db.Alert, 
        as: 'alert',
        include: [
          { model: db.Stock, as: 'stock' },
          { model: db.TriggerType, as: 'triggerType' },
          { model: db.ThresholdCondition, as: 'thresholdCondition' }
        ]
      },
      { model: db.Stock, as: 'stock' },
      { model: db.AlertStatus, as: 'status' }
    ]
  });

  // Transform alert history into notification format expected by frontend
  const notifications = rows.map(history => ({
    id: history.id,
    user_id: history.userId,
    alert_id: history.alertId,
    alert_history_id: history.id,
    subject: `${history.alert?.name || 'Stock Alert'} - ${history.stock?.symbol}`,
    message: formatAlertMessage(history),
    scheduled_time: history.triggeredAt,
    status: 'pending', // All alert history notifications are treated as pending
    method: 'push' // Default method for frontend
  }));

  // Return paginated result
  return {
    notifications: notifications,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Format alert message for notification display
 * @param {Object} history - AlertHistory record
 * @returns {string} Formatted message
 */
const formatAlertMessage = (history) => {
  const stock = history.stock || history.alert?.stock;
  const triggerValue = history.triggerValue;
  const alert = history.alert;
  
  if (!stock || !alert) {
    return 'Stock alert triggered';
  }
  
  const condition = alert.thresholdCondition?.name || 'crossed threshold';
  const threshold = alert.priceThreshold;
  
  return `${stock.symbol} price ${triggerValue} ${condition} threshold ${threshold}`;
};

/**
 * Acknowledge a notification (simplified for alert history)
 * @param {number} id - Alert History ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success response
 */
const acknowledgeNotification = async (id, userId) => {
  // Find alert history record by ID and userId
  const alertHistory = await db.AlertHistory.findOne({
    where: {
      id,
      userId
    }
  });

  if (!alertHistory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  // For the simplified system, we just mark it as acknowledged
  // In the future, we could add an acknowledged field to AlertHistory
  // For now, we'll just return success
  
  return {
    id: alertHistory.id,
    acknowledged: true,
    acknowledgedAt: new Date()
  };
};

/**
 * Process notification queue
 * This is used by the background job to send notifications
 * @returns {Promise<Object>} Processing results
 */
const processNotificationQueue = async () => {
  // Get pending notifications that are scheduled to be sent
  const pendingNotifications = await db.NotificationQueue.findAll({
    where: {
      status: 'pending',
      scheduledAt: {
        [Op.lte]: new Date()
      },
      attempts: {
        [Op.lt]: db.sequelize.col('maxAttempts')
      }
    },
    include: [
      { model: db.NotificationMethod, as: 'notificationMethod' },
      { model: db.User, as: 'user' },
      { model: db.Alert, as: 'alert', include: [{ model: db.Stock, as: 'stock' }] }
    ],
    order: [
      [db.sequelize.col('priority.level'), 'ASC'],
      ['scheduledAt', 'ASC']
    ],
    limit: 100 // Process in batches
  });

  const successfulNotifications = [];
  const failedNotifications = [];
  const processedCount = pendingNotifications.length;

  // Process each notification
  for (const notification of pendingNotifications) {
    try {
      // Update status to processing and increment attempt counter
      await notification.update({
        status: 'processing',
        attempts: notification.attempts + 1,
        lastAttemptAt: new Date()
      });

      // Send notification based on method
      const success = await sendNotification(notification);
      
      if (success) {
        // Update status to sent
        await notification.update({
          status: 'sent',
          sentAt: new Date()
        });
        
        successfulNotifications.push(notification);
      } else {
        // Update status back to pending for retry
        await notification.update({
          status: 'pending'
        });
        
        failedNotifications.push(notification);
      }
    } catch (error) {
      // Update status to failed if max attempts reached
      if (notification.attempts >= notification.maxAttempts) {
        await notification.update({
          status: 'failed',
          failureReason: error.message
        });
      } else {
        // Update status back to pending for retry
        await notification.update({
          status: 'pending'
        });
      }
      
      failedNotifications.push({
        notification,
        error: error.message
      });
    }
  }

  return {
    processedCount,
    successCount: successfulNotifications.length,
    failedCount: failedNotifications.length,
    successfulNotifications,
    failedNotifications
  };
};

/**
 * Send a notification based on its method
 * @param {Object} notification - Notification object with related data
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendNotification = async (notification) => {
  // Different logic based on notification method
  switch (notification.notificationMethod.name) {
    case 'email':
      return sendEmailNotification(notification);
    
    case 'sms':
      return sendSmsNotification(notification);
    
    case 'push':
      return sendPushNotification(notification);
    
    case 'webhook':
      return sendWebhookNotification(notification);
    
    default:
      throw new Error(`Unsupported notification method: ${notification.notificationMethod.name}`);
  }
};

/**
 * Send an email notification
 * @param {Object} notification - Email notification object
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendEmailNotification = async (notification) => {
  try {
    // Integration with email service would go here
    // This is a placeholder for actual email sending logic
    
    // Format subject and content
    const subject = `Stock Alert: ${notification.alert.name}`;
    
    // Log the notification
    console.log(`Email notification sent to ${notification.user.email}: ${subject}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

/**
 * Send an SMS notification
 * @param {Object} notification - SMS notification object
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendSmsNotification = async (notification) => {
  try {
    // Integration with SMS service would go here
    // This is a placeholder for actual SMS sending logic
    
    // Check if user has a phone number
    if (!notification.user.phoneNumber) {
      throw new Error('User does not have a phone number');
    }
    
    // Log the notification
    console.log(`SMS notification sent to ${notification.user.phoneNumber}: ${notification.content}`);
    
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};

/**
 * Send a push notification
 * @param {Object} notification - Push notification object
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendPushNotification = async (notification) => {
  try {
    // Integration with push notification service would go here
    // This is a placeholder for actual push notification sending logic
    
    // Check if user has a device token
    const userPreference = await db.UserPreference.findOne({
      where: { userId: notification.userId }
    });
    
    if (!userPreference || !userPreference.deviceToken) {
      throw new Error('User does not have a device token');
    }
    
    // Log the notification
    console.log(`Push notification sent to device ${userPreference.deviceToken}: ${notification.content}`);
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Send a webhook notification
 * @param {Object} notification - Webhook notification object
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendWebhookNotification = async (notification) => {
  try {
    // Integration with webhook service would go here
    // This is a placeholder for actual webhook sending logic
    
    // Check if user has a webhook URL
    const userPreference = await db.UserPreference.findOne({
      where: { userId: notification.userId }
    });
    
    if (!userPreference || !userPreference.webhookUrl) {
      throw new Error('User does not have a webhook URL');
    }
    
    // Log the notification
    console.log(`Webhook notification sent to ${userPreference.webhookUrl}: ${notification.content}`);
    
    return true;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return false;
  }
};

module.exports = {
  getNotifications,
  acknowledgeNotification,
  processNotificationQueue
};
