'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create stock index memberships table
      await queryInterface.createTable('st_stock_index_memberships', {
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
        index_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Reference to index',
          references: {
            model: 'st_stock_indices',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        weight: {
          type: Sequelize.DECIMAL(8,4),
          comment: 'Weight of stock in the index (for weighted indices)'
        },
        rank_position: {
          type: Sequelize.INTEGER,
          comment: 'Rank position in the index (1-based)'
        },
        free_float_market_cap: {
          type: Sequelize.BIGINT,
          comment: 'Free float market cap used for index calculation'
        },
        index_shares: {
          type: Sequelize.BIGINT,
          comment: 'Number of shares considered for index calculation'
        },
        added_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Date when stock was added to index'
        },
        removed_date: {
          type: Sequelize.DATEONLY,
          comment: 'Date when stock was removed from index (NULL if still active)'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Whether stock is currently in the index'
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
      
      // Add unique constraint to prevent duplicate memberships
      await queryInterface.addConstraint('st_stock_index_memberships', {
        fields: ['stock_id', 'index_id', 'is_active'],
        type: 'unique',
        name: 'unique_active_membership',
        transaction
      });
      
      // Create indexes for better query performance
      await queryInterface.addIndex('st_stock_index_memberships', ['stock_id'], {
        name: 'idx_st_stock_index_memberships_stock_id',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['index_id'], {
        name: 'idx_st_stock_index_memberships_index_id',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['weight'], {
        name: 'idx_st_stock_index_memberships_weight',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['rank_position'], {
        name: 'idx_st_stock_index_memberships_rank_position',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['added_date'], {
        name: 'idx_st_stock_index_memberships_added_date',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['is_active'], {
        name: 'idx_st_stock_index_memberships_is_active',
        transaction
      });
      
      await queryInterface.addIndex('st_stock_index_memberships', ['index_id', 'is_active', 'rank_position'], {
        name: 'idx_st_stock_index_memberships_active_by_index',
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
      await queryInterface.dropTable('st_stock_index_memberships', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};