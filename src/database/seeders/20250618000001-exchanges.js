/**
 * Stock Alert Exchanges seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if exchanges already exist to avoid duplicates
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_exchanges');
    if (results[0].count > 0) {
      console.log('Exchanges already exist, skipping seeder');
      return;
    }
    
    await queryInterface.bulkInsert('st_exchanges', [
      {
        code: 'NASDAQ',
        name: 'National Association of Securities Dealers Automated Quotations',
        country: 'United States',
        currency_code: 'USD',
        timezone: 'America/New_York',
        opening_time: '09:30:00',
        closing_time: '16:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'NYSE',
        name: 'New York Stock Exchange',
        country: 'United States',
        currency_code: 'USD',
        timezone: 'America/New_York',
        opening_time: '09:30:00',
        closing_time: '16:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'LSE',
        name: 'London Stock Exchange',
        country: 'United Kingdom',
        currency_code: 'GBP',
        timezone: 'Europe/London',
        opening_time: '08:00:00',
        closing_time: '16:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TSE',
        name: 'Tokyo Stock Exchange',
        country: 'Japan',
        currency_code: 'JPY',
        timezone: 'Asia/Tokyo',
        opening_time: '09:00:00',
        closing_time: '15:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'SSE',
        name: 'Shanghai Stock Exchange',
        country: 'China',
        currency_code: 'CNY',
        timezone: 'Asia/Shanghai',
        opening_time: '09:30:00',
        closing_time: '15:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TSX',
        name: 'Toronto Stock Exchange',
        country: 'Canada',
        currency_code: 'CAD',
        timezone: 'America/Toronto',
        opening_time: '09:30:00',
        closing_time: '16:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'HKEX',
        name: 'Hong Kong Stock Exchange',
        country: 'Hong Kong',
        currency_code: 'HKD',
        timezone: 'Asia/Hong_Kong',
        opening_time: '09:30:00',
        closing_time: '16:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BSE',
        name: 'Bombay Stock Exchange',
        country: 'India',
        currency_code: 'INR',
        timezone: 'Asia/Kolkata',
        opening_time: '09:15:00',
        closing_time: '15:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'FWB',
        name: 'Frankfurt Stock Exchange',
        country: 'Germany',
        currency_code: 'EUR',
        timezone: 'Europe/Berlin',
        opening_time: '09:00:00',
        closing_time: '17:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'KOSPI',
        name: 'Korea Composite Stock Price Index',
        country: 'South Korea',
        currency_code: 'KRW',
        timezone: 'Asia/Seoul',
        opening_time: '09:00:00',
        closing_time: '15:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'ASX',
        name: 'Australian Securities Exchange',
        country: 'Australia',
        currency_code: 'AUD',
        timezone: 'Australia/Sydney',
        opening_time: '10:00:00',
        closing_time: '16:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'B3',
        name: 'B3 - Brasil Bolsa Balcão',
        country: 'Brazil',
        currency_code: 'BRL',
        timezone: 'America/Sao_Paulo',
        opening_time: '10:00:00',
        closing_time: '17:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // NSE, BSE
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
      },
      {
        code: 'SIX',
        name: 'SIX Swiss Exchange',
        country: 'Switzerland',
        currency_code: 'CHF',
        timezone: 'Europe/Zurich',
        opening_time: '09:00:00',
        closing_time: '17:30:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_exchanges', null, {});
  }
};
