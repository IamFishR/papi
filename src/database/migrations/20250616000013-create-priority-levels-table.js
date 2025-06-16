/**
 * Stock Alert Priority Levels migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_priority_levels', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      level: {
        type: Sequelize.TINYINT,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
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
    await queryInterface.bulkInsert('st_priority_levels', [
      {
        level: 1,
        name: 'Critical',
        description: 'Highest priority, immediate attention required',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        level: 2,
        name: 'High',
        description: 'High priority notifications',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        level: 3,
        name: 'Medium',
        description: 'Standard priority',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        level: 4,
        name: 'Low',
        description: 'Low priority, can be delayed',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        level: 5,
        name: 'Lowest',
        description: 'Lowest priority, informational only',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_priority_levels');
  },
};
