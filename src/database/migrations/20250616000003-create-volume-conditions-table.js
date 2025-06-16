/**
 * Stock Alert Volume Conditions migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_volume_conditions', {
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
    await queryInterface.bulkInsert('st_volume_conditions', [
      {
        name: 'above_average',
        description: 'Volume is above the average',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'below_average',
        description: 'Volume is below the average',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'spike',
        description: 'Volume has a sudden increase',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_volume_conditions');
  },
};
