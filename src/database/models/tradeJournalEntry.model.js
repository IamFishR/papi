/**
 * Trade Journal Entry model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TradeJournalEntry = sequelize.define('TradeJournalEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    tradeIdString: {
      type: DataTypes.STRING,
      field: 'trade_id_string',
    },
    executionDate: {
      type: DataTypes.DATEONLY,
      field: 'execution_date',
    },
    instrument: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assetClass: {
      type: DataTypes.ENUM('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other'),
      field: 'asset_class',
    },
    direction: {
      type: DataTypes.ENUM('Long', 'Short'),
      allowNull: false,
    },
    // Pre-Trade Plan & Hypothesis (Section 0)
    planDateTime: {
      type: DataTypes.DATE,
      field: 'plan_date_time',
    },
    instrumentsWatched: {
      type: DataTypes.JSONB,
      field: 'instruments_watched',
    },
    marketContextBias: {
      type: DataTypes.ENUM('Bullish', 'Bearish', 'Neutral', 'Range-bound', 'Uncertain'),
      field: 'market_context_bias',
    },
    tradeThesisCatalyst: {
      type: DataTypes.TEXT,
      field: 'trade_thesis_catalyst',
    },
    setupConditions: {
      type: DataTypes.JSONB,
      field: 'setup_conditions',
    },
    plannedEntryZonePrice: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'planned_entry_zone_price',
    },
    plannedStopLossPrice: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'planned_stop_loss_price',
    },
    plannedTargetPrices: {
      type: DataTypes.JSONB,
      field: 'planned_target_prices',
    },
    plannedPositionSizeValue: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'planned_position_size_value',
    },
    plannedPositionSizeType: {
      type: DataTypes.ENUM('Shares/Units', 'Percentage Account', 'Fixed Risk Amount', 'Lots'),
      field: 'planned_position_size_type',
    },
    calculatedMaxRiskOnPlan: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'calculated_max_risk_on_plan',
    },
    calculatedPotentialRewardTp1: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'calculated_potential_reward_tp1',
    },
    plannedRiskRewardRatioTp1: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'planned_risk_reward_ratio_tp1',
    },
    confidenceInPlan: {
      type: DataTypes.INTEGER,
      field: 'confidence_in_plan',
    },
    invalidationConditions: {
      type: DataTypes.TEXT,
      field: 'invalidation_conditions',
    },
    // Trade Execution Metadata (Section 1)
    strategyTags: {
      type: DataTypes.JSONB,
      field: 'strategy_tags',
    },
    primaryAnalysisTimeframe: {
      type: DataTypes.STRING,
      field: 'primary_analysis_timeframe',
    },
    secondaryAnalysisTimeframes: {
      type: DataTypes.JSONB,
      field: 'secondary_analysis_timeframes',
    },
    screenshotSetupUrl: {
      type: DataTypes.STRING,
      field: 'screenshot_setup_url',
    },
    // Entry & Exit Execution Details (Section 2)
    entryDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'entry_date_time',
    },
    actualEntryPrice: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      field: 'actual_entry_price',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    feesEntry: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'fees_entry',
    },
    screenshotEntryUrl: {
      type: DataTypes.STRING,
      field: 'screenshot_entry_url',
    },
    exitDateTime: {
      type: DataTypes.DATE,
      field: 'exit_date_time',
    },
    actualExitPrice: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'actual_exit_price',
    },
    feesExit: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'fees_exit',
    },
    screenshotExitUrl: {
      type: DataTypes.STRING,
      field: 'screenshot_exit_url',
    },
    totalQuantityTraded: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'total_quantity_traded',
    },
    averageEntryPrice: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'average_entry_price',
    },
    averageExitPrice: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'average_exit_price',
    },
    grossPnlPerUnit: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'gross_pnl_per_unit',
    },
    grossPnl: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'gross_pnl',
    },
    totalFees: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'total_fees',
    },
    netPnl: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'net_pnl',
    },
    actualInitialRisk: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'actual_initial_risk',
    },
    rMultipleAchieved: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'r_multiple_achieved',
    },
    tradeDurationMinutes: {
      type: DataTypes.INTEGER,
      field: 'trade_duration_minutes',
    },
    // Trade Outcome & Objective Review (Section 3)
    outcome: {
      type: DataTypes.ENUM('Win', 'Loss', 'Breakeven', 'Pending'),
    },
    exitReasonTag: {
      type: DataTypes.STRING,
      field: 'exit_reason_tag',
    },
    initialSlHit: {
      type: DataTypes.BOOLEAN,
      field: 'initial_sl_hit',
    },
    initialTpHit: {
      type: DataTypes.BOOLEAN,
      field: 'initial_tp_hit',
    },
    maxAdverseExcursion: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'max_adverse_excursion',
    },
    maxAdverseExcursionPercentage: {
      type: DataTypes.DECIMAL(6, 4),
      field: 'max_adverse_excursion_percentage',
    },
    maxFavorableExcursion: {
      type: DataTypes.DECIMAL(10, 4),
      field: 'max_favorable_excursion',
    },
    maxFavorableExcursionPercentage: {
      type: DataTypes.DECIMAL(6, 4),
      field: 'max_favorable_excursion_percentage',
    },
    // Psychological & Behavioral Review (Section 4)
    confidenceInExecution: {
      type: DataTypes.INTEGER,
      field: 'confidence_in_execution',
    },
    dominantEmotionsPreTrade: {
      type: DataTypes.JSONB,
      field: 'dominant_emotions_pre_trade',
    },
    dominantEmotionsDuringTrade: {
      type: DataTypes.JSONB,
      field: 'dominant_emotions_during_trade',
    },
    focusLevelDuringTrade: {
      type: DataTypes.INTEGER,
      field: 'focus_level_during_trade',
    },
    followedPreTradePlan: {
      type: DataTypes.BOOLEAN,
      field: 'followed_pre_trade_plan',
    },
    deviationType: {
      type: DataTypes.ENUM('Entry', 'StopLoss', 'TargetProfit', 'PositionSize', 'EarlyExit', 'LateExit', 'Other', 'None'),
      field: 'deviation_type',
    },
    reasonForDeviation: {
      type: DataTypes.TEXT,
      field: 'reason_for_deviation',
    },
    impulseActionTaken: {
      type: DataTypes.BOOLEAN,
      field: 'impulse_action_taken',
    },
    impulseActionDescription: {
      type: DataTypes.TEXT,
      field: 'impulse_action_description',
    },
    hesitationOn: {
      type: DataTypes.ENUM('None', 'Entry', 'Exit', 'Both'),
      field: 'hesitation_on',
    },
    reasonForHesitation: {
      type: DataTypes.TEXT,
      field: 'reason_for_hesitation',
    },
    tradedPnlInsteadOfPlan: {
      type: DataTypes.BOOLEAN,
      field: 'traded_pnl_instead_of_plan',
    },
    dominantEmotionsPostTrade: {
      type: DataTypes.JSONB,
      field: 'dominant_emotions_post_trade',
    },
    satisfactionWithExecution: {
      type: DataTypes.INTEGER,
      field: 'satisfaction_with_execution',
    },
    externalStressorsImpact: {
      type: DataTypes.BOOLEAN,
      field: 'external_stressors_impact',
    },
    generalPsychologyNotes: {
      type: DataTypes.TEXT,
      field: 'general_psychology_notes',
    },
    // Analysis, Learning & Improvement (Section 5)
    whatWentWell: {
      type: DataTypes.TEXT,
      field: 'what_went_well',
    },
    whatWentWrong: {
      type: DataTypes.TEXT,
      field: 'what_went_wrong',
    },
    primaryMistakeTags: {
      type: DataTypes.JSONB,
      field: 'primary_mistake_tags',
    },
    rootCauseOfMistakes: {
      type: DataTypes.TEXT,
      field: 'root_cause_of_mistakes',
    },
    keyLessonLearned: {
      type: DataTypes.TEXT,
      field: 'key_lesson_learned',
    },
    actionableImprovement: {
      type: DataTypes.TEXT,
      field: 'actionable_improvement',
    },
    overallTradeRating: {
      type: DataTypes.INTEGER,
      field: 'overall_trade_rating',
    },
    additionalNotes: {
      type: DataTypes.TEXT,
      field: 'additional_notes',
    },
    externalAnalysisLink: {
      type: DataTypes.STRING,
      field: 'external_analysis_link',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true,
    },
  }, {
    tableName: 'trade_journal_entries',
    timestamps: true,
    underscored: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['execution_date'],
      },
      {
        fields: ['instrument'],
      },
      {
        fields: ['outcome'],
      },
    ],
  });

  TradeJournalEntry.associate = (models) => {
    // TradeJournalEntry belongs to a User
    TradeJournalEntry.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return TradeJournalEntry;
};
