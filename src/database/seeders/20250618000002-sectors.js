/**
 * Stock Alert Sectors seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {    await queryInterface.bulkInsert('st_sectors', [
      {
        code: 'TECH',
        name: 'Technology',
        description: 'Companies focused on creating new technologies or providing technology services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'HLTH',
        name: 'Healthcare',
        description: 'Companies involved in medical services, equipment, drugs, and insurance',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'FIN',
        name: 'Financials',
        description: 'Banks, insurance companies, investment firms, and real estate',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'COND',
        name: 'Consumer Discretionary',
        description: 'Non-essential consumer products and services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'CONS',
        name: 'Consumer Staples',
        description: 'Essential consumer products and services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'IND',
        name: 'Industrials',
        description: 'Manufacturing, aerospace, defense, machinery, and transportation',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'ENRG',
        name: 'Energy',
        description: 'Oil, gas, renewable energy, and energy equipment',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'MAT',
        name: 'Materials',
        description: 'Chemicals, mining, forestry, and construction materials',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'UTIL',
        name: 'Utilities',
        description: 'Electric, gas, and water utilities',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'REAL',
        name: 'Real Estate',
        description: 'Real estate investment trusts (REITs) and real estate management and development',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TCOM',
        name: 'Telecommunication Services',
        description: 'Communication services providers and media companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_sectors', null, {});
  }
};
