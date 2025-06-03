/**
 * Trade Journal Entry migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trade_journal_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      trade_id_string: {
        type: Sequelize.STRING,
      },
      execution_date: {
        type: Sequelize.DATEONLY,
      },
      instrument: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      asset_class: {
        type: Sequelize.ENUM('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other'),
      },
      direction: {
        type: Sequelize.ENUM('Long', 'Short'),
        allowNull: false,
      },
      // Pre-Trade Plan & Hypothesis (Section 0)
      plan_date_time: {
        type: Sequelize.DATE,
      },
      instruments_watched: {
        type: Sequelize.JSONB,
      },
      market_context_bias: {
        type: Sequelize.ENUM('Bullish', 'Bearish', 'Neutral', 'Range-bound', 'Uncertain'),
      },
      trade_thesis_catalyst: {
        type: Sequelize.TEXT,
      },
      setup_conditions: {
        type: Sequelize.JSONB,
      },
      planned_entry_zone_price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      planned_stop_loss_price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      planned_target_prices: {
        type: Sequelize.JSONB,
      },
      planned_position_size_value: {
        type: Sequelize.DECIMAL(10, 4),
      },
      planned_position_size_type: {
        type: Sequelize.ENUM('Shares/Units', 'Percentage Account', 'Fixed Risk Amount', 'Lots'),
      },
      calculated_max_risk_on_plan: {
        type: Sequelize.DECIMAL(10, 2),
      },
      calculated_potential_reward_tp1: {
        type: Sequelize.DECIMAL(10, 2),
      },
      planned_risk_reward_ratio_tp1: {
        type: Sequelize.DECIMAL(10, 2),
      },
      confidence_in_plan: {
        type: Sequelize.INTEGER,
      },
      invalidation_conditions: {
        type: Sequelize.TEXT,
      },
      // Trade Execution Metadata (Section 1)
      strategy_tags: {
        type: Sequelize.JSONB,
      },
      primary_analysis_timeframe: {
        type: Sequelize.STRING,
      },
      secondary_analysis_timeframes: {
        type: Sequelize.JSONB,
      },
      screenshot_setup_url: {
        type: Sequelize.STRING,
      },
      // Entry & Exit Execution Details (Section 2)
      entry_date_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      actual_entry_price: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      fees_entry: {
        type: Sequelize.DECIMAL(10, 2),
      },
      screenshot_entry_url: {
        type: Sequelize.STRING,
      },
      exit_date_time: {
        type: Sequelize.DATE,
      },
      actual_exit_price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      fees_exit: {
        type: Sequelize.DECIMAL(10, 2),
      },
      screenshot_exit_url: {
        type: Sequelize.STRING,
      },
      total_quantity_traded: {
        type: Sequelize.DECIMAL(10, 4),
      },
      average_entry_price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      average_exit_price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      gross_pnl_per_unit: {
        type: Sequelize.DECIMAL(10, 4),
      },
      gross_pnl: {
        type: Sequelize.DECIMAL(10, 2),
      },
      total_fees: {
        type: Sequelize.DECIMAL(10, 2),
      },
      net_pnl: {
        type: Sequelize.DECIMAL(10, 2),
      },
      actual_initial_risk: {
        type: Sequelize.DECIMAL(10, 2),
      },
      r_multiple_achieved: {
        type: Sequelize.DECIMAL(10, 2),
      },
      trade_duration_minutes: {
        type: Sequelize.INTEGER,
      },
      // Trade Outcome & Objective Review (Section 3)
      outcome: {
        type: Sequelize.ENUM('Win', 'Loss', 'Breakeven', 'Pending'),
      },
      exit_reason_tag: {
        type: Sequelize.STRING,
      },
      initial_sl_hit: {
        type: Sequelize.BOOLEAN,
      },
      initial_tp_hit: {
        type: Sequelize.BOOLEAN,
      },
      max_adverse_excursion: {
        type: Sequelize.DECIMAL(10, 4),
      },
      max_adverse_excursion_percentage: {
        type: Sequelize.DECIMAL(6, 4),
      },
      max_favorable_excursion: {
        type: Sequelize.DECIMAL(10, 4),
      },
      max_favorable_excursion_percentage: {
        type: Sequelize.DECIMAL(6, 4),
      },
      // Psychological & Behavioral Review (Section 4)
      confidence_in_execution: {
        type: Sequelize.INTEGER,
      },
      dominant_emotions_pre_trade: {
        type: Sequelize.JSONB,
      },
      dominant_emotions_during_trade: {
        type: Sequelize.JSONB,
      },
      focus_level_during_trade: {
        type: Sequelize.INTEGER,
      },
      followed_pre_trade_plan: {
        type: Sequelize.BOOLEAN,
      },
      deviation_type: {
        type: Sequelize.ENUM('Entry', 'StopLoss', 'TargetProfit', 'PositionSize', 'EarlyExit', 'LateExit', 'Other', 'None'),
      },
      reason_for_deviation: {
        type: Sequelize.TEXT,
      },
      impulse_action_taken: {
        type: Sequelize.BOOLEAN,
      },
      impulse_action_description: {
        type: Sequelize.TEXT,
      },
      hesitation_on: {
        type: Sequelize.ENUM('None', 'Entry', 'Exit', 'Both'),
      },
      reason_for_hesitation: {
        type: Sequelize.TEXT,
      },
      traded_pnl_instead_of_plan: {
        type: Sequelize.BOOLEAN,
      },
      dominant_emotions_post_trade: {
        type: Sequelize.JSONB,
      },
      satisfaction_with_execution: {
        type: Sequelize.INTEGER,
      },
      external_stressors_impact: {
        type: Sequelize.BOOLEAN,
      },
      general_psychology_notes: {
        type: Sequelize.TEXT,
      },
      // Analysis, Learning & Improvement (Section 5)
      what_went_well: {
        type: Sequelize.TEXT,
      },
      what_went_wrong: {
        type: Sequelize.TEXT,
      },
      primary_mistake_tags: {
        type: Sequelize.JSONB,
      },
      root_cause_of_mistakes: {
        type: Sequelize.TEXT,
      },
      key_lesson_learned: {
        type: Sequelize.TEXT,
      },
      actionable_improvement: {
        type: Sequelize.TEXT,
      },
      overall_trade_rating: {
        type: Sequelize.INTEGER,
      },
      additional_notes: {
        type: Sequelize.TEXT,
      },
      external_analysis_link: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('trade_journal_entries', ['user_id']);
    await queryInterface.addIndex('trade_journal_entries', ['execution_date']);
    await queryInterface.addIndex('trade_journal_entries', ['instrument']);
    await queryInterface.addIndex('trade_journal_entries', ['outcome']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trade_journal_entries');
  },
};
