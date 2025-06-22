'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('st_stocks', 'isin', {
      type: Sequelize.STRING(12),
      allowNull: true,
      unique: true
    });

    // Add index for better query performance
    await queryInterface.addIndex('st_stocks', ['isin'], {
      name: 'idx_st_stocks_isin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('st_stocks', 'idx_st_stocks_isin');
    await queryInterface.removeColumn('st_stocks', 'isin');
  }
};