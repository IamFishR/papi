/**
 * Alert service - handles business logic for alert operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');
const logger = require('../../../config/logger');

/**
 * Get alerts with filtering options
 * @param {Object} filter - Filter options (active, type)
 * @param {Object} options - Query options (pagination, sorting)
 * @param {string} userId - User ID who owns the alerts
 * @returns {Promise<Object>} Paginated alerts list with metadata
 */
const getAlerts = async (filter, options, userId) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = { 
    userId 
  };
  
  // Apply active filter if provided
  if (filter.active !== undefined) {
    whereConditions.isActive = filter.active === 'true';
  }
  
  // Apply trigger type filter if provided
  if (filter.type) {
    const triggerType = await db.TriggerType.findOne({
      where: { name: filter.type }
    });
    
    if (triggerType) {
      whereConditions.triggerTypeId = triggerType.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid trigger type');
    }
  }

  // Execute query with includes for related data
  const { rows, count } = await db.Alert.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'created_at', sortOrder || 'DESC']],
    include: [
      { model: db.Stock, as: 'stock', attributes: ['id', 'symbol', 'companyName'] },
      { model: db.TriggerType, as: 'triggerType' },
      { model: db.ThresholdCondition, as: 'thresholdCondition' },
      { model: db.VolumeCondition, as: 'volumeCondition' },
      { model: db.IndicatorType, as: 'indicatorType' },
      { model: db.IndicatorCondition, as: 'indicatorCondition' },
      { model: db.SentimentType, as: 'sentimentType' },
      { model: db.AlertFrequency, as: 'frequency' },
      { model: db.ConditionLogicType, as: 'conditionLogic' }
    ]
  });

  // Return paginated result
  return {
    results: rows,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit
  };
};

/**
 * Get alert by ID
 * @param {number} id - Alert ID
 * @param {string} userId - User ID who owns the alert
 * @returns {Promise<Object>} Alert with related data
 */
const getAlertById = async (id, userId) => {
  const alert = await db.Alert.findOne({
    where: {
      id,
      userId
    },
    include: [
      { model: db.Stock, as: 'stock', attributes: ['id', 'symbol', 'companyName'] },
      { model: db.TriggerType, as: 'triggerType' },
      { model: db.ThresholdCondition, as: 'thresholdCondition' },
      { model: db.VolumeCondition, as: 'volumeCondition' },
      { model: db.IndicatorType, as: 'indicatorType' },
      { model: db.IndicatorCondition, as: 'indicatorCondition' },
      { model: db.SentimentType, as: 'sentimentType' },
      { model: db.AlertFrequency, as: 'frequency' },
      { model: db.ConditionLogicType, as: 'conditionLogic' }
    ]
  });

  if (!alert) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Alert not found');
  }

  return alert;
};

/**
 * Create a new alert
 * @param {Object} alertData - Alert data
 * @param {string} userId - User ID who will own the alert
 * @returns {Promise<Object>} Created alert
 */
const createAlert = async (alertData, userId) => {
  // Validate userId is provided
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User ID is required for alert creation');
  }

  // Verify stock exists if stockId is provided
  if (alertData.stockId) {
    const stock = await db.Stock.findByPk(alertData.stockId);
    
    if (!stock) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid stock ID');
    }
  }

  // Get baseline price for forward-looking alerts
  let baselinePrice = null;
  let baselineTimestamp = null;
  
  if (alertData.stockId) {
    const latestPrice = await db.StockPrice.findOne({
      where: { stockId: alertData.stockId },
      order: [['created_at', 'DESC']]
    });
    
    if (latestPrice) {
      baselinePrice = latestPrice.price;
      baselineTimestamp = latestPrice.created_at;
    }
  }

  // Add userId and set default values for required fields
  const alertWithUserId = {
    ...alertData,
    userId,
    baselinePrice,
    baselineTimestamp,
    // Set default values for required fields if not provided
    notificationMethodId: alertData.notificationMethodId || 1, // Default to first notification method
    statusId: alertData.statusId || 1, // Default to active status
    priorityId: alertData.priorityId || 2, // Default to medium priority
    startDate: alertData.startDate || new Date(), // Default to current date
    marketHoursOnly: alertData.marketHoursOnly !== undefined ? alertData.marketHoursOnly : true,
    volumeConfirmation: alertData.volumeConfirmation || false,
  };

  // Create alert
  const alert = await db.Alert.create(alertWithUserId);

  // Get the created alert with related data
  return getAlertById(alert.id, userId);
};

