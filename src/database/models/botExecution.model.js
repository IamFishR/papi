/**
 * Bot Execution model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BotExecution = sequelize.define('BotExecution', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    executionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'execution_id',
      validate: {
        min: 1,
      },
    },
    botType: {
      type: DataTypes.ENUM('stockBot', 'priceBot', 'fullDataBot'),
      allowNull: false,
      field: 'bot_type',
      validate: {
        isIn: [['stockBot', 'priceBot', 'fullDataBot']],
      },
    },
    executionType: {
      type: DataTypes.ENUM('stocks', 'prices', 'all', 'manual'),
      allowNull: false,
      field: 'execution_type',
      validate: {
        isIn: [['stocks', 'prices', 'all', 'manual']],
      },
    },
    status: {
      type: DataTypes.ENUM('success', 'error', 'partial'),
      allowNull: false,
      validate: {
        isIn: [['success', 'error', 'partial']],
      },
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'started_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration_ms',
      validate: {
        min: 0,
      },
    },
    endpointsProcessed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'endpoints_processed',
      validate: {
        min: 0,
      },
    },
    stocksProcessed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'stocks_processed',
      validate: {
        min: 0,
      },
    },
    stocksCreated: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'stocks_created',
      validate: {
        min: 0,
      },
    },
    stocksUpdated: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'stocks_updated',
      validate: {
        min: 0,
      },
    },
    pricesProcessed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'prices_processed',
      validate: {
        min: 0,
      },
    },
    pricesCreated: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'prices_created',
      validate: {
        min: 0,
      },
    },
    pricesUpdated: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'prices_updated',
      validate: {
        min: 0,
      },
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    errorStack: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_stack',
    },
    nseResults: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'nse_results',
    },
    processingResults: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'processing_results',
    },
    executionSummary: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'execution_summary',
    },
    isManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_manual',
    },
    memoryUsage: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'memory_usage',
    },
  }, {
    tableName: 'st_bot_executions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['bot_type'],
      },
      {
        fields: ['execution_type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['started_at'],
      },
      {
        fields: ['bot_type', 'status'],
      },
      {
        fields: ['bot_type', 'started_at'],
      },
      {
        fields: ['execution_type', 'started_at'],
      },
      {
        fields: ['is_manual'],
      },
      {
        fields: ['bot_type', 'execution_type', 'status'],
      },
    ],
    hooks: {
      beforeCreate: (execution) => {
        if (!execution.startedAt) {
          execution.startedAt = new Date();
        }
        if (execution.completedAt && execution.startedAt && !execution.durationMs) {
          execution.durationMs = execution.completedAt - execution.startedAt;
        }
      },
      beforeUpdate: (execution) => {
        if (execution.completedAt && execution.startedAt && !execution.durationMs) {
          execution.durationMs = execution.completedAt - execution.startedAt;
        }
      },
    },
  });

  // Static methods for analytics and historical data
  BotExecution.getStats = async function(options = {}) {
    const { botType, days = 30, status } = options;
    
    const whereClause = {};
    if (botType) whereClause.botType = botType;
    if (status) whereClause.status = status;
    
    // Add date range filter
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereClause.startedAt = {
        [sequelize.Sequelize.Op.gte]: startDate,
      };
    }

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        'botType',
        'status',
        [sequelize.fn('COUNT', '*'), 'count'],
        [sequelize.fn('AVG', sequelize.col('duration_ms')), 'avgDuration'],
        [sequelize.fn('SUM', sequelize.col('stocks_processed')), 'totalStocks'],
        [sequelize.fn('SUM', sequelize.col('prices_processed')), 'totalPrices'],
        [sequelize.fn('MAX', sequelize.col('started_at')), 'lastExecution'],
      ],
      group: ['botType', 'status'],
      raw: true,
    });

    return stats;
  };

  BotExecution.getSuccessRate = async function(botType, days = 30) {
    const whereClause = { botType };
    
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereClause.startedAt = {
        [sequelize.Sequelize.Op.gte]: startDate,
      };
    }

    const total = await this.count({ where: whereClause });
    const successful = await this.count({ 
      where: { ...whereClause, status: 'success' } 
    });

    return {
      total,
      successful,
      failed: total - successful,
      successRate: total > 0 ? (successful / total) * 100 : 0,
    };
  };

  BotExecution.getRecentExecutions = async function(botType, limit = 10) {
    return this.findAll({
      where: botType ? { botType } : {},
      order: [['startedAt', 'DESC']],
      limit,
      attributes: [
        'id',
        'executionId',
        'botType',
        'executionType',
        'status',
        'startedAt',
        'completedAt',
        'durationMs',
        'stocksProcessed',
        'pricesProcessed',
        'isManual',
      ],
    });
  };

  BotExecution.getExecutionTrends = async function(botType, days = 30) {
    const whereClause = { botType };
    
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereClause.startedAt = {
        [sequelize.Sequelize.Op.gte]: startDate,
      };
    }

    return this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('started_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'executions'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'successful'],
        [sequelize.fn('AVG', sequelize.col('duration_ms')), 'avgDuration'],
        [sequelize.fn('SUM', sequelize.col('stocks_processed')), 'totalStocks'],
        [sequelize.fn('SUM', sequelize.col('prices_processed')), 'totalPrices'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('started_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('started_at')), 'DESC']],
      raw: true,
    });
  };

  BotExecution.getPerformanceMetrics = async function(botType, days = 30) {
    const whereClause = { botType };
    
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereClause.startedAt = {
        [sequelize.Sequelize.Op.gte]: startDate,
      };
    }

    const metrics = await this.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', '*'), 'totalExecutions'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'successfulExecutions'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'error' THEN 1 ELSE 0 END")), 'failedExecutions'],
        [sequelize.fn('AVG', sequelize.col('duration_ms')), 'avgDurationMs'],
        [sequelize.fn('MIN', sequelize.col('duration_ms')), 'minDurationMs'],
        [sequelize.fn('MAX', sequelize.col('duration_ms')), 'maxDurationMs'],
        [sequelize.fn('SUM', sequelize.col('stocks_processed')), 'totalStocksProcessed'],
        [sequelize.fn('SUM', sequelize.col('prices_processed')), 'totalPricesProcessed'],
        [sequelize.fn('MAX', sequelize.col('started_at')), 'lastExecution'],
      ],
      raw: true,
    });

    return metrics;
  };

  // Instance methods
  BotExecution.prototype.markCompleted = function(status = 'success', additionalData = {}) {
    this.completedAt = new Date();
    this.status = status;
    this.durationMs = this.completedAt - this.startedAt;
    
    // Update any additional data
    Object.assign(this, additionalData);
    
    return this.save();
  };

  BotExecution.prototype.markFailed = function(error, additionalData = {}) {
    this.completedAt = new Date();
    this.status = 'error';
    this.durationMs = this.completedAt - this.startedAt;
    this.errorMessage = error.message;
    this.errorStack = error.stack;
    
    // Update any additional data
    Object.assign(this, additionalData);
    
    return this.save();
  };

  BotExecution.prototype.updateProgress = function(progressData) {
    // Update progress fields
    Object.assign(this, progressData);
    return this.save();
  };

  // No associations needed for this model currently
  BotExecution.associate = () => {
    // Future associations can be added here if needed
  };

  return BotExecution;
};