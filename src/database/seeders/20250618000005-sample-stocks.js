/**
 * Stock Alert Sample Stocks seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {    // Get exchange IDs
    const exchanges = await queryInterface.sequelize.query(
      'SELECT id, code FROM st_exchanges',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Get sector IDs
    const sectors = await queryInterface.sequelize.query(
      'SELECT id, name FROM st_sectors',
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
    
    // Map currency codes to their IDs
    const currencyMap = {};
    currencies.forEach(currency => {
      currencyMap[currency.code] = currency.id;
    });
    
    // Sample stocks to seed
    await queryInterface.bulkInsert('st_stocks', [
      {
        symbol: 'AAPL',
        company_name: 'Apple Inc.',        description: 'Technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Information Technology'],
        currency_id: currencyMap['USD'],
        market_cap: 3000000000000,
        pe_ratio: 28.5,
        dividend_yield: 0.5,
        beta: 1.2,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'MSFT',
        company_name: 'Microsoft Corporation',        description: 'Technology company that develops, licenses, and supports software, services, devices, and solutions.',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Information Technology'],
        currency_id: currencyMap['USD'],
        market_cap: 2500000000000,
        pe_ratio: 30.2,
        dividend_yield: 0.8,
        beta: 0.95,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'GOOGL',
        company_name: 'Alphabet Inc.',        description: 'Technology company that provides online advertising services, search engine, cloud computing, software, and hardware.',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Information Technology'],
        currency_id: currencyMap['USD'],
        market_cap: 1800000000000,
        pe_ratio: 25.1,
        dividend_yield: 0,
        beta: 1.05,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'AMZN',
        company_name: 'Amazon.com, Inc.',
        description: 'E-commerce and cloud computing company.',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Consumer Discretionary'],
        currency_id: currencyMap['USD'],
        market_cap: 1700000000000,
        pe_ratio: 60.5,
        dividend_yield: 0,
        beta: 1.15,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'TSLA',
        company_name: 'Tesla, Inc.',
        description: 'Electric vehicle and clean energy company.',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Consumer Discretionary'],
        currency_id: currencyMap['USD'],
        market_cap: 800000000000,
        pe_ratio: 80.2,
        dividend_yield: 0,
        beta: 1.8,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'JPM',
        company_name: 'JPMorgan Chase & Co.',
        description: 'Multinational investment bank and financial services company.',
        exchange_id: exchangeMap['NYSE'],
        sector_id: sectorMap['Financials'],
        currency_id: currencyMap['USD'],
        market_cap: 450000000000,
        pe_ratio: 12.5,
        dividend_yield: 2.8,
        beta: 1.1,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'JNJ',
        company_name: 'Johnson & Johnson',
        description: 'Medical devices, pharmaceutical and consumer packaged goods company.',
        exchange_id: exchangeMap['NYSE'],
        sector_id: sectorMap['Healthcare'],
        currency_id: currencyMap['USD'],
        market_cap: 430000000000,
        pe_ratio: 24.2,
        dividend_yield: 2.5,
        beta: 0.7,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'V',
        company_name: 'Visa Inc.',
        description: 'Multinational financial services corporation.',
        exchange_id: exchangeMap['NYSE'],
        sector_id: sectorMap['Financials'],
        currency_id: currencyMap['USD'],
        market_cap: 490000000000,
        pe_ratio: 32.8,
        dividend_yield: 0.7,
        beta: 0.95,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'PG',
        company_name: 'Procter & Gamble Co.',
        description: 'Consumer goods corporation.',
        exchange_id: exchangeMap['NYSE'],
        sector_id: sectorMap['Consumer Staples'],
        currency_id: currencyMap['USD'],
        market_cap: 350000000000,
        pe_ratio: 25.6,
        dividend_yield: 2.4,
        beta: 0.4,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        symbol: 'NVDA',
        company_name: 'NVIDIA Corporation',        description: 'Technology company that designs graphics processing units (GPUs) and system on a chip units (SoCs).',
        exchange_id: exchangeMap['NASDAQ'],
        sector_id: sectorMap['Information Technology'],
        currency_id: currencyMap['USD'],
        market_cap: 1200000000000,
        pe_ratio: 75.3,
        dividend_yield: 0.05,
        beta: 1.6,
        is_active: true,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('st_stocks', null, {});
  }
};
