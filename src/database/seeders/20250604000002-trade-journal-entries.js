/**
 * Trade Journal Entries seeders
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
      console.warn('Test user not found, skipping trade entries creation');
      return;
    }
    
    const userId = users[0].id;
    
    // Get some strategy tags for this user
    const strategyTags = await queryInterface.sequelize.query(
      `SELECT tag_name FROM user_custom_tags WHERE user_id = '${userId}' AND tag_type = 'strategy' LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Get some emotion tags for this user
    const emotionTags = await queryInterface.sequelize.query(
      `SELECT tag_name FROM user_custom_tags WHERE user_id = '${userId}' AND tag_type = 'emotion' LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Get some mistake tags for this user
    const mistakeTags = await queryInterface.sequelize.query(
      `SELECT tag_name FROM user_custom_tags WHERE user_id = '${userId}' AND tag_type = 'mistake' LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Get some exit reason tags for this user
    const exitReasonTags = await queryInterface.sequelize.query(
      `SELECT tag_name FROM user_custom_tags WHERE user_id = '${userId}' AND tag_type = 'exitReason' LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Create sample trade entries
    const tradeEntries = [
      // Winning Trade
      {
        id: uuidv4(),
        user_id: userId,
        execution_date: new Date('2025-05-20'),
        instrument: 'AAPL',
        asset_class: 'Equity',
        direction: 'Long',
        
        // Pre-Trade Plan
        plan_date_time: new Date('2025-05-20T09:30:00'),
        instruments_watched: JSON.stringify(['AAPL', 'MSFT', 'GOOG']),
        market_context_bias: 'Bullish',
        trade_thesis_catalyst: 'Apple announced new product line with strong early reviews',
        setup_conditions: JSON.stringify(['Price Above MA200', 'Volume Spike']),
        planned_entry_zone_price: 200.50,
        planned_stop_loss_price: 195.00,
        planned_target_prices: JSON.stringify([210.00, 215.00]),
        planned_position_size_value: 100,
        planned_position_size_type: 'Shares/Units',
        calculated_max_risk_on_plan: 550.00,
        calculated_potential_reward_tp1: 950.00,
        planned_risk_reward_ratio_tp1: 1.73,
        confidence_in_plan: 8,
        invalidation_conditions: 'Break below support at 195',
        
        // Trade Execution Metadata
        strategy_tags: JSON.stringify(['Breakout', 'Trend Following']),
        primary_analysis_timeframe: 'Daily',
        secondary_analysis_timeframes: JSON.stringify(['1 Hour', '4 Hour']),
        
        // Entry & Exit Details
        entry_date_time: new Date('2025-05-20T10:15:00'),
        actual_entry_price: 201.25,
        quantity: 100,
        fees_entry: 5.99,
        exit_date_time: new Date('2025-05-21T14:30:00'),
        actual_exit_price: 212.50,
        fees_exit: 5.99,
        total_quantity_traded: 100,
        average_entry_price: 201.25,
        average_exit_price: 212.50,
        gross_pnl_per_unit: 11.25,
        gross_pnl: 1125.00,
        total_fees: 11.98,
        net_pnl: 1113.02,
        actual_initial_risk: 625.00,
        r_multiple_achieved: 1.78,
        trade_duration_minutes: 1695, // 28 hours and 15 minutes
        
        // Trade Outcome & Review
        outcome: 'Win',
        exit_reason_tag: 'Target Reached',
        initial_sl_hit: false,
        initial_tp_hit: true,
        max_adverse_excursion: 199.50,
        max_adverse_excursion_percentage: 0.87,
        max_favorable_excursion: 214.00,
        max_favorable_excursion_percentage: 6.33,
        
        // Psychological Review
        confidence_in_execution: 9,
        dominant_emotions_pre_trade: JSON.stringify(['Confident', 'Calm']),
        dominant_emotions_during_trade: JSON.stringify(['Confident', 'Excited']),
        focus_level_during_trade: 8,
        followed_pre_trade_plan: true,
        deviation_type: 'None',
        reason_for_deviation: null,
        impulse_action_taken: false,
        impulse_action_description: null,
        hesitation_on: 'None',
        reason_for_hesitation: null,
        traded_pnl_instead_of_plan: false,
        dominant_emotions_post_trade: JSON.stringify(['Confident', 'Satisfied']),
        satisfaction_with_execution: 9,
        external_stressors_impact: false,
        general_psychology_notes: 'Felt very focused and disciplined throughout this trade',
        
        // Analysis & Learning
        what_went_well: 'Stuck to the plan, managed emotions well, and exited at planned target',
        what_went_wrong: 'Could have sized up a bit more given the strong conviction',
        primary_mistake_tags: JSON.stringify([]),
        root_cause_of_mistakes: null,
        key_lesson_learned: 'When conviction is high, position sizing can be more aggressive',
        actionable_improvement: 'Create a tiered position sizing approach based on conviction level',
        overall_trade_rating: 9,
        additional_notes: 'One of my best executed trades this month',
        
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Losing Trade
      {
        id: uuidv4(),
        user_id: userId,
        execution_date: new Date('2025-05-25'),
        instrument: 'TSLA',
        asset_class: 'Equity',
        direction: 'Long',
        
        // Pre-Trade Plan
        plan_date_time: new Date('2025-05-25T09:15:00'),
        instruments_watched: JSON.stringify(['TSLA', 'RIVN', 'F']),
        market_context_bias: 'Neutral',
        trade_thesis_catalyst: 'Tesla approaching support level with oversold RSI',
        setup_conditions: JSON.stringify(['RSI < 30', 'Double Bottom']),
        planned_entry_zone_price: 420.00,
        planned_stop_loss_price: 405.00,
        planned_target_prices: JSON.stringify([450.00, 470.00]),
        planned_position_size_value: 50,
        planned_position_size_type: 'Shares/Units',
        calculated_max_risk_on_plan: 750.00,
        calculated_potential_reward_tp1: 1500.00,
        planned_risk_reward_ratio_tp1: 2.0,
        confidence_in_plan: 7,
        invalidation_conditions: 'Break below 400 with increased volume',
        
        // Trade Execution Metadata
        strategy_tags: JSON.stringify(['Reversal', 'Support/Resistance']),
        primary_analysis_timeframe: 'Daily',
        secondary_analysis_timeframes: JSON.stringify(['1 Hour']),
        
        // Entry & Exit Details
        entry_date_time: new Date('2025-05-25T09:45:00'),
        actual_entry_price: 422.50,
        quantity: 50,
        fees_entry: 5.99,
        exit_date_time: new Date('2025-05-25T15:30:00'),
        actual_exit_price: 402.75,
        fees_exit: 5.99,
        total_quantity_traded: 50,
        average_entry_price: 422.50,
        average_exit_price: 402.75,
        gross_pnl_per_unit: -19.75,
        gross_pnl: -987.50,
        total_fees: 11.98,
        net_pnl: -999.48,
        actual_initial_risk: 875.00,
        r_multiple_achieved: -1.14,
        trade_duration_minutes: 345, // 5 hours and 45 minutes
        
        // Trade Outcome & Review
        outcome: 'Loss',
        exit_reason_tag: 'Stop Loss Hit',
        initial_sl_hit: true,
        initial_tp_hit: false,
        max_adverse_excursion: 400.00,
        max_adverse_excursion_percentage: 5.33,
        max_favorable_excursion: 425.00,
        max_favorable_excursion_percentage: 0.59,
        
        // Psychological Review
        confidence_in_execution: 6,
        dominant_emotions_pre_trade: JSON.stringify(['Anxious', 'Hopeful']),
        dominant_emotions_during_trade: JSON.stringify(['Fearful', 'Anxious']),
        focus_level_during_trade: 5,
        followed_pre_trade_plan: false,
        deviation_type: 'StopLoss',
        reason_for_deviation: 'Moved stop loss lower hoping for recovery',
        impulse_action_taken: true,
        impulse_action_description: 'Added to position as it dropped',
        hesitation_on: 'Exit',
        reason_for_hesitation: 'Didn\'t want to accept the loss',
        traded_pnl_instead_of_plan: true,
        dominant_emotions_post_trade: JSON.stringify(['Frustrated', 'Disappointed']),
        satisfaction_with_execution: 3,
        external_stressors_impact: true,
        general_psychology_notes: 'Was distracted by personal issues and didn\'t stick to plan',
        
        // Analysis & Learning
        what_went_well: 'Initial analysis of setup was reasonable',
        what_went_wrong: 'Poor emotional control, didn\'t stick to stop loss, sized too large',
        primary_mistake_tags: JSON.stringify(['Moving Stop Loss', 'Averaging Down', 'Position Sizing Too Large']),
        root_cause_of_mistakes: 'Fear of taking a loss and external distractions',
        key_lesson_learned: 'Emotional control is critical; never trade when distracted',
        actionable_improvement: 'Implement a checklist before entering trades to assess emotional state',
        overall_trade_rating: 3,
        additional_notes: 'This trade highlights my weakness in handling losing positions',
        
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Breakeven Trade
      {
        id: uuidv4(),
        user_id: userId,
        execution_date: new Date('2025-06-02'),
        instrument: 'AMZN',
        asset_class: 'Equity',
        direction: 'Short',
        
        // Pre-Trade Plan
        plan_date_time: new Date('2025-06-02T09:30:00'),
        instruments_watched: JSON.stringify(['AMZN', 'GOOGL', 'META']),
        market_context_bias: 'Bearish',
        trade_thesis_catalyst: 'Amazon reached resistance level with bearish divergence',
        setup_conditions: JSON.stringify(['RSI > 70', 'Head and Shoulders']),
        planned_entry_zone_price: 175.00,
        planned_stop_loss_price: 180.00,
        planned_target_prices: JSON.stringify([165.00, 160.00]),
        planned_position_size_value: 75,
        planned_position_size_type: 'Shares/Units',
        calculated_max_risk_on_plan: 375.00,
        calculated_potential_reward_tp1: 750.00,
        planned_risk_reward_ratio_tp1: 2.0,
        confidence_in_plan: 7,
        invalidation_conditions: 'Break above 180 with increased volume',
        
        // Trade Execution Metadata
        strategy_tags: JSON.stringify(['Reversal', 'MACD Divergence']),
        primary_analysis_timeframe: '4 Hour',
        secondary_analysis_timeframes: JSON.stringify(['Daily', '1 Hour']),
        
        // Entry & Exit Details
        entry_date_time: new Date('2025-06-02T10:15:00'),
        actual_entry_price: 174.50,
        quantity: 75,
        fees_entry: 5.99,
        exit_date_time: new Date('2025-06-02T15:45:00'),
        actual_exit_price: 174.75,
        fees_exit: 5.99,
        total_quantity_traded: 75,
        average_entry_price: 174.50,
        average_exit_price: 174.75,
        gross_pnl_per_unit: -0.25,
        gross_pnl: -18.75,
        total_fees: 11.98,
        net_pnl: -30.73,
        actual_initial_risk: 412.50,
        r_multiple_achieved: -0.07,
        trade_duration_minutes: 330, // 5 hours and 30 minutes
        
        // Trade Outcome & Review
        outcome: 'Breakeven',
        exit_reason_tag: 'Loss of Conviction',
        initial_sl_hit: false,
        initial_tp_hit: false,
        max_adverse_excursion: 177.50,
        max_adverse_excursion_percentage: 1.72,
        max_favorable_excursion: 171.25,
        max_favorable_excursion_percentage: 1.86,
        
        // Psychological Review
        confidence_in_execution: 6,
        dominant_emotions_pre_trade: JSON.stringify(['Confident', 'Cautious']),
        dominant_emotions_during_trade: JSON.stringify(['Anxious', 'Indecisive']),
        focus_level_during_trade: 7,
        followed_pre_trade_plan: false,
        deviation_type: 'EarlyExit',
        reason_for_deviation: 'Market didn\'t move in expected direction and lost conviction',
        impulse_action_taken: false,
        impulse_action_description: null,
        hesitation_on: 'Exit',
        reason_for_hesitation: 'Kept hoping for market to turn in my favor',
        traded_pnl_instead_of_plan: false,
        dominant_emotions_post_trade: JSON.stringify(['Relieved', 'Frustrated']),
        satisfaction_with_execution: 5,
        external_stressors_impact: false,
        general_psychology_notes: 'Had trouble with conviction in this trade from the start',
        
        // Analysis & Learning
        what_went_well: 'Managed risk effectively, didn\'t let loss get too large',
        what_went_wrong: 'Entry timing was off, should have waited for confirmation',
        primary_mistake_tags: JSON.stringify(['Early Entry']),
        root_cause_of_mistakes: 'Rushed entry without proper confirmation',
        key_lesson_learned: 'Wait for proper confirmation even if it means missing some initial move',
        actionable_improvement: 'Create clear entry confirmation checklist for each strategy',
        overall_trade_rating: 6,
        additional_notes: 'This was a good learning experience for patience in trading',
        
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Insert trade entries
    await queryInterface.bulkInsert('trade_journal_entries', tradeEntries);
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
    
    // Delete all trade entries for this user
    await queryInterface.bulkDelete('trade_journal_entries', {
      user_id: userId
    }, {});
  }
};
