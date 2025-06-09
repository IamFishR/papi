'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // For MySQL, we need to modify the column type directly
    return queryInterface.sequelize.query(`
      ALTER TABLE trade_journal_entries 
      MODIFY COLUMN asset_class ENUM('Equity', 'Stock', 'Crypto', 'Forex', 'Futures', 'Options', 'Other');
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to the original enum without 'Stock'
    return queryInterface.sequelize.query(`
      ALTER TABLE trade_journal_entries 
      MODIFY COLUMN asset_class ENUM('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other');
    `);
  }
};
