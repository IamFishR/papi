/**
 * Stock Alert Exchanges seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing exchange codes to avoid duplicates
    const [existingExchanges] = await queryInterface.sequelize.query('SELECT code FROM st_exchanges');
    const existingCodes = existingExchanges.map(ex => ex.code);
    
    console.log(`Found ${existingCodes.length} existing exchanges: ${existingCodes.join(', ')}`);
    
    const exchangesToInsert = [];
    
    // Define all exchanges
    const allExchanges = [
      {
        code: 'NSE',
        name: 'National Stock Exchange of India',
        country: 'India',
        currency_code: 'INR',
        timezone: 'Asia/Kolkata',
        opening_time: '09:15:00',
        closing_time: '15:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Filter out existing exchanges
    allExchanges.forEach(exchange => {
      if (!existingCodes.includes(exchange.code)) {
        exchangesToInsert.push(exchange);
      }
    });

    if (exchangesToInsert.length === 0) {
      console.log('All exchanges already exist, skipping seeder');
      return;
    }

    console.log(`Inserting ${exchangesToInsert.length} new exchanges: ${exchangesToInsert.map(ex => ex.code).join(', ')}`);
    
    await queryInterface.bulkInsert('st_exchanges', exchangesToInsert);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('st_exchanges', null, {});
  }
};
