/**
 * Drop bot-related tables migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop bot tables if they exist
    const tables = [
      'st_bot_schedules',
      'st_bot_logs', 
      'st_bot_configs',
      'st_bot_executions'
    ];

    for (const table of tables) {
      try {
        await queryInterface.dropTable(table);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} does not exist or already dropped`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration is not reversible as we're removing bot functionality entirely
    console.log('This migration cannot be reversed - bot functionality has been removed');
  }
};