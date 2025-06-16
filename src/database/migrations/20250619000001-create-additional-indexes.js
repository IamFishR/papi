/**
 * Stock Alert Additional Indexes migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Compound indexes for improved query performance
    
    // Compound index for alert filtering by user and status
    await queryInterface.addIndex('st_alerts', ['user_id', 'status_id', 'is_active'], {
      name: 'idx_alerts_user_status_active',
    });
    
    // Compound index for price history queries with date range
    await queryInterface.addIndex('st_stock_prices', ['stock_id', 'price_date', 'close_price'], {
      name: 'idx_stock_prices_stock_date_close',
    });
    
    // Compound index for watchlist stocks filtering
    await queryInterface.addIndex('st_watchlist_stocks', ['watchlist_id', 'added_at'], {
      name: 'idx_watchlist_stocks_watchlist_date',
    });
    
    // Compound index for alert history filtering by user and date
    await queryInterface.addIndex('st_alert_history', ['user_id', 'triggered_at'], {
      name: 'idx_alert_history_user_date',
    });
    
    // Compound index for technical indicators trend analysis
    await queryInterface.addIndex('st_technical_indicators', ['stock_id', 'indicator_type_id', 'calculation_date', 'value'], {
      name: 'idx_technical_indicators_stock_type_date_value',
    });
    
    // Compound index for sentiment analysis
    await queryInterface.addIndex('st_news_mentions', ['stock_id', 'sentiment_type_id', 'publication_date', 'sentiment_score'], {
      name: 'idx_news_mentions_stock_sentiment_date_score',
    });
    
    // Compound index for notification queue processing
    await queryInterface.addIndex('st_notification_queue', ['notification_status_id', 'scheduled_time', 'priority_id'], {
      name: 'idx_notification_queue_status_time_priority',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove all the indexes created
    await queryInterface.removeIndex('st_alerts', 'idx_alerts_user_status_active');
    await queryInterface.removeIndex('st_stock_prices', 'idx_stock_prices_stock_date_close');
    await queryInterface.removeIndex('st_watchlist_stocks', 'idx_watchlist_stocks_watchlist_date');
    await queryInterface.removeIndex('st_alert_history', 'idx_alert_history_user_date');
    await queryInterface.removeIndex('st_technical_indicators', 'idx_technical_indicators_stock_type_date_value');
    await queryInterface.removeIndex('st_news_mentions', 'idx_news_mentions_stock_sentiment_date_score');
    await queryInterface.removeIndex('st_notification_queue', 'idx_notification_queue_status_time_priority');
  },
};
