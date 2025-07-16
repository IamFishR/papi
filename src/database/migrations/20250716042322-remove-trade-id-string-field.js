'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('trade_journal_entries', 'trade_id_string');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('trade_journal_entries', 'trade_id_string', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
