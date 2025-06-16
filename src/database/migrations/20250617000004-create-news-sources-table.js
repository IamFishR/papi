/**
 * Stock Alert News Sources migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_news_sources', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      api_identifier: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Identifier used in external news APIs',
      },
      reliability_score: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
        comment: 'Score from 0-10 indicating reliability of news source',
        validate: {
          min: 0,
          max: 10
        }
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Seed initial data with major financial news sources
    await queryInterface.bulkInsert('st_news_sources', [
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com',
        api_identifier: 'bloomberg',
        reliability_score: 9.0,
        logo_url: '/images/news/bloomberg.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'CNBC',
        url: 'https://www.cnbc.com',
        api_identifier: 'cnbc',
        reliability_score: 8.5,
        logo_url: '/images/news/cnbc.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Wall Street Journal',
        url: 'https://www.wsj.com',
        api_identifier: 'wsj',
        reliability_score: 9.2,
        logo_url: '/images/news/wsj.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Financial Times',
        url: 'https://www.ft.com',
        api_identifier: 'financial-times',
        reliability_score: 9.0,
        logo_url: '/images/news/ft.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Reuters',
        url: 'https://www.reuters.com',
        api_identifier: 'reuters',
        reliability_score: 9.3,
        logo_url: '/images/news/reuters.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com',
        api_identifier: 'yahoo-finance',
        reliability_score: 7.8,
        logo_url: '/images/news/yahoo-finance.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'MarketWatch',
        url: 'https://www.marketwatch.com',
        api_identifier: 'marketwatch',
        reliability_score: 8.0,
        logo_url: '/images/news/marketwatch.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Seeking Alpha',
        url: 'https://seekingalpha.com',
        api_identifier: 'seeking-alpha',
        reliability_score: 7.5,
        logo_url: '/images/news/seeking-alpha.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Motley Fool',
        url: 'https://www.fool.com',
        api_identifier: 'motley-fool',
        reliability_score: 7.0,
        logo_url: '/images/news/motley-fool.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Barron\'s',
        url: 'https://www.barrons.com',
        api_identifier: 'barrons',
        reliability_score: 8.7,
        logo_url: '/images/news/barrons.png',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_news_sources');
  },
};
