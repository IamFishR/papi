'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get current table structure
      const tableDescription = await queryInterface.describeTable('st_stocks');
      const indexes = await queryInterface.showIndex('st_stocks');
      
      // Add columns only if they don't exist
      const columnsToAdd = [
        {
          name: 'face_value',
          definition: {
            type: Sequelize.DECIMAL(8,2),
            after: 'market_cap',
            comment: 'Par value of shares'
          }
        },
        {
          name: 'issued_size',
          definition: {
            type: Sequelize.BIGINT,
            after: 'face_value',
            comment: 'Total shares issued'
          }
        },
        {
          name: 'listing_date',
          definition: {
            type: Sequelize.DATEONLY,
            after: 'issued_size',
            comment: 'When stock was listed on exchange'
          }
        },
        {
          name: 'is_fno_enabled',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'listing_date',
            comment: 'Futures & Options availability'
          }
        },
        {
          name: 'is_slb_enabled',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'is_fno_enabled',
            comment: 'Securities Lending & Borrowing availability'
          }
        },
        {
          name: 'surveillance_stage',
          definition: {
            type: Sequelize.STRING(50),
            after: 'is_slb_enabled',
            comment: 'Surveillance stage if any (T2T, EWL, etc.)'
          }
        },
        {
          name: 'derivatives_available',
          definition: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'surveillance_stage',
            comment: 'Whether derivatives trading available'
          }
        },
        {
          name: 'tick_size',
          definition: {
            type: Sequelize.DECIMAL(8,2),
            after: 'derivatives_available',
            comment: 'Minimum price movement allowed'
          }
        }
      ];

      // Add columns that don't exist
      for (const column of columnsToAdd) {
        if (!tableDescription[column.name]) {
          await queryInterface.addColumn('st_stocks', column.name, column.definition, { transaction });
        }
      }

      // Add indexes that don't exist
      const indexesToAdd = [
        { columns: ['listing_date'], name: 'idx_st_stocks_listing_date' },
        { columns: ['is_fno_enabled'], name: 'idx_st_stocks_is_fno_enabled' },
        { columns: ['is_slb_enabled'], name: 'idx_st_stocks_is_slb_enabled' },
        { columns: ['derivatives_available'], name: 'idx_st_stocks_derivatives_available' },
        { columns: ['surveillance_stage'], name: 'idx_st_stocks_surveillance_stage' }
      ];

      for (const index of indexesToAdd) {
        const indexExists = indexes.some(existingIndex => existingIndex.name === index.name);
        if (!indexExists) {
          await queryInterface.addIndex('st_stocks', index.columns, {
            name: index.name,
            transaction
          });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove added columns
      const columnsToRemove = [
        'face_value', 'issued_size', 'listing_date', 'is_fno_enabled', 
        'is_slb_enabled', 'surveillance_stage', 'derivatives_available', 'tick_size'
      ];

      for (const column of columnsToRemove) {
        await queryInterface.removeColumn('st_stocks', column, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};