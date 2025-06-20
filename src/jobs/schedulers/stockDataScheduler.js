/**
 * Stock Data Scheduler - handles automated data fetching during market hours
 * Manages cron jobs for stock and price data updates
 */
const cron = require('node-cron');
const logger = require('../../config/logger');

class StockDataScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.config = {
      // Indian market hours: 9:15 AM - 3:30 PM IST (Monday-Friday)
      marketHours: {
        start: { hour: 9, minute: 15 },
        end: { hour: 15, minute: 30 },
        timezone: 'Asia/Kolkata'
      },
      // Data fetch intervals
      intervals: {
        stocks: 15, // minutes - update stock metadata every 15 minutes
        prices: 5   // minutes - update prices every 5 minutes
      },
      // Environment-based configuration
      enabled: process.env.NSE_FETCH_ENABLED === 'true',
      marketHoursOnly: process.env.NSE_MARKET_HOURS_ONLY !== 'false',
      stockInterval: parseInt(process.env.NSE_STOCK_INTERVAL_MINUTES) || 15,
      priceInterval: parseInt(process.env.NSE_PRICE_INTERVAL_MINUTES) || 5
    };
  }

  /**
   * Check if current time is within market hours (IST)
   * @returns {boolean} True if within market hours
   */
  isMarketHours() {
    if (!this.config.marketHoursOnly) {
      return true; // Always allow if market hours restriction is disabled
    }

    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();
    const currentDay = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Check if it's a weekday (Monday-Friday)
    if (currentDay === 0 || currentDay === 6) {
      return false; // Weekend
    }

    // Check if within market hours
    const startTime = this.config.marketHours.start.hour * 60 + this.config.marketHours.start.minute;
    const endTime = this.config.marketHours.end.hour * 60 + this.config.marketHours.end.minute;
    const currentTime = currentHour * 60 + currentMinute;

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Get market status information
   * @returns {Object} Market status details
   */
  getMarketStatus() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const isOpen = this.isMarketHours();
    
    let nextOpenTime = null;
    let nextCloseTime = null;

    if (isOpen) {
      // Market is open, calculate next close time
      nextCloseTime = new Date(istTime);
      nextCloseTime.setHours(this.config.marketHours.end.hour, this.config.marketHours.end.minute, 0, 0);
    } else {
      // Market is closed, calculate next open time
      nextOpenTime = new Date(istTime);
      nextOpenTime.setHours(this.config.marketHours.start.hour, this.config.marketHours.start.minute, 0, 0);
      
      // If it's past market hours today, set to next weekday
      if (istTime.getHours() > this.config.marketHours.end.hour || 
          (istTime.getHours() === this.config.marketHours.end.hour && 
           istTime.getMinutes() > this.config.marketHours.end.minute)) {
        nextOpenTime.setDate(nextOpenTime.getDate() + 1);
      }
      
      // Skip weekends
      while (nextOpenTime.getDay() === 0 || nextOpenTime.getDay() === 6) {
        nextOpenTime.setDate(nextOpenTime.getDate() + 1);
      }
    }

    return {
      isOpen,
      currentTime: istTime,
      marketHoursOnly: this.config.marketHoursOnly,
      nextOpenTime,
      nextCloseTime,
      timezone: this.config.marketHours.timezone
    };
  }

  /**
   * Create cron expression for market hours
   * @param {number} intervalMinutes - Interval in minutes
   * @returns {string} Cron expression
   */
  createMarketHoursCron(intervalMinutes) {
    if (!this.config.marketHoursOnly) {
      // Run every X minutes, 24/7
      return `*/${intervalMinutes} * * * *`;
    }

    // Run every X minutes during market hours (9:15 AM - 3:30 PM IST, Monday-Friday)
    const startHour = this.config.marketHours.start.hour;
    const endHour = this.config.marketHours.end.hour;
    
    return `*/${intervalMinutes} ${startHour}-${endHour} * * 1-5`;
  }

  /**
   * Stock data fetch job handler
   */
  async stockDataJob() {
    const jobId = 'stock-data-fetch';
    
    try {
      logger.info(`Starting stock data fetch job (${jobId})`);
      
      // Import worker dynamically to avoid circular dependencies
      const stockDataWorker = require('../workers/stockDataWorker');
      
      // Check market hours if restriction is enabled
      if (this.config.marketHoursOnly && !this.isMarketHours()) {
        logger.info('Skipping stock data fetch - outside market hours');
        return;
      }

      const result = await stockDataWorker.fetchStockData();
      
      logger.info(`Stock data fetch job completed (${jobId})`, {
        success: result.success,
        processed: result.processed || 0,
        duration: result.duration || 0
      });
      
    } catch (error) {
      logger.error(`Stock data fetch job failed (${jobId}):`, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Price data fetch job handler
   */
  async priceDataJob() {
    const jobId = 'price-data-fetch';
    
    try {
      logger.info(`Starting price data fetch job (${jobId})`);
      
      // Import worker dynamically to avoid circular dependencies
      const stockDataWorker = require('../workers/stockDataWorker');
      
      // Check market hours if restriction is enabled
      if (this.config.marketHoursOnly && !this.isMarketHours()) {
        logger.info('Skipping price data fetch - outside market hours');
        return;
      }

      const result = await stockDataWorker.fetchPriceData();
      
      logger.info(`Price data fetch job completed (${jobId})`, {
        success: result.success,
        processed: result.processed || 0,
        duration: result.duration || 0
      });
      
    } catch (error) {
      logger.error(`Price data fetch job failed (${jobId}):`, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Market hours check job (runs every minute)
   */
  async marketStatusJob() {
    try {
      const status = this.getMarketStatus();
      
      // Log market status changes
      if (status.isOpen !== this.lastMarketStatus) {
        this.lastMarketStatus = status.isOpen;
        logger.info(`Market status changed: ${status.isOpen ? 'OPEN' : 'CLOSED'}`, {
          currentTime: status.currentTime,
          nextChange: status.isOpen ? status.nextCloseTime : status.nextOpenTime
        });
      }
      
    } catch (error) {
      logger.error('Market status check failed:', error);
    }
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Stock data scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      logger.info('Stock data scheduler is disabled via configuration');
      return;
    }

    try {
      logger.info('Starting stock data scheduler...', {
        config: {
          enabled: this.config.enabled,
          marketHoursOnly: this.config.marketHoursOnly,
          stockInterval: this.config.stockInterval,
          priceInterval: this.config.priceInterval,
          timezone: this.config.marketHours.timezone
        }
      });

      // Market status monitoring (every minute)
      const marketStatusCron = '*/1 * * * *';
      const marketStatusTask = cron.schedule(marketStatusCron, () => {
        this.marketStatusJob();
      }, {
        scheduled: false,
        timezone: this.config.marketHours.timezone
      });

      this.jobs.set('market-status', {
        task: marketStatusTask,
        cron: marketStatusCron,
        description: 'Market status monitoring'
      });

      // Stock data fetch job
      const stockDataCron = this.createMarketHoursCron(this.config.stockInterval);
      const stockDataTask = cron.schedule(stockDataCron, () => {
        this.stockDataJob();
      }, {
        scheduled: false,
        timezone: this.config.marketHours.timezone
      });

      this.jobs.set('stock-data', {
        task: stockDataTask,
        cron: stockDataCron,
        description: `Stock data fetch (every ${this.config.stockInterval} minutes)`
      });

      // Price data fetch job
      const priceDataCron = this.createMarketHoursCron(this.config.priceInterval);
      const priceDataTask = cron.schedule(priceDataCron, () => {
        this.priceDataJob();
      }, {
        scheduled: false,
        timezone: this.config.marketHours.timezone
      });

      this.jobs.set('price-data', {
        task: priceDataTask,
        cron: priceDataCron,
        description: `Price data fetch (every ${this.config.priceInterval} minutes)`
      });

      // Start all jobs
      this.jobs.forEach((job, name) => {
        job.task.start();
        logger.info(`Started job: ${name}`, {
          cron: job.cron,
          description: job.description
        });
      });

      this.isRunning = true;
      logger.info(`Stock data scheduler started successfully with ${this.jobs.size} jobs`);

      // Log initial market status
      const marketStatus = this.getMarketStatus();
      logger.info('Current market status:', marketStatus);

    } catch (error) {
      logger.error('Failed to start stock data scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Stock data scheduler is not running');
      return;
    }

    try {
      logger.info('Stopping stock data scheduler...');

      this.jobs.forEach((job, name) => {
        job.task.stop();
        logger.info(`Stopped job: ${name}`);
      });

      this.jobs.clear();
      this.isRunning = false;
      
      logger.info('Stock data scheduler stopped successfully');
      
    } catch (error) {
      logger.error('Failed to stop stock data scheduler:', error);
      throw error;
    }
  }

  /**
   * Restart all scheduled jobs
   */
  restart() {
    logger.info('Restarting stock data scheduler...');
    this.stop();
    setTimeout(() => {
      this.start();
    }, 1000);
  }

  /**
   * Get scheduler status and job information
   * @returns {Object} Scheduler status
   */
  getStatus() {
    const jobsStatus = Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      cron: job.cron,
      description: job.description,
      running: job.task.running || false
    }));

    return {
      isRunning: this.isRunning,
      enabled: this.config.enabled,
      config: this.config,
      jobs: jobsStatus,
      marketStatus: this.getMarketStatus(),
      totalJobs: this.jobs.size
    };
  }

  /**
   * Manually trigger a specific job
   * @param {string} jobName - Name of job to trigger
   * @returns {Promise<Object>} Job execution result
   */
  async triggerJob(jobName) {
    logger.info(`Manually triggering job: ${jobName}`);
    
    try {
      switch (jobName) {
        case 'stock-data':
          return await this.stockDataJob();
        case 'price-data':
          return await this.priceDataJob();
        case 'market-status':
          return await this.marketStatusJob();
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }
    } catch (error) {
      logger.error(`Manual job trigger failed for ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Update configuration and restart if running
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    logger.info('Updating scheduler configuration:', newConfig);
    
    Object.assign(this.config, newConfig);
    
    if (this.isRunning) {
      this.restart();
    }
  }
}

// Create singleton instance
const stockDataScheduler = new StockDataScheduler();

module.exports = stockDataScheduler;