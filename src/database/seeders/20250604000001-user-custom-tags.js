/**
 * User Custom Tags seeders
 */
'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get the ID of the test user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'user@example.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      console.warn('Test user not found, skipping tag creation');
      return;
    }
    
    const userId = users[0].id;
    
    // Create some common trading strategy tags
    const strategyTags = [
      'Breakout',
      'Pullback',
      'Trend Following',
      'Reversal',
      'Support/Resistance',
      'Gap Trading',
      'Moving Average Crossover',
      'MACD Divergence',
      'RSI Oversold/Overbought'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'strategy',
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Create emotion tags
    const emotionTags = [
      'Confident',
      'Calm',
      'Anxious',
      'Fearful',
      'Excited',
      'Greedy',
      'Impatient',
      'Indecisive',
      'Frustrated'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'emotion',
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Create mistake tags
    const mistakeTags = [
      'Early Entry',
      'Late Entry',
      'Moving Stop Loss',
      'No Stop Loss',
      'Averaging Down',
      'Revenge Trading',
      'Overtrading',
      'Position Sizing Too Large',
      'Ignored Trading Plan'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'mistake',
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Create exit reason tags
    const exitReasonTags = [
      'Target Reached',
      'Stop Loss Hit',
      'Technical Exit',
      'Profit Taking',
      'News Event',
      'Loss of Conviction',
      'Time-Based Exit',
      'Risk Management'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'exitReason',
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Create instrument watchlist tags
    const instrumentWatchlistTags = [
      'High Volatility',
      'Trending Stocks',
      'Earnings Season',
      'Dividend Plays',
      'Technical Setups',
      'Sector Leaders'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'instrumentWatchlist',
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Create setup condition tags
    const setupConditionTags = [
      'Price Above MA200',
      'RSI < 30',
      'RSI > 70',
      'Volume Spike',
      'Inside Bar',
      'Cup and Handle',
      'Head and Shoulders',
      'Double Bottom',
      'Triple Top'
    ].map(tagName => ({
      id: uuidv4(),
      user_id: userId,
      tag_name: tagName,
      tag_type: 'setupCondition',
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Insert all tags
    await queryInterface.bulkInsert('user_custom_tags', [
      ...strategyTags,
      ...emotionTags,
      ...mistakeTags,
      ...exitReasonTags,
      ...instrumentWatchlistTags,
      ...setupConditionTags
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Get the user ID
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'user@example.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      return;
    }
    
    const userId = users[0].id;
    
    // Delete all tags for this user
    await queryInterface.bulkDelete('user_custom_tags', {
      user_id: userId
    }, {});
  }
};
