'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, we'll seed some default tags that users can use
    
    // Default emotions
    const defaultEmotions = [
      { tag_name: 'Confident', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Anxious', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Excited', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Fearful', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Hopeful', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Impatient', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Regretful', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Greedy', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Frustrated', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Focused', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Calm', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Stressed', tag_type: 'emotion', created_at: new Date(), updated_at: new Date() }
    ];
    
    // Default strategy tags
    const defaultStrategies = [
      { tag_name: 'Trend Following', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Breakout', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Reversal', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Support/Resistance', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Momentum', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Mean Reversion', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Gap Trading', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Range Trading', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Scalping', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Swing Trading', tag_type: 'strategy', created_at: new Date(), updated_at: new Date() }
    ];
    
    // Default mistake tags
    const defaultMistakes = [
      { tag_name: 'FOMO Entry', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Moved Stop Loss', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Sized Too Large', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Sized Too Small', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Early Exit', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Late Exit', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'No Plan', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Ignored Signal', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Revenge Trading', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Chasing Price', tag_type: 'mistake', created_at: new Date(), updated_at: new Date() }
    ];
    
    // Default exit reason tags
    const defaultExitReasons = [
      { tag_name: 'Target Hit', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Stop Loss Hit', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Technical Signal', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Time-Based Exit', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'News Event', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Risk Management', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Intuition', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Partial Target Hit', tag_type: 'exitReason', created_at: new Date(), updated_at: new Date() }
    ];
    
    // Default setup condition tags
    const defaultSetupConditions = [
      { tag_name: 'Double Top', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Double Bottom', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Head & Shoulders', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Bullish Engulfing', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Bearish Engulfing', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Golden Cross', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Death Cross', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Triangle Breakout', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'Flag Pattern', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() },
      { tag_name: 'RSI Divergence', tag_type: 'setupCondition', created_at: new Date(), updated_at: new Date() }
    ];
    
    // Combine all default tags
    const allDefaultTags = [
      ...defaultEmotions,
      ...defaultStrategies,
      ...defaultMistakes,
      ...defaultExitReasons,
      ...defaultSetupConditions
    ];
    
    // Insert all the default tags    return queryInterface.bulkInsert('user_custom_tags', allDefaultTags, {});
  },

  async down(queryInterface, Sequelize) {
    // Remove the default tags we added
    // Note: This is a simplification - in a real application you might want to be more selective
    return queryInterface.bulkDelete('user_custom_tags', null, {});
  }
};
