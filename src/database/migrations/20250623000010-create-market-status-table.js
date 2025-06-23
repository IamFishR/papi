'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('st_market_status', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true,
      },
      advances: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      declines: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      unchanged: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      market_status: {
        type: Sequelize.STRING(50),
        defaultValue: 'Unknown',
      },
      last_updated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      raw_data: {
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

    // Add index for faster date-based lookups
    await queryInterface.addIndex('st_market_status', ['date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('st_market_status');
  }
};
