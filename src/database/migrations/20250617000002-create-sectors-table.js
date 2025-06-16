/**
 * Stock Alert Sectors migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_sectors', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Seed initial data with major market sectors
    await queryInterface.bulkInsert('st_sectors', [
      {
        code: 'TECH',
        name: 'Information Technology',
        description: 'Companies involved in technology development, software, hardware, semiconductors, and IT services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'HEALTH',
        name: 'Healthcare',
        description: 'Companies involved in medical services, pharmaceuticals, healthcare equipment, and biotechnology',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'FIN',
        name: 'Financials',
        description: 'Companies providing financial services, banking, insurance, and investment management',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CONS_DISC',
        name: 'Consumer Discretionary',
        description: 'Companies selling non-essential goods and services that are sensitive to economic cycles',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CONS_STPL',
        name: 'Consumer Staples',
        description: 'Companies selling essential consumer products and services that are less sensitive to economic cycles',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'ENERGY',
        name: 'Energy',
        description: 'Companies involved in the exploration, production, and distribution of energy resources',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'UTIL',
        name: 'Utilities',
        description: 'Companies providing electricity, water, natural gas, and other utility services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'REAL_EST',
        name: 'Real Estate',
        description: 'Companies involved in real estate development, management, and investment trusts (REITs)',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'IND',
        name: 'Industrials',
        description: 'Companies involved in manufacturing, aerospace, defense, construction, and transportation',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'MAT',
        name: 'Materials',
        description: 'Companies involved in the discovery, development, and processing of raw materials',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'COMM',
        name: 'Communication Services',
        description: 'Companies involved in telecommunication, media, entertainment, and interactive media services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_sectors');
  },
};
