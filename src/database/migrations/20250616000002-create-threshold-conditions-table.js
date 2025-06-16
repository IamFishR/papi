/**
 * Stock Alert Threshold Conditions migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_threshold_conditions', {
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
    await queryInterface.bulkInsert('st_threshold_conditions', [
      {
        name: 'above',
        description: 'Value is above the threshold',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'below',
        description: 'Value is below the threshold',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'crosses_above',
        description: 'Value crosses above the threshold',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'crosses_below',
        description: 'Value crosses below the threshold',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_threshold_conditions');
  },
};
