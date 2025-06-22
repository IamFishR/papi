/**
 * Add industry_id column to stocks table
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('st_stocks', 'industry_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'st_industries',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for performance
    await queryInterface.addIndex('st_stocks', ['industry_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('st_stocks', ['industry_id']);
    await queryInterface.removeColumn('st_stocks', 'industry_id');
  },
};