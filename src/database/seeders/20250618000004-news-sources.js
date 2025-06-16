/**
 * Stock Alert News Sources seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {    await queryInterface.bulkInsert('st_news_sources', [
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com',
        api_identifier: 'bloomberg',
        reliability_score: 9.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Reuters',
        url: 'https://www.reuters.com',
        api_identifier: 'reuters',
        reliability_score: 9.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Wall Street Journal',
        url: 'https://www.wsj.com',
        api_identifier: 'wsj',
        reliability_score: 8.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'CNBC',
        url: 'https://www.cnbc.com',
        api_identifier: 'cnbc',
        reliability_score: 8.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Financial Times',
        url: 'https://www.ft.com',
        api_identifier: 'financial-times',
        reliability_score: 8.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com',
        api_identifier: 'yahoo-finance',
        reliability_score: 7.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'MarketWatch',
        url: 'https://www.marketwatch.com',
        api_identifier: 'marketwatch',
        reliability_score: 7.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Seeking Alpha',
        url: 'https://seekingalpha.com',
        api_identifier: 'seeking-alpha',
        reliability_score: 7.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Barron\'s',
        url: 'https://www.barrons.com',
        api_identifier: 'barrons',
        reliability_score: 8.0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'The Economist',
        url: 'https://www.economist.com',
        api_identifier: 'economist',
        reliability_score: 8.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Morningstar',
        url: 'https://www.morningstar.com',
        api_identifier: 'morningstar',
        reliability_score: 8.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Investor\'s Business Daily',
        url: 'https://www.investors.com',
        api_identifier: 'investors-business-daily',
        reliability_score: 7.5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_news_sources', null, {});
  }
};
