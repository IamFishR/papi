/**
 * Stock Alert Sample Stocks seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if stocks already exist to avoid duplicates
    const [stockResults] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_stocks');
    if (stockResults[0].count > 0) {
      console.log('Sample stocks already exist, skipping seeder');
      return;
    }

    // Get exchange IDs
    const exchanges = await queryInterface.sequelize.query(
      'SELECT id, code FROM st_exchanges',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get sector IDs
    const sectors = await queryInterface.sequelize.query(
      'SELECT id, name FROM st_sectors',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get industry IDs
    const industries = await queryInterface.sequelize.query(
      'SELECT id, name, sector_id FROM st_industries',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get currency IDs
    const currencies = await queryInterface.sequelize.query(
      'SELECT id, code FROM st_currencies',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Map exchange codes to their IDs
    const exchangeMap = {};
    exchanges.forEach(exchange => {
      exchangeMap[exchange.code] = exchange.id;
    });

    // Map sector names to their IDs
    const sectorMap = {};
    sectors.forEach(sector => {
      sectorMap[sector.name] = sector.id;
    });

    // Map industry names to their IDs
    const industryMap = {};
    industries.forEach(industry => {
      industryMap[industry.name] = industry.id;
    });

    // Map currency codes to their IDs
    const currencyMap = {};
    currencies.forEach(currency => {
      currencyMap[currency.code] = currency.id;
    });

    // Verify we have the required currency
    if (!currencyMap['INR']) {
      throw new Error('INR currency not found in database. Please run currency seeder first.');
    }

    // Sample Indian stocks to seed
    await queryInterface.bulkInsert('st_stocks', [
      {
        symbol: 'RELIANCE',
        company_name: 'Reliance Industries Ltd.',
        description: 'Indian multinational conglomerate engaged in petrochemicals, oil & gas, telecom, and retail.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Energy'],
        industry_id: industryMap['Petrochemicals'],
        currency_id: currencyMap['INR'],
        market_cap: 1500000000000,
        pe_ratio: 12.5,
        dividend_yield: 0.5,
        beta: 1.1,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'TCS',
        company_name: 'Tata Consultancy Services Ltd.',
        description: 'Indian multinational IT services and consulting company.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['IT Industry'],
        industry_id: industryMap['IT - Software '],
        currency_id: currencyMap['INR'],
        market_cap: 1200000000000,
        pe_ratio: 28.5,
        dividend_yield: 3.2,
        beta: 0.9,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'HDFCBANK',
        company_name: 'HDFC Bank Ltd.',
        description: 'Indian private sector bank offering banking and financial services.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Banking'],
        industry_id: industryMap['Bank - Private'],
        currency_id: currencyMap['INR'],
        market_cap: 800000000000,
        pe_ratio: 18.2,
        dividend_yield: 1.0,
        beta: 1.0,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'INFY',
        company_name: 'Infosys Ltd.',
        description: 'Indian multinational IT corporation providing business consulting, information technology and outsourcing services.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['IT Industry'],
        industry_id: industryMap['IT - Software '],
        currency_id: currencyMap['INR'],
        market_cap: 700000000000,
        pe_ratio: 24.8,
        dividend_yield: 2.5,
        beta: 0.85,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'HINDUNILVR',
        company_name: 'Hindustan Unilever Ltd.',
        description: 'Indian consumer goods company manufacturing personal care products, foods, and beverages.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['FMCG'],
        industry_id: industryMap['Household & Personal Products'],
        currency_id: currencyMap['INR'],
        market_cap: 500000000000,
        pe_ratio: 55.2,
        dividend_yield: 2.8,
        beta: 0.6,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'ICICIBANK',
        company_name: 'ICICI Bank Ltd.',
        description: 'Indian multinational bank and financial services company.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Banking'],
        industry_id: industryMap['Bank - Private'],
        currency_id: currencyMap['INR'],
        market_cap: 450000000000,
        pe_ratio: 15.8,
        dividend_yield: 0.8,
        beta: 1.2,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'BHARTIARTL',
        company_name: 'Bharti Airtel Ltd.',
        description: 'Indian multinational telecommunications services company.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Tele-Communication'],
        industry_id: industryMap['Telecommunication - Service  Provider'],
        currency_id: currencyMap['INR'],
        market_cap: 400000000000,
        pe_ratio: 32.5,
        dividend_yield: 0.7,
        beta: 1.3,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'KOTAKBANK',
        company_name: 'Kotak Mahindra Bank Ltd.',
        description: 'Indian private sector bank offering commercial banking products and services.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Banking'],
        industry_id: industryMap['Bank - Private'],
        currency_id: currencyMap['INR'],
        market_cap: 320000000000,
        pe_ratio: 20.5,
        dividend_yield: 0.6,
        beta: 1.1,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'LT',
        company_name: 'Larsen & Toubro Ltd.',
        description: 'Indian multinational conglomerate engaged in engineering, construction, and technology.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Industries'],
        industry_id: industryMap['Engineering - Construction'],
        currency_id: currencyMap['INR'],
        market_cap: 280000000000,
        pe_ratio: 26.8,
        dividend_yield: 1.2,
        beta: 1.4,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'HCLTECH',
        company_name: 'HCL Technologies Ltd.',
        description: 'Indian multinational IT services company.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['IT Industry'],
        industry_id: industryMap['IT - Software '],
        currency_id: currencyMap['INR'],
        market_cap: 270000000000,
        pe_ratio: 18.5,
        dividend_yield: 3.5,
        beta: 0.95,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'MARUTI',
        company_name: 'Maruti Suzuki India Ltd.',
        description: 'Indian automobile manufacturer, largest passenger car company in India.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Automobile & Ancillaries'],
        industry_id: industryMap['Automobiles - Passenger Cars'],
        currency_id: currencyMap['INR'],
        market_cap: 250000000000,
        pe_ratio: 28.2,
        dividend_yield: 1.8,
        beta: 1.0,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'SBIN',
        company_name: 'State Bank of India',
        description: 'Indian multinational public sector banking and financial services company.',
        exchange_id: exchangeMap['NSE'],
        sector_id: sectorMap['Banking'],
        industry_id: industryMap['Bank - Public'],
        currency_id: currencyMap['INR'],
        market_cap: 240000000000,
        pe_ratio: 9.5,
        dividend_yield: 4.2,
        beta: 1.3,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('st_stocks', null, {});
  }
};
