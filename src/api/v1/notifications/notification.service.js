/**
 * Notification service - handles business logic for notification operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get notifications with filtering
 * @param {Object} filter - Filter options (status, method)
 * @param {Object} options - Query options (pagination, sorting)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Paginated notifications with metadata
 */
const getNotifications = async (filter, options) => {
  const userId = filter.userId;
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = { 
    userId 
  };
  
  // Apply status filter if provided
  if (filter.status) {
    const notificationStatus = await db.NotificationStatus.findOne({
      where: { id: filter.status }
    });
    
    if (notificationStatus) {
      whereConditions.notificationStatusId = notificationStatus.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid notification status');
    }
  }
  
  // Apply method filter if provided
  if (filter.method) {
    const notificationMethod = await db.NotificationMethod.findOne({
      where: { id: filter.method }
    });
    
    if (notificationMethod) {
      whereConditions.notificationMethodId = notificationMethod.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid notification method');
    }
  }

  // Execute query with includes for related data
  const { rows, count } = await db.NotificationQueue.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'scheduledTime', sortOrder || 'DESC']],
    include: [
      { model: db.NotificationMethod, as: 'notificationMethod' },
      { model: db.NotificationStatus, as: 'notificationStatus' },
      { model: db.PriorityLevel, as: 'priority' },
      { model: db.Alert, as: 'alert', include: [{ model: db.Stock, as: 'stock' }] }
    ]
  });

  // Return paginated result
  return {
    notifications: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Acknowledge a notification
 * @param {number} id - Notification ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated notification
 */
const acknowledgeNotification = async (id, userId) => {
  // Find notification by ID and userId
  const notification = await db.NotificationQueue.findOne({
    where: {
      id,
      userId
    }
  });

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  // Update notification status to acknowledged
  await notification.update({
    status: 'acknowledged',
    acknowledgedAt: new Date()
  });

  // Get the updated notification with related data
  return db.NotificationQueue.findByPk(id, {
    include: [
      { model: db.NotificationMethod, as: 'notificationMethod' },
      { model: db.PriorityLevel, as: 'priority' },
      { model: db.Alert, as: 'alert', include: [{ model: db.Stock, as: 'stock' }] }
    ]
  });
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
