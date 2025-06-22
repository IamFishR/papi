/**
 * Stock Alert Currencies seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if currencies already exist to avoid duplicates
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_currencies');
    if (results[0].count > 0) {
      console.log('Currencies already exist, skipping seeder');
      return;
    }
    
    await queryInterface.bulkInsert('st_currencies', [
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_currencies', null, {});
  }
};