/**
 * Update an existing alert
 * @param {number} id - Alert ID
 * @param {Object} alertData - Updated alert data
 * @param {string} userId - User ID who owns the alert
 * @returns {Promise<Object>} Updated alert
 */
const updateAlert = async (id, alertData, userId) => {
  // Find alert by ID and userId
  const alert = await db.Alert.findOne({
    where: {
      id,
      userId
    }
  });

  if (!alert) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Alert not found');
  }

  // Verify stock exists if stockId is provided
  if (alertData.stockId) {
    const stock = await db.Stock.findByPk(alertData.stockId);
    
    if (!stock) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid stock ID');
    }
  }

  // Update alert
  await alert.update(alertData);

  // Get the updated alert with related data
  return getAlertById(id, userId);
};

/**
 * Delete an alert
 * @param {number} id - Alert ID
 * @param {string} userId - User ID who owns the alert
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteAlert = async (id, userId) => {
  // Find alert by ID and userId
  const alert = await db.Alert.findOne({
    where: {
      id,
      userId
    }
  });

  if (!alert) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Alert not found');
  }

  // Delete alert
  await alert.destroy();

  return true;
};

/**
 * Get alert history with filtering
 * @param {Object} filter - Filter options (from, to)
 * @param {Object} options - Query options (pagination, sorting)
 * @param {string} userId - User ID who owns the alerts
 * @returns {Promise<Object>} Paginated alert history with metadata
 */
const getAlertHistory = async (filter, options, userId) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = { 
    userId 
  };
  
  // Add date range filtering if provided
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
    order: [[sortBy || 'triggered_at', sortOrder || 'DESC']],
    include: [
      { 
        model: db.Alert, 
        as: 'alert',
        include: [
          { model: db.TriggerType, as: 'triggerType' }
        ]
      },
      { model: db.Stock, as: 'stock', attributes: ['id', 'symbol', 'companyName'] }
    ]
  });

  // Return paginated result
  return {
    results: rows,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit
  };
};

/**
 * Process alerts based on current market data
 * This is used by the background job to check alert conditions
 * @returns {Promise<Object>} Processing results
 */
const processAlerts = async () => {
  // Get all active alerts
  const alerts = await db.Alert.findAll({
    where: { isActive: true },
    include: [
      { model: db.Stock, as: 'stock', attributes: ['id', 'symbol', 'companyName'] },
      { model: db.TriggerType, as: 'triggerType' },
      { model: db.ThresholdCondition, as: 'thresholdCondition' },
      { model: db.VolumeCondition, as: 'volumeCondition' },
      { model: db.IndicatorType, as: 'indicatorType' },
      { model: db.IndicatorCondition, as: 'indicatorCondition' },
      { model: db.SentimentType, as: 'sentimentType' }
    ]
  });

  const triggeredAlerts = [];
  const failedAlerts = [];
  const processedCount = alerts.length;

  // Process each alert
  for (const alert of alerts) {
    try {
      const isTriggered = await checkAlertConditions(alert);
      
      if (isTriggered) {
        // Record alert history
        await createAlertHistory(alert);
        
        // Queue notification
        await queueAlertNotification(alert);
        
        // Update last triggered time
        await alert.update({
          lastTriggered: new Date()
        });
        
        triggeredAlerts.push(alert);
      }
    } catch (error) {
      failedAlerts.push({
        alert,
        error: error.message
      });
    }
  }

  return {
    processedCount,
    triggeredCount: triggeredAlerts.length,
    failedCount: failedAlerts.length,
    triggeredAlerts,
    failedAlerts
  };
};

/**
 * Check if an alert's conditions are met
 * @param {Object} alert - Alert object with related data
 * @returns {Promise<boolean} True if alert conditions are met
 */
