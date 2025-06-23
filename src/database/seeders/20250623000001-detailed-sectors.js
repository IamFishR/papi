/**
 * Detailed Sectors seeders
 * Creates hierarchical sector classification for stocks
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if detailed sectors already exist to avoid duplicates
    const [detailedSectorResults] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_detailed_sectors');
    if (detailedSectorResults[0].count > 0) {
      console.log('Detailed sectors already exist, skipping seeder');
      return;
    }

    // Sample detailed sectors based on Indian market classification
    await queryInterface.bulkInsert('st_detailed_sectors', [
      {
        macro_sector: 'Energy',
        sector: 'Energy',
        industry: 'Oil & Gas',
        basic_industry: 'Petrochemicals',
        code: 'ENERGY_OIL_GAS_PETROCHEMICALS',
        description: 'Companies engaged in petrochemical manufacturing and oil refining',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Information Technology',
        sector: 'Information Technology',
        industry: 'Software & Services',
        basic_industry: 'IT - Software',
        code: 'IT_SOFTWARE_SERVICES',
        description: 'Information technology companies providing software services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Financials',
        sector: 'Financial Services',
        industry: 'Banks',
        basic_industry: 'Bank - Private',
        code: 'FINANCIALS_BANKS_PRIVATE',
        description: 'Private sector banking institutions',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Financials',
        sector: 'Financial Services',
        industry: 'Banks',
        basic_industry: 'Bank - Public',
        code: 'FINANCIALS_BANKS_PUBLIC',
        description: 'Public sector banking institutions',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Consumer Staples',
        sector: 'Consumer Goods',
        industry: 'Household & Personal Products',
        basic_industry: 'Household & Personal Products',
        code: 'CONSUMER_STAPLES_HOUSEHOLD_PERSONAL',
        description: 'Fast-moving consumer goods companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Communication Services',
        sector: 'Telecommunication',
        industry: 'Telecommunications',
        basic_industry: 'Telecommunication - Service Provider',
        code: 'TELECOM_SERVICE_PROVIDER',
        description: 'Telecommunications service providers',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Industrials',
        sector: 'Capital Goods',
        industry: 'Engineering',
        basic_industry: 'Engineering - Construction',
        code: 'INDUSTRIALS_ENGINEERING_CONSTRUCTION',
        description: 'Engineering and construction companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        macro_sector: 'Consumer Discretionary',
        sector: 'Automobile',
        industry: 'Automobiles',
        basic_industry: 'Automobiles - Passenger Cars',
        code: 'AUTO_PASSENGER_CARS',
        description: 'Passenger car manufacturers',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('st_detailed_sectors', null, {});
  }
};