/**
 * Detailed Sectors service - handles business logic for detailed sector operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get all detailed sectors with pagination and filtering
 * @param {Object} filter - Filter options (macroSector, sector, industry, basicIndustry)
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated detailed sectors list with metadata
 */
const getDetailedSectors = async (filter, options) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Prepare filter conditions
  const whereConditions = {
    isActive: true
  };
  
  // Apply macro sector filter
  if (filter.macroSector) {
    whereConditions.macroSector = { [Op.like]: `%${filter.macroSector}%` };
  }
  
  // Apply sector filter
  if (filter.sector) {
    whereConditions.sector = { [Op.like]: `%${filter.sector}%` };
  }
  
  // Apply industry filter
  if (filter.industry) {
    whereConditions.industry = { [Op.like]: `%${filter.industry}%` };
  }
  
  // Apply basic industry filter
  if (filter.basicIndustry) {
    whereConditions.basicIndustry = { [Op.like]: `%${filter.basicIndustry}%` };
  }
  
  // Apply search filter across all hierarchy levels
  if (filter.search) {
    whereConditions[Op.or] = [
      { macroSector: { [Op.like]: `%${filter.search}%` } },
      { sector: { [Op.like]: `%${filter.search}%` } },
      { industry: { [Op.like]: `%${filter.search}%` } },
      { basicIndustry: { [Op.like]: `%${filter.search}%` } }
    ];
  }

  // Execute query
  const { rows, count } = await db.DetailedSector.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'macroSector', sortOrder || 'ASC'], ['sector', 'ASC'], ['industry', 'ASC'], ['basicIndustry', 'ASC']]
  });

  // Return paginated result
  return {
    detailedSectors: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get detailed sector by ID
 * @param {number} id - Detailed sector ID
 * @returns {Promise<Object>} Detailed sector with related data
 */
const getDetailedSectorById = async (id) => {
  const detailedSector = await db.DetailedSector.findOne({
    where: { 
      id: id,
      isActive: true 
    }
  });

  if (!detailedSector) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Detailed sector not found');
  }

  return detailedSector;
};

/**
 * Get sector hierarchy - unique values at each level
 * @returns {Promise<Object>} Sector hierarchy structure
 */
const getSectorHierarchy = async () => {
  // Get unique macro sectors
  const macroSectors = await db.DetailedSector.findAll({
    attributes: ['macroSector'],
    where: { isActive: true },
    group: ['macroSector'],
    order: [['macroSector', 'ASC']]
  });

  // Get unique sectors by macro sector
  const sectorsByMacro = await db.DetailedSector.findAll({
    attributes: ['macroSector', 'sector'],
    where: { isActive: true },
    group: ['macroSector', 'sector'],
    order: [['macroSector', 'ASC'], ['sector', 'ASC']]
  });

  // Get unique industries by sector
  const industriesBySector = await db.DetailedSector.findAll({
    attributes: ['macroSector', 'sector', 'industry'],
    where: { isActive: true },
    group: ['macroSector', 'sector', 'industry'],
    order: [['macroSector', 'ASC'], ['sector', 'ASC'], ['industry', 'ASC']]
  });

  // Get unique basic industries by industry
  const basicIndustriesByIndustry = await db.DetailedSector.findAll({
    attributes: ['macroSector', 'sector', 'industry', 'basicIndustry'],
    where: { isActive: true },
    group: ['macroSector', 'sector', 'industry', 'basicIndustry'],
    order: [['macroSector', 'ASC'], ['sector', 'ASC'], ['industry', 'ASC'], ['basicIndustry', 'ASC']]
  });

  // Build hierarchical structure
  const hierarchy = {};
  
  // Initialize macro sectors
  macroSectors.forEach(item => {
    hierarchy[item.macroSector] = {};
  });
  
  // Add sectors
  sectorsByMacro.forEach(item => {
    if (!hierarchy[item.macroSector][item.sector]) {
      hierarchy[item.macroSector][item.sector] = {};
    }
  });
  
  // Add industries
  industriesBySector.forEach(item => {
    if (!hierarchy[item.macroSector][item.sector][item.industry]) {
      hierarchy[item.macroSector][item.sector][item.industry] = [];
    }
  });
  
  // Add basic industries
  basicIndustriesByIndustry.forEach(item => {
    hierarchy[item.macroSector][item.sector][item.industry].push(item.basicIndustry);
  });

  return {
    hierarchy,
    stats: {
      totalMacroSectors: macroSectors.length,
      totalSectors: sectorsByMacro.length,
      totalIndustries: industriesBySector.length,
      totalBasicIndustries: basicIndustriesByIndustry.length
    }
  };
};

/**
 * Get stocks for a detailed sector
 * @param {number} sectorId - Detailed sector ID
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated stocks list for detailed sector
 */
