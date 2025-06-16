/**
 * Stock Alert Risk Tolerance Levels migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_risk_tolerance_levels', {
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
    await queryInterface.bulkInsert('st_risk_tolerance_levels', [
      {
        name: 'conservative',
        description: 'Lower risk, lower potential returns',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'moderate',
        description: 'Balanced risk and potential returns',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'aggressive',
        description: 'Higher risk, higher potential returns',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_risk_tolerance_levels');
  },
};
