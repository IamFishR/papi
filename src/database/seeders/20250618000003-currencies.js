/**
 * Stock Alert Currencies seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {    await queryInterface.bulkInsert('st_currencies', [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'Fr',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: '$',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'SEK',
        name: 'Swedish Krona',
        symbol: 'kr',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'KRW',
        name: 'South Korean Won',
        symbol: '₩',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'NOK',
        name: 'Norwegian Krone',
        symbol: 'kr',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
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
