/**
 * Stock Alert Industries seeders
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if industries already exist to avoid duplicates
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM st_industries');
    if (results[0].count > 0) {
      console.log('Industries already exist, skipping seeder');
      return;
    }

    // Get sector IDs to link industries
    const [sectors] = await queryInterface.sequelize.query('SELECT id, name FROM st_sectors');
    const sectorMap = {};
    sectors.forEach(sector => {
      sectorMap[sector.name] = sector.id;
    });

    const industriesToInsert = [];

    // Agricultural sector industries
    if (sectorMap['Agricultural']) {
      const sectorId = sectorMap['Agricultural'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Pesticides & Agrochemicals', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Aquaculture', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Fertilizers', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Floriculture', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Agriculture', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Apparel & Accessories sector industries
    if (sectorMap['Apparel & Accessories']) {
      const sectorId = sectorMap['Apparel & Accessories'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Diamond  &  Jewellery', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Watches & Accessories', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Footwear', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Automobile & Ancillaries sector industries
    if (sectorMap['Automobile & Ancillaries']) {
      const sectorId = sectorMap['Automobile & Ancillaries'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Auto Ancillary', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Automobile Two & Three Wheelers', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Automobiles - Passenger Cars', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Automobiles-Tractors', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Automobiles-Trucks/Lcv', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Bearings', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Tyres & Allied', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Automobiles - Dealers & Distributors', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Cycles', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Banking sector industries
    if (sectorMap['Banking']) {
      const sectorId = sectorMap['Banking'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Bank - Private', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Bank - Public', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Consumer Durables sector industries
    if (sectorMap['Consumer Durables']) {
      const sectorId = sectorMap['Consumer Durables'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Air Conditioners', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Consumer Durables - Domestic Appliances', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Consumer Durables - Electronics', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Retailing', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Educational Institutions', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'e-Commerce', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Derived Materials sector industries
    if (sectorMap['Derived Materials']) {
      const sectorId = sectorMap['Derived Materials'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Abrasives', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Aluminium & Aluminium Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Castings/Forgings', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Ceramics/Marble/Granite/Sanitaryware', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Fasteners', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Forgings', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Glass', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Laminates/Decoratives', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Lubricants', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Packaging ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Paints', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Paper & Paper Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Plastic Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Rubber  Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Steel & Iron Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Wood & Wood Products', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Energy sector industries
    if (sectorMap['Energy']) {
      const sectorId = sectorMap['Energy'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Batteries', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Industrial  Gases & Fuels', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Oil Exploration', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Petrochemicals', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Power Generation/Distribution', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Gas Transmission/Marketing', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Refineries', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Financial sector industries
    if (sectorMap['Financial']) {
      const sectorId = sectorMap['Financial'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Finance - Housing', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance - Investment', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance - NBFC', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance - Stock Broking', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance Term Lending', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Ratings', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Trading', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Insurance', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Index', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'ETF', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance - Others', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'G-Sec', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Finance - Asset Management', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // FMCG sector industries
    if (sectorMap['FMCG']) {
      const sectorId = sectorMap['FMCG'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Breweries & Distilleries', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Cigarettes/Tobacco', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Consumer Food', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Detergents & Soaps', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Household & Personal Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Printing & Stationery', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Sugar', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Tea/Coffee', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Healthcare sector industries
    if (sectorMap['Healthcare']) {
      const sectorId = sectorMap['Healthcare'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Hospital & Healthcare Services', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Medical Equipment/Supplies/Accessories', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Pharmaceuticals & Drugs', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Hospitality & Travel sector industries
    if (sectorMap['Hospitality & Travel']) {
      const sectorId = sectorMap['Hospitality & Travel'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Airlines', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Amusement Parks/Recreation/Club', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Hotel  Resort & Restaurants', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Travel Services', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Industrial Products sector industries
    if (sectorMap['Industrial Products']) {
      const sectorId = sectorMap['Industrial Products'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Compressors / Pumps', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Electric Equipment', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Electrodes & Welding Equipment', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Electronics - Components', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Engineering - Industrial Equipments', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Refractories', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Industries sector industries
    if (sectorMap['Industries']) {
      const sectorId = sectorMap['Industries'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Construction - Real Estate', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Diesel Engines', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Engineering', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Engineering - Construction', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Railways Wagons', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Ship Building', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Defence', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // IT Industry sector industries
    if (sectorMap['IT Industry']) {
      const sectorId = sectorMap['IT Industry'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'IT - Education', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'IT - Hardware', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'IT - Software ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'BPO/ITeS', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'IT - Networking', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Logistics & Freight sector industries
    if (sectorMap['Logistics & Freight']) {
      const sectorId = sectorMap['Logistics & Freight'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Courier  Services', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Logistics', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Shipping', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Port', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Media & Entertainment sector industries
    if (sectorMap['Media & Entertainment']) {
      const sectorId = sectorMap['Media & Entertainment'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Animation', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Film Production  Distribution & Entertainment', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Photographic Products', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'TV Broadcasting & Software Production', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Printing And Publishing', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Others sector industries
    if (sectorMap['Others']) {
      const sectorId = sectorMap['Others'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Diversified', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Miscellaneous', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Unspecified', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Other', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Raw Material sector industries
    if (sectorMap['Raw Material']) {
      const sectorId = sectorMap['Raw Material'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Carbon Black', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Cement & Construction Materials', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Chemicals ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Dyes & Pigments', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Leather', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Metal - Ferrous ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Metal - Non Ferrous ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Mining & Minerals', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Solvent  Extraction', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Steel/Sponge Iron/Pig Iron', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Ferro & Silica Manganese', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Tele-Communication sector industries
    if (sectorMap['Tele-Communication']) {
      const sectorId = sectorMap['Tele-Communication'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Cable', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Transmission Towers / Equipments', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Telecommunication - Equipment', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Telecommunication - Service  Provider', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    // Textile Industry sector industries
    if (sectorMap['Textile Industry']) {
      const sectorId = sectorMap['Textile Industry'];
      industriesToInsert.push(
        { sector_id: sectorId, name: 'Textile ', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Textile - Machinery', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Textile - Manmade  Fibres', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Textile - Spinning', is_active: true, created_at: new Date(), updated_at: new Date() },
        { sector_id: sectorId, name: 'Textile - Weaving', is_active: true, created_at: new Date(), updated_at: new Date() }
      );
    }

    if (industriesToInsert.length > 0) {
      await queryInterface.bulkInsert('st_industries', industriesToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('st_industries', null, {});
  }
};