const checkAlertConditions = async (alert) => {
  // Different logic based on trigger type
  switch (alert.triggerType.name) {
    case 'stock_price':
      return checkPriceAlertConditions(alert);
    
    case 'volume':
      return checkVolumeAlertConditions(alert);
    
    case 'technical_indicator':
      return checkIndicatorAlertConditions(alert);
    
    case 'news':
      return checkNewsAlertConditions(alert);
    
    default:
      throw new Error(`Unsupported alert trigger type: ${alert.triggerType.name}`);
  }
};

/**
 * Check price alert conditions with forward-looking logic
 * @param {Object} alert - Price alert object
 * @returns {Promise<boolean>} True if price conditions are met
 */
const checkPriceAlertConditions = async (alert) => {
  // Check cooldown period first
  if (alert.lastTriggered && alert.cooldownMinutes) {
    const timeSinceLastTrigger = Date.now() - new Date(alert.lastTriggered).getTime();
    const cooldownMs = alert.cooldownMinutes * 60 * 1000;
    
    if (timeSinceLastTrigger < cooldownMs) {
      return false; // Still in cooldown period
    }
  }

  // Market hours check
  if (alert.marketHoursOnly && !isMarketHours()) {
    return false;
  }

  // Get latest stock price (only data after alert creation)
  const latestPrice = await db.StockPrice.findOne({
    where: { 
      stockId: alert.stockId,
      // Only check prices after the alert baseline timestamp
      ...(alert.baselineTimestamp && {
        created_at: { [Op.gte]: alert.baselineTimestamp }
      })
    },
    order: [['created_at', 'DESC']]
  });
  
  if (!latestPrice) {
    return false;
  }

  // Volume confirmation if required
  if (alert.volumeConfirmation && latestPrice.volume) {
    const avgVolume = await getAverageVolume(alert.stockId, 30); // 30-day average
    if (latestPrice.volume < avgVolume * 1.5) {
      return false; // Volume too low to confirm movement
    }
  }

  const currentPrice = latestPrice.price;
  const threshold = alert.priceThreshold;
  const baselinePrice = alert.baselinePrice;
  
  switch (alert.thresholdCondition.name) {
    case 'above':
      return currentPrice > threshold;
    
    case 'below':
      return currentPrice < threshold;
    
    case 'crosses_above':
      // Forward-looking: only trigger if baseline was below threshold and current is above
      if (!baselinePrice) {
        return false; // No baseline to compare
      }
      const wasBelow = baselinePrice <= threshold;
      const isNowAbove = currentPrice > threshold;
      return wasBelow && isNowAbove;
    
    case 'crosses_below':
      // Forward-looking: only trigger if baseline was above threshold and current is below
      if (!baselinePrice) {
        return false; // No baseline to compare
      }
      const wasAbove = baselinePrice >= threshold;
      const isNowBelow = currentPrice < threshold;
      return wasAbove && isNowBelow;
    
    default:
      throw new Error(`Unsupported threshold condition: ${alert.thresholdCondition.name}`);
  }
};

/**
 * Check if current time is within market hours
 * @returns {boolean} True if within market hours
 */
const isMarketHours = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Skip weekends
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours 9:15 AM to 3:30 PM IST
  const marketStartHour = parseInt(process.env.MARKET_START_HOUR || '9');
  const marketStartMinute = parseInt(process.env.MARKET_START_MINUTE || '15');
  const marketEndHour = parseInt(process.env.MARKET_END_HOUR || '15');
  const marketEndMinute = parseInt(process.env.MARKET_END_MINUTE || '30');
  
  const currentTime = hour * 60 + minute;
  const marketStart = marketStartHour * 60 + marketStartMinute;
  const marketEnd = marketEndHour * 60 + marketEndMinute;
  
  return currentTime >= marketStart && currentTime <= marketEnd;
};

/**
 * Get average volume for a stock over specified days
 * @param {number} stockId - Stock ID
 * @param {number} days - Number of days to average
 * @returns {Promise<number>} Average volume
 */
const getAverageVolume = async (stockId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const historicalPrices = await db.StockPrice.findAll({
    where: {
      stockId,
      created_at: { [Op.gte]: startDate }
    },
    attributes: ['volume']
  });
  
  if (historicalPrices.length === 0) {
    return 0;
  }
  
  const totalVolume = historicalPrices.reduce((sum, price) => sum + (price.volume || 0), 0);
  return totalVolume / historicalPrices.length;
};

