'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // First, remove foreign key constraints from st_stocks table (using actual constraint names)
      await queryInterface.removeConstraint('st_stocks', 'st_stocks_ibfk_2', { transaction });
      await queryInterface.removeConstraint('st_stocks', 'st_stocks_industry_id_foreign_idx', { transaction });
      
      // Remove the sector_id and industry_id columns from st_stocks
      await queryInterface.removeColumn('st_stocks', 'sector_id', { transaction });
      await queryInterface.removeColumn('st_stocks', 'industry_id', { transaction });
      
      // Drop the industries table (has foreign key to sectors)
      await queryInterface.dropTable('st_industries', { transaction });
      
      // Drop the sectors table
      await queryInterface.dropTable('st_sectors', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Recreate sectors table
      await queryInterface.createTable('st_sectors', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        code: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT
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
      
      // Recreate industries table
      await queryInterface.createTable('st_industries', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        code: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false
        },
        sector_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'st_sectors',
            key: 'id'
          },
          onDelete: 'RESTRICT'
        },
        description: {
          type: Sequelize.TEXT
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
      
      // Add back sector_id and industry_id columns to st_stocks
      await queryInterface.addColumn('st_stocks', 'sector_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'st_sectors',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }, { transaction });
      
      await queryInterface.addColumn('st_stocks', 'industry_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'st_industries',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};