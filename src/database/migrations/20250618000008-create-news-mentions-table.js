/**
 * Stock Alert News Mentions migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_news_mentions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_stocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      news_source_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_news_sources',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sentiment_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'st_sentiment_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      article_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      article_title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      publication_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      sentiment_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      keywords: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_major_news: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Add indexes for improved performance
    await queryInterface.addIndex('st_news_mentions', ['stock_id']);
    await queryInterface.addIndex('st_news_mentions', ['news_source_id']);
    await queryInterface.addIndex('st_news_mentions', ['sentiment_type_id']);
    await queryInterface.addIndex('st_news_mentions', ['publication_date']);
    await queryInterface.addIndex('st_news_mentions', ['is_major_news']);
    await queryInterface.addIndex('st_news_mentions', ['sentiment_score']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_news_mentions');
  },
};
