/**
 * Stock Alert Sectors seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if sectors already exist to avoid duplicates
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_sectors');
    if (results[0].count > 0) {
      console.log('Sectors already exist, skipping seeder');
      return;
    }
    
    await queryInterface.bulkInsert('st_sectors', [
      {
        code: 'AGRI',
        name: 'Agricultural',
        description: 'Companies involved in agriculture, farming, and agricultural products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'APPR',
        name: 'Apparel & Accessories',
        description: 'Companies involved in clothing, footwear, and fashion accessories',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'AUTO',
        name: 'Automobile & Ancillaries',
        description: 'Companies involved in automobile manufacturing and related components',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BANK',
        name: 'Banking',
        description: 'Banks and banking institutions',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'COND',
        name: 'Consumer Durables',
        description: 'Companies producing consumer durable goods',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'DMAT',
        name: 'Derived Materials',
        description: 'Companies involved in processed and derived materials',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'ENRG',
        name: 'Energy',
        description: 'Companies involved in energy production and distribution',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'FIN',
        name: 'Financial',
        description: 'Financial services and investment companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'FMCG',
        name: 'FMCG',
        description: 'Fast-moving consumer goods companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'HLTH',
        name: 'Healthcare',
        description: 'Companies involved in healthcare services and products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'HOSP',
        name: 'Hospitality & Travel',
        description: 'Companies in hospitality, travel, and tourism industry',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'INDP',
        name: 'Industrial Products',
        description: 'Companies producing industrial equipment and products',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'IND',
        name: 'Industries',
        description: 'Industrial and construction companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'IT',
        name: 'IT Industry',
        description: 'Information technology companies and services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'LOGI',
        name: 'Logistics & Freight',
        description: 'Companies involved in logistics and freight services',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'MEDA',
        name: 'Media & Entertainment',
        description: 'Companies in media, entertainment, and broadcasting',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'OTHR',
        name: 'Others',
        description: 'Other miscellaneous companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'RMAT',
        name: 'Raw Material',
        description: 'Companies involved in raw material extraction and processing',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TCOM',
        name: 'Tele-Communication',
        description: 'Telecommunication service providers and equipment companies',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXT',
        name: 'Textile Industry',
        description: 'Companies involved in textile manufacturing and related services',
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
