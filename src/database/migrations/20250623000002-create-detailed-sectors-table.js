'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create detailed sectors table with 4-level hierarchy
      await queryInterface.createTable('st_detailed_sectors', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        macro_sector: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Top level sector (e.g., Consumer Discretionary)'
        },
        sector: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Second level sector (e.g., Consumer Services)'
        },
        industry: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Third level industry (e.g., Retailing)'
        },
        basic_industry: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Fourth level basic industry (e.g., Speciality Retail)'
        },
        code: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
          comment: 'Unique sector code for API integration'
        },
        description: {
          type: Sequelize.TEXT,
          comment: 'Detailed description of the sector classification'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_detailed_sectors', ['macro_sector'], {
        name: 'idx_st_detailed_sectors_macro_sector',
        transaction
      });
      
      await queryInterface.addIndex('st_detailed_sectors', ['sector'], {
        name: 'idx_st_detailed_sectors_sector',
        transaction
      });
      
      await queryInterface.addIndex('st_detailed_sectors', ['industry'], {
        name: 'idx_st_detailed_sectors_industry',
        transaction
      });
      
      await queryInterface.addIndex('st_detailed_sectors', ['basic_industry'], {
        name: 'idx_st_detailed_sectors_basic_industry',
        transaction
      });
      
      await queryInterface.addIndex('st_detailed_sectors', ['code'], {
        name: 'idx_st_detailed_sectors_code',
        transaction
      });
      
      await queryInterface.addIndex('st_detailed_sectors', ['is_active'], {
        name: 'idx_st_detailed_sectors_is_active',
        transaction
      });
      
      // Add foreign key column to st_stocks table
      await queryInterface.addColumn('st_stocks', 'detailed_sector_id', {
        type: Sequelize.INTEGER,
        after: 'currency_id',
        references: {
          model: 'st_detailed_sectors',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }, { transaction });
      
      // Create index on the foreign key
      await queryInterface.addIndex('st_stocks', ['detailed_sector_id'], {
        name: 'idx_st_stocks_detailed_sector_id',
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
      // Remove foreign key column from st_stocks
      await queryInterface.removeColumn('st_stocks', 'detailed_sector_id', { transaction });
      
      // Drop the detailed sectors table
      await queryInterface.dropTable('st_detailed_sectors', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};