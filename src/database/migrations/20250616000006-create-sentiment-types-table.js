/**
 * Stock Alert Sentiment Types migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_sentiment_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Seed initial data
    await queryInterface.bulkInsert('st_sentiment_types', [
      {
        name: 'positive',
        description: 'Positive sentiment',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'negative',
        description: 'Negative sentiment',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'neutral',
        description: 'Neutral sentiment',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'any',
        description: 'Any sentiment type',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_sentiment_types');
  },
};
