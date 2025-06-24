/**
 * Alert Scheduler - Runs every minute to check price alerts during market hours
 */
const cron = require('node-cron');
const alertService = require('../api/v1/alerts/alert.service');
const logger = require('../config/logger');

class AlertScheduler {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  isMarketHours() {
    // Get the timezone from env or default to Asia/Kolkata (IST)
    const timezone = process.env.TIMEZONE || 'Asia/Kolkata';
    
    // Get current date in the specified timezone
    const now = new Date();
    
    // Convert to IST by adding the offset (UTC+5:30)
    // IST is 5 hours and 30 minutes ahead of UTC
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    
    // Log the time for debugging
    logger.debug(`Current IST time: ${istTime.toISOString()} (Day: ${day}, Time: ${hour}:${minute})`);
    
    // Skip weekends
    if (day === 0 || day === 6) {
      return false;
    }
    
    // Market hours from env or default 9:15 AM to 3:30 PM IST (Indian Standard Time)
    const marketStartHour = parseInt(process.env.MARKET_START_HOUR || '9');
    const marketStartMinute = parseInt(process.env.MARKET_START_MINUTE || '15');
    const marketEndHour = parseInt(process.env.MARKET_END_HOUR || '15');
    const marketEndMinute = parseInt(process.env.MARKET_END_MINUTE || '30');
    
    const currentTime = hour * 60 + minute;
    const marketStart = marketStartHour * 60 + marketStartMinute;
    const marketEnd = marketEndHour * 60 + marketEndMinute;
    
    return currentTime >= marketStart && currentTime <= marketEnd;
  }

  async processAlerts() {
    if (this.isRunning) {
      logger.warn('Alert processing already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      
      if (!this.isMarketHours()) {
        logger.debug('Outside market hours, skipping alert processing');
        return;
      }

      // Process all active price alerts
      await alertService.processAllAlerts();
    } catch (error) {
      logger.error('Error in alert processing:', error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    if (this.job) {
      logger.warn('Alert scheduler already running');
      return;
    }

    // Run every minute
    this.job = cron.schedule('* * * * *', async () => {
      await this.processAlerts();
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'Asia/Kolkata'
    });

    logger.info('Alert scheduler started - checking every minute during market hours');
    logger.info(`Market hours: ${process.env.MARKET_START_HOUR || '9'}:${process.env.MARKET_START_MINUTE || '15'} - ${process.env.MARKET_END_HOUR || '15'}:${process.env.MARKET_END_MINUTE || '30'}`);
  }

  stop() {
    if (this.job) {
      this.job.destroy();
      this.job = null;
      logger.info('Alert scheduler stopped');
    }
  }
}

module.exports = new AlertScheduler();