/**
 * Check volume alert conditions
 * @param {Object} alert - Volume alert object
 * @returns {Promise<boolean>} True if volume conditions are met
 */
const checkVolumeAlertConditions = async (alert) => {
  // Get latest stock volume
  const latestPrice = await db.StockPrice.findOne({
    where: { stockId: alert.stockId },
    order: [['created_at', 'DESC']]
  });
  
  if (!latestPrice || !latestPrice.volume) {
    return false;
  }

  // For average volume comparison, get historical data
  const historicalPrices = await db.StockPrice.findAll({
    where: { 
      stockId: alert.stockId,
      created_at: { 
        [Op.lt]: latestPrice.created_at,
        [Op.gte]: new Date(latestPrice.created_at - 30 * 24 * 60 * 60 * 1000) // 30 days before
      }
    },
    order: [['created_at', 'DESC']]
  });
  
  if (historicalPrices.length === 0) {
    return false;
  }
  
  // Calculate average volume
  const totalVolume = historicalPrices.reduce((sum, price) => sum + (price.volume || 0), 0);
  const averageVolume = totalVolume / historicalPrices.length;
  
  // Check condition based on volume condition
  const currentVolume = latestPrice.volume;
  const volumeThreshold = alert.volumeThreshold || averageVolume;
  
  switch (alert.volumeCondition.name) {
    case 'above_average':
      return currentVolume > averageVolume;
    
    case 'below_average':
      return currentVolume < averageVolume;
    
    case 'spike':
      // A spike is defined as volume > 2x average
      return currentVolume > (averageVolume * 2);
    
    default:
      throw new Error(`Unsupported volume condition: ${alert.volumeCondition.name}`);
  }
};

/**
 * Check technical indicator alert conditions
 * @param {Object} alert - Indicator alert object
 * @returns {Promise<boolean>} True if indicator conditions are met
 */
const checkIndicatorAlertConditions = async (alert) => {
  // Get latest indicator value
  const latestIndicator = await db.TechnicalIndicator.findOne({
    where: { 
      stockId: alert.stockId,
      indicatorTypeId: alert.indicatorTypeId,
      periodLength: alert.indicatorPeriod || 14
    },
    order: [['calculation_date', 'DESC']]
  });
  
  if (!latestIndicator) {
    return false;
  }

  // Check condition based on indicator condition
  const value = latestIndicator.value;
  const threshold = alert.indicatorThreshold;
  
  switch (alert.indicatorCondition.name) {
    case 'above':
      return value > threshold;
    
    case 'below':
      return value < threshold;
    
    case 'crossover':
      // For crossover, we need the previous value
      const previousIndicator = await db.TechnicalIndicator.findOne({
        where: { 
          stockId: alert.stockId,
          indicatorTypeId: alert.indicatorTypeId,
          periodLength: alert.indicatorPeriod || 14,
          calculation_date: { [Op.lt]: latestIndicator.calculationDate }
        },
        order: [['calculation_date', 'DESC']]
      });
      
      if (!previousIndicator) {
        return false;
      }
      
      return previousIndicator.value <= threshold && value > threshold;
    
    case 'crossunder':
      // For crossunder, we need the previous value
      const prevIndicator = await db.TechnicalIndicator.findOne({
        where: { 
          stockId: alert.stockId,
          indicatorTypeId: alert.indicatorTypeId,
          periodLength: alert.indicatorPeriod || 14,
          calculation_date: { [Op.lt]: latestIndicator.calculationDate }
        },
        order: [['calculation_date', 'DESC']]
      });
      
      if (!prevIndicator) {
        return false;
      }
      
      return prevIndicator.value >= threshold && value < threshold;
    
    default:
      throw new Error(`Unsupported indicator condition: ${alert.indicatorCondition.name}`);
  }
};

/**
 * Check news alert conditions
 * @param {Object} alert - News alert object
 * @returns {Promise<boolean>} True if news conditions are met
 */
