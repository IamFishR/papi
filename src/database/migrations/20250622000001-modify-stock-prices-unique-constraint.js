/**
 * Modify stock prices unique constraint to include data_source
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove existing unique constraint
    await queryInterface.removeConstraint('st_stock_prices', 'st_stock_prices_stock_id_price_date_unique');

    // Add new unique constraint that includes data_source
    await queryInterface.addConstraint('st_stock_prices', {
      fields: ['stock_id', 'price_date', 'data_source'],
      type: 'unique',
      name: 'st_stock_prices_stock_id_price_date_data_source_unique',
    });

    // Add index on data_source for better performance
    await queryInterface.addIndex('st_stock_prices', ['data_source']);
  },

  async down(queryInterface, Sequelize) {
    // Remove the new constraint
    await queryInterface.removeConstraint('st_stock_prices', 'st_stock_prices_stock_id_price_date_data_source_unique');
    
    // Remove data_source index
    await queryInterface.removeIndex('st_stock_prices', ['data_source']);

    // Restore original constraint (this might fail if there are duplicate records)
    try {
      await queryInterface.addConstraint('st_stock_prices', {
        fields: ['stock_id', 'price_date'],
        type: 'unique',
        name: 'st_stock_prices_stock_id_price_date_unique',
      });
    } catch (error) {
      console.warn('Could not restore original constraint due to duplicate records:', error.message);
    }
  },
};
