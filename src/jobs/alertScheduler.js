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
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Skip weekends
    if (day === 0 || day === 6) {
      return false;
    }
    
    // Market hours from env or default 9:15 AM to 3:30 PM IST
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

      logger.info('Starting alert processing...');
      
      // Process all active price alerts
      await alertService.processAllAlerts();
      
      logger.info('Alert processing completed');
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