'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if we're using PostgreSQL or MySQL
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // For PostgreSQL, we need to use ALTER TYPE for enums
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_trade_journal_entries_asset_class" 
        ADD VALUE IF NOT EXISTS 'Stock';
      `);
    } else if (dialect === 'mysql') {
      // For MySQL, we need to modify the column to include the new enum value
      await queryInterface.changeColumn('trade_journal_entries', 'asset_class', {
        type: Sequelize.ENUM('Equity', 'Debt', 'Commodity', 'Currency', 'Crypto', 'Stock'),
        allowNull: false,
        defaultValue: 'Equity'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support removing enum values easily
    // We would need to recreate the enum type and column
    console.log('Warning: Cannot easily remove enum value in PostgreSQL');
  }
};