const checkNewsAlertConditions = async (alert) => {
  // Get latest news for the stock
  const latestNews = await db.NewsMention.findOne({
    where: { 
      stockId: alert.stockId,
      // If sentiment type is specified, filter by it
      ...(alert.sentimentTypeId && { sentimentTypeId: alert.sentimentTypeId }),
      // Get news after the last triggered time or from the past 24 hours
      publication_date: { 
        [Op.gte]: alert.lastTriggered || new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    order: [['publication_date', 'DESC']]
  });
  
  // If there's any news matching the criteria, trigger the alert
  return !!latestNews;
};

/**
 * Create alert history record with forward-looking context
 * @param {Object} alert - Alert object
 * @returns {Promise<Object>} Created alert history record
 */
const createAlertHistory = async (alert) => {
  // Get the relevant trigger value based on trigger type
  let triggerValue = null;
  let stockPrice = null;
  let triggerVolume = null;
  
  switch (alert.triggerType.name) {
    case 'stock_price':
      stockPrice = await db.StockPrice.findOne({
        where: { 
          stockId: alert.stockId,
          // Only get prices after baseline for forward-looking context
          ...(alert.baselineTimestamp && {
            created_at: { [Op.gte]: alert.baselineTimestamp }
          })
        },
        order: [['created_at', 'DESC']]
      });
      triggerValue = stockPrice ? stockPrice.price : null;
      triggerVolume = stockPrice ? stockPrice.volume : null;
      break;
    
    case 'volume':
      stockPrice = await db.StockPrice.findOne({
        where: { stockId: alert.stockId },
        order: [['created_at', 'DESC']]
      });
      triggerValue = stockPrice ? stockPrice.volume : null;
      triggerVolume = stockPrice ? stockPrice.volume : null;
      break;
    
    case 'technical_indicator':
      const indicator = await db.TechnicalIndicator.findOne({
        where: { 
          stockId: alert.stockId,
          indicatorTypeId: alert.indicatorTypeId,
          periodLength: alert.indicatorPeriod || 14
        },
        order: [['calculation_date', 'DESC']]
      });
      triggerValue = indicator ? indicator.value : null;
      break;
  }

  // Calculate price change metrics for forward-looking context
  const priceChange = (triggerValue && alert.baselinePrice) 
    ? triggerValue - alert.baselinePrice 
    : null;
  const priceChangePercent = (priceChange && alert.baselinePrice) 
    ? (priceChange / alert.baselinePrice) * 100 
    : null;

  // Create enhanced history record with forward-looking context
  const alertHistory = await db.AlertHistory.create({
    alertId: alert.id,
    userId: alert.userId,
    stockId: alert.stockId,
    triggerValue,
    thresholdValue: alert.priceThreshold,
    triggeredAt: new Date(),
    // Add forward-looking context fields
    baselinePrice: alert.baselinePrice,
    priceChange,
    priceChangePercent,
    triggerVolume,
    marketContext: JSON.stringify({
      isMarketHours: isMarketHours(),
      alertAge: alert.baselineTimestamp ? 
        Math.floor((Date.now() - new Date(alert.baselineTimestamp).getTime()) / (1000 * 60)) : null, // minutes
      volumeConfirmationUsed: alert.volumeConfirmation
    })
  });

  return alertHistory;
};

/**
 * Queue notification for a triggered alert
 * @param {Object} alert - Alert object
 * @returns {Promise<Object>} Created notification queue item
 */
const queueAlertNotification = async (alert) => {
  // Get user preferences for notification methods
  const userPreferences = await db.UserPreference.findOne({
    where: { userId: alert.userId }
  });
  
  if (!userPreferences) {
    throw new Error('User preferences not found');
  }

  // Get stock information for the notification
  const stock = await db.Stock.findByPk(alert.stockId);
  
  // Format notification content
  let notificationContent = '';
  
  switch (alert.triggerType.name) {
    case 'stock_price':
      const stockPrice = await db.StockPrice.findOne({
        where: { stockId: alert.stockId },
        order: [['created_at', 'DESC']]
      });
      
      notificationContent = `${stock.symbol} price alert: Current price $${stockPrice.price} is ${alert.thresholdCondition.name} your threshold of $${alert.priceThreshold}`; // Changed from thresholdValue to priceThreshold
      break;
    
    case 'volume':
      notificationContent = `${stock.symbol} volume alert: Unusual trading activity detected`;
      break;
    
    case 'technical_indicator':
      notificationContent = `${stock.symbol} ${alert.indicatorType.name} alert: Indicator ${alert.indicatorCondition.name} threshold ${alert.indicatorThreshold}`;
      break;
    
    case 'news':
      notificationContent = `${stock.symbol} news alert: New ${alert.sentimentType ? alert.sentimentType.name : ''} news article detected`;
      break;
  }

  // Create notification queue items for each enabled method
  const notificationPromises = [];
  
  // Email notification
  if (userPreferences.emailNotificationsEnabled) {
    notificationPromises.push(
      db.NotificationQueue.create({
        userId: alert.userId,
        alertId: alert.id,
        content: notificationContent,
        notificationMethodId: await getNotificationMethodId('email'),
        priorityId: await getPriorityLevelId('Medium'),
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        scheduledAt: new Date()
      })
    );
  }
  
  // SMS notification
  if (userPreferences.smsNotificationsEnabled) {
    notificationPromises.push(
      db.NotificationQueue.create({
        userId: alert.userId,
        alertId: alert.id,
        content: notificationContent,
        notificationMethodId: await getNotificationMethodId('sms'),
        priorityId: await getPriorityLevelId('High'),
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        scheduledAt: new Date()
      })
    );
  }
  
  // Push notification to frontend - always send this
  notificationPromises.push(
    db.NotificationQueue.create({
      userId: alert.userId,
      alertId: alert.id,
      content: notificationContent,
      notificationMethodId: await getNotificationMethodId('push'),
      priorityId: await getPriorityLevelId('High'),
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date(),
      recipientAddress: 'frontend'
    })
  );

  // Wait for all notifications to be queued
  const notifications = await Promise.all(notificationPromises);
  
  return notifications;
};

/**
 * Helper function to get notification method ID by name
 * @param {string} methodName - Notification method name
 * @returns {Promise<number>} Notification method ID
 */
const getNotificationMethodId = async (methodName) => {
  const method = await db.NotificationMethod.findOne({
    where: { name: methodName }
  });
  
  if (!method) {
    throw new Error(`Notification method not found: ${methodName}`);
  }
  
  return method.id;
};

/**
 * Helper function to get priority level ID by name
 * @param {string} levelName - Priority level name
 * @returns {Promise<number>} Priority level ID
 */
const getPriorityLevelId = async (levelName) => {
  const level = await db.PriorityLevel.findOne({
    where: { name: levelName }
  });
  
  if (!level) {
    throw new Error(`Priority level not found: ${levelName}`);
  }
  
  return level.id;
};

/**
 * Process all active alerts - called by scheduler
 * @returns {Promise<void>}
 */
const processAllAlerts = async () => {
  try {
    // Get all active price alerts
    const alerts = await db.Alert.findAll({
      where: {
        isActive: true,
        triggerTypeId: 1 // Price alerts
      },
      include: [
        {
          model: db.Stock,
          as: 'stock',
          attributes: ['id', 'symbol', 'companyName'] // Changed 'name' to 'companyName'
        },
        {
          model: db.ThresholdCondition,
          as: 'thresholdCondition',
          attributes: ['id', 'name']
        },
        {
          model: db.TriggerType,
          as: 'triggerType',
          attributes: ['id', 'name']
        }
      ],
      // Add attributes option to explicitly select only the columns we need
      attributes: [
        'id', 'userId', 'stockId', 'triggerTypeId', 'name', 'description',
        'priceThreshold', 'thresholdConditionId', 'isActive', 'lastTriggered',
        'baselinePrice', 'baselineTimestamp', 'marketHoursOnly', 'volumeConfirmation',
        'cooldownMinutes'
      ]
    });

    logger.info(`Processing ${alerts.length} active alerts`);

    // Process each alert
    for (const alert of alerts) {
      try {
        const isTriggered = await checkAlertConditions(alert);
        
        if (isTriggered) {
          // Record alert history
          await createAlertHistory(alert);
          
          // Queue notification
          await queueAlertNotification(alert);
          
          // Update last triggered time
          await alert.update({
            lastTriggered: new Date()
          });
          
          logger.info(`Alert triggered: ${alert.id} - ${alert.name}`);
        }
      } catch (error) {
        logger.error(`Error processing alert ${alert.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error processing all alerts:', error);
    throw error;
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertHistory,
  processAlerts,
  processAllAlerts,
  queueAlertNotification,
  getNotificationMethodId,
  getPriorityLevelId
};