const getStocksByDetailedSector = async (sectorId, options = {}) => {
  const { limit = 50, page = 1, sortBy = 'symbol', sortOrder = 'ASC' } = options;
  const offset = (page - 1) * limit;

  // Verify detailed sector exists
  const detailedSector = await getDetailedSectorById(sectorId);

  const { rows, count } = await db.Stock.findAndCountAll({
    where: { 
      sectorDetailedId: sectorId,
      isActive: true 
    },
    include: [
      { model: db.Exchange, as: 'exchange' },
      { model: db.Currency, as: 'currency' }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

  return {
    detailedSector,
    stocks: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Create a new detailed sector
 * @param {Object} sectorData - Detailed sector data to create
 * @returns {Promise<Object>} Created detailed sector
 */
const createDetailedSector = async (sectorData) => {
  // Check if combination already exists
  const existingSector = await db.DetailedSector.findOne({
    where: {
      macroSector: sectorData.macroSector,
      sector: sectorData.sector,
      industry: sectorData.industry,
      basicIndustry: sectorData.basicIndustry
    }
  });
  
  if (existingSector) {
    throw new ApiError(StatusCodes.CONFLICT, 'Detailed sector combination already exists');
  }
  
  // Create the detailed sector
  const detailedSector = await db.DetailedSector.create(sectorData);
  
  return detailedSector;
};

/**
 * Update an existing detailed sector
 * @param {number} id - Detailed sector ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated detailed sector
 */
const updateDetailedSector = async (id, updateData) => {
  // Check if detailed sector exists
  const detailedSector = await getDetailedSectorById(id);
  
  // Check if updated combination already exists (excluding current record)
  if (updateData.macroSector || updateData.sector || updateData.industry || updateData.basicIndustry) {
    const checkData = {
      macroSector: updateData.macroSector || detailedSector.macroSector,
      sector: updateData.sector || detailedSector.sector,
      industry: updateData.industry || detailedSector.industry,
      basicIndustry: updateData.basicIndustry || detailedSector.basicIndustry
    };
    
    const existingSector = await db.DetailedSector.findOne({
      where: {
        ...checkData,
        id: { [Op.ne]: id }
      }
    });
    
    if (existingSector) {
      throw new ApiError(StatusCodes.CONFLICT, 'Detailed sector combination already exists');
    }
  }
  
  // Update the detailed sector
  await detailedSector.update(updateData);
  
  return detailedSector;
};

/**
 * Soft delete a detailed sector
 * @param {number} id - Detailed sector ID
 * @returns {Promise<Object>} Deleted detailed sector
 */
const deleteDetailedSector = async (id) => {
  // Check if detailed sector exists
  const detailedSector = await getDetailedSectorById(id);
  
  // Check if there are stocks associated with this detailed sector
  const associatedStocks = await db.Stock.count({
    where: { 
      sectorDetailedId: id,
      isActive: true 
    }
  });
  
  if (associatedStocks > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST, 
      `Cannot delete detailed sector. ${associatedStocks} active stocks are associated with it.`
    );
  }
  
  // Soft delete by setting isActive to false
  await detailedSector.update({ isActive: false });
  
  return detailedSector;
};

/**
 * Get detailed sectors by macro sector
 * @param {string} macroSector - Macro sector name
 * @returns {Promise<Array>} List of detailed sectors in macro sector
 */
const getDetailedSectorsByMacroSector = async (macroSector) => {
  const detailedSectors = await db.DetailedSector.findAll({
    where: { 
      macroSector: macroSector,
      isActive: true 
    },
    order: [['sector', 'ASC'], ['industry', 'ASC'], ['basicIndustry', 'ASC']]
  });

  return detailedSectors;
};

/**
 * Search detailed sectors by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Search results with pagination
 */
const searchDetailedSectors = async (keyword, options = {}) => {
  const { limit = 50, page = 1 } = options;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.DetailedSector.findAndCountAll({
    where: {
      isActive: true,
      [Op.or]: [
        { macroSector: { [Op.like]: `%${keyword}%` } },
        { sector: { [Op.like]: `%${keyword}%` } },
        { industry: { [Op.like]: `%${keyword}%` } },
        { basicIndustry: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ]
    },
    limit,
    offset,
    order: [['macroSector', 'ASC'], ['sector', 'ASC'], ['industry', 'ASC'], ['basicIndustry', 'ASC']]
  });

  return {
    detailedSectors: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

module.exports = {
  getDetailedSectors,
  getDetailedSectorById,
  getSectorHierarchy,
  getStocksByDetailedSector,
  createDetailedSector,
  updateDetailedSector,
  deleteDetailedSector,
  getDetailedSectorsByMacroSector,
  searchDetailedSectors
};