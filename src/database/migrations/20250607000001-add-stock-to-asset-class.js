'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // For PostgreSQL, we need to use ALTER TYPE for enums
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_trade_journal_entries_asset_class" 
      ADD VALUE IF NOT EXISTS 'Stock';
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support removing enum values easily
    // We would need to recreate the enum type and column
    console.log('Warning: Cannot easily remove enum value in PostgreSQL');
  }
};
