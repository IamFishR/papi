'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create valuation metrics table
      await queryInterface.createTable('st_valuation_metrics', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        stock_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Reference to stock',
          references: {
            model: 'st_stocks',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        metric_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Date for which metrics are calculated'
        },
        sector_pe: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Sector Price-to-Earnings ratio'
        },
        symbol_pe: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Stock Price-to-Earnings ratio'
        },
        sector_pb: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Sector Price-to-Book ratio'
        },
        symbol_pb: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Stock Price-to-Book ratio'
        },
        price_to_sales: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Price-to-Sales ratio'
        },
        enterprise_value: {
          type: Sequelize.BIGINT,
          comment: 'Enterprise Value'
        },
        ev_to_ebitda: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'EV to EBITDA ratio'
        },
        roe: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Return on Equity percentage'
        },
        roa: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Return on Assets percentage'
        },
        debt_to_equity: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Debt-to-Equity ratio'
        },
        current_ratio: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Current Ratio'
        },
        quick_ratio: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Quick Ratio'
        },
        gross_margin: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Gross Margin percentage'
        },
        operating_margin: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Operating Margin percentage'
        },
        net_margin: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Net Margin percentage'
        },
        dividend_payout_ratio: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Dividend Payout Ratio percentage'
        },
        book_value_per_share: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Book Value per Share'
        },
        earnings_per_share: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Earnings per Share'
        },
        revenue_per_share: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Revenue per Share'
        },
        cash_per_share: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Cash per Share'
        },
        free_cash_flow_per_share: {
          type: Sequelize.DECIMAL(12,4),
          comment: 'Free Cash Flow per Share'
        },
        peg_ratio: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'PEG Ratio (PE to Growth)'
        },
        price_to_free_cash_flow: {
          type: Sequelize.DECIMAL(8,2),
          comment: 'Price to Free Cash Flow ratio'
        },
        data_source: {
          type: Sequelize.STRING(50),
          comment: 'Source of the valuation data'
        },
        fiscal_year: {
          type: Sequelize.INTEGER,
          comment: 'Fiscal year for annual metrics'
        },
        quarter: {
          type: Sequelize.STRING(10),
          comment: 'Quarter for quarterly metrics (Q1, Q2, Q3, Q4)'
        },
        is_ttm: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether metrics are Trailing Twelve Months'
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });
      
      // Add unique constraint to prevent duplicate metrics for same stock and date
      await queryInterface.addConstraint('st_valuation_metrics', {
        fields: ['stock_id', 'metric_date', 'fiscal_year', 'quarter'],
        type: 'unique',
        name: 'unique_stock_metric_date',
        transaction
      });
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_valuation_metrics', ['stock_id'], {
        name: 'idx_st_valuation_metrics_stock_id',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['metric_date'], {
        name: 'idx_st_valuation_metrics_metric_date',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['sector_pe'], {
        name: 'idx_st_valuation_metrics_sector_pe',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['symbol_pe'], {
        name: 'idx_st_valuation_metrics_symbol_pe',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['symbol_pb'], {
        name: 'idx_st_valuation_metrics_symbol_pb',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['roe'], {
        name: 'idx_st_valuation_metrics_roe',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['roa'], {
        name: 'idx_st_valuation_metrics_roa',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['fiscal_year'], {
        name: 'idx_st_valuation_metrics_fiscal_year',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['quarter'], {
        name: 'idx_st_valuation_metrics_quarter',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['is_ttm'], {
        name: 'idx_st_valuation_metrics_is_ttm',
        transaction
      });
      
      await queryInterface.addIndex('st_valuation_metrics', ['data_source'], {
        name: 'idx_st_valuation_metrics_data_source',
        transaction
      });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.dropTable('st_valuation_metrics', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};