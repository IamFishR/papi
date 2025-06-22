/**
 * Valuation Metrics service - handles business logic for valuation metrics operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const db = require('../../../database/models');

/**
 * Get valuation metrics for a stock
 * @param {number} stockId - Stock ID
 * @param {string} metricDate - Date for metrics (YYYY-MM-DD)
 * @returns {Promise<Object>} Valuation metrics for the stock
 */
const getValuationMetrics = async (stockId, metricDate = null) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Build where conditions
  const whereConditions = { stockId: stockId };
  
  if (metricDate) {
    whereConditions.metricDate = metricDate;
  } else {
    // Get latest metrics if no date specified
    const latestMetric = await db.ValuationMetric.findOne({
      where: { stockId: stockId },
      order: [['metricDate', 'DESC']]
    });
    
    if (latestMetric) {
      whereConditions.metricDate = latestMetric.metricDate;
    }
  }

  const valuationMetrics = await db.ValuationMetric.findAll({
    where: whereConditions,
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName'],
        include: [
          { model: db.DetailedSector, as: 'detailedSector', attributes: ['macroSector', 'sector'] }
        ]
      }
    ],
    order: [['metricDate', 'DESC'], ['quarter', 'ASC']]
  });

  if (valuationMetrics.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Valuation metrics not found');
  }

  return {
    stock: valuationMetrics[0].stock,
    metrics: valuationMetrics
  };
};

/**
 * Add valuation metrics for a stock
 * @param {Object} metricsData - Valuation metrics data
 * @returns {Promise<Object>} Created valuation metrics
 */
const addValuationMetrics = async (metricsData) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(metricsData.stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Use upsert to handle existing records
  const [metrics, created] = await db.ValuationMetric.upsert(metricsData, {
    returning: true
  });

  return {
    metrics,
    isNew: created
  };
};

/**
 * Get sector valuation comparison
 * @param {number} sectorDetailedId - Detailed sector ID
 * @param {string} metricDate - Date for comparison (YYYY-MM-DD)
 * @returns {Promise<Object>} Sector valuation comparison data
 */
const getSectorValuationComparison = async (sectorDetailedId, metricDate = null) => {
  // Verify sector exists
  const detailedSector = await db.DetailedSector.findByPk(sectorDetailedId);
  if (!detailedSector) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Detailed sector not found');
  }

  // Get stocks in the sector
  const stocks = await db.Stock.findAll({
    where: { 
      sectorDetailedId: sectorDetailedId,
      isActive: true 
    },
    attributes: ['id']
  });

  const stockIds = stocks.map(s => s.id);

  if (stockIds.length === 0) {
    return {
      sector: detailedSector,
      comparison: [],
      summary: null
    };
  }

  // Build query for latest metrics if no date specified
  let whereConditions = { stockId: { [Op.in]: stockIds } };
  
  if (metricDate) {
    whereConditions.metricDate = metricDate;
  } else {
    // Get latest date for each stock
    const latestDates = await db.ValuationMetric.findAll({
      attributes: [
        'stockId',
        [db.sequelize.fn('MAX', db.sequelize.col('metricDate')), 'latestDate']
      ],
      where: { stockId: { [Op.in]: stockIds } },
      group: ['stockId'],
      raw: true
    });

    if (latestDates.length === 0) {
      return {
        sector: detailedSector,
        comparison: [],
        summary: null
      };
    }

    // Build conditions for latest metrics
    whereConditions = {
      [Op.or]: latestDates.map(item => ({
        stockId: item.stockId,
        metricDate: item.latestDate
      }))
    };
  }

  const metrics = await db.ValuationMetric.findAll({
    where: whereConditions,
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName', 'marketCap']
      }
    ],
    order: [['symbolPe', 'ASC']]
  });

  // Calculate sector summary statistics
  const validPE = metrics.filter(m => m.symbolPe !== null).map(m => m.symbolPe);
  const validPB = metrics.filter(m => m.symbolPb !== null).map(m => m.symbolPb);
  const validROE = metrics.filter(m => m.roe !== null).map(m => m.roe);

  const summary = {
    totalStocks: metrics.length,
    avgPE: validPE.length > 0 ? validPE.reduce((a, b) => a + b, 0) / validPE.length : null,
    medianPE: validPE.length > 0 ? validPE.sort((a, b) => a - b)[Math.floor(validPE.length / 2)] : null,
    avgPB: validPB.length > 0 ? validPB.reduce((a, b) => a + b, 0) / validPB.length : null,
    avgROE: validROE.length > 0 ? validROE.reduce((a, b) => a + b, 0) / validROE.length : null,
    minPE: validPE.length > 0 ? Math.min(...validPE) : null,
    maxPE: validPE.length > 0 ? Math.max(...validPE) : null
  };

  return {
    sector: detailedSector,
    comparison: metrics,
    summary
  };
};

/**
 * Get PE comparison for a stock vs its sector and market
 * @param {number} stockId - Stock ID
 * @returns {Promise<Object>} PE comparison data
 */
const getPEComparison = async (stockId) => {
  // Get latest valuation metrics for the stock
  const stockMetrics = await getValuationMetrics(stockId);
  const latestMetric = stockMetrics.metrics[0];

  if (!latestMetric) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No valuation metrics found for stock');
  }

  // Get sector comparison if stock has a detailed sector
  let sectorComparison = null;
  if (stockMetrics.stock.detailedSector) {
    const stock = await db.Stock.findByPk(stockId, {
      include: [{ model: db.DetailedSector, as: 'detailedSector' }]
    });
    
    if (stock.sectorDetailedId) {
      const sectorData = await getSectorValuationComparison(
        stock.sectorDetailedId,
        latestMetric.metricDate
      );
      
      sectorComparison = {
        sectorName: stock.detailedSector.sector,
        sectorAvgPE: sectorData.summary?.avgPE,
        sectorMedianPE: sectorData.summary?.medianPE,
        stockRankInSector: sectorData.comparison
          .sort((a, b) => (a.symbolPe || Infinity) - (b.symbolPe || Infinity))
          .findIndex(m => m.stockId === stockId) + 1
      };
    }
  }

  return {
    stock: stockMetrics.stock,
    stockPE: latestMetric.symbolPe,
    marketPE: latestMetric.sectorPe, // This would be market PE if available
    sectorComparison,
    metricDate: latestMetric.metricDate
  };
};

/**
 * Get ROE leaders in a sector
 * @param {number} sectorDetailedId - Detailed sector ID
 * @param {number} limit - Number of top performers to return
 * @returns {Promise<Array>} Top ROE performers in sector
 */
const getROELeaders = async (sectorDetailedId, limit = 10) => {
  // Verify sector exists
  const detailedSector = await db.DetailedSector.findByPk(sectorDetailedId);
  if (!detailedSector) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Detailed sector not found');
  }

  // Get stocks in the sector
  const stocks = await db.Stock.findAll({
    where: { 
      sectorDetailedId: sectorDetailedId,
      isActive: true 
    },
    attributes: ['id']
  });

  const stockIds = stocks.map(s => s.id);

  if (stockIds.length === 0) {
    return [];
  }

  // Get latest metrics for each stock with valid ROE
  const latestMetrics = await db.sequelize.query(`
    SELECT vm.* FROM st_valuation_metrics vm
    INNER JOIN (
      SELECT stock_id, MAX(metric_date) as latest_date
      FROM st_valuation_metrics 
      WHERE stock_id IN (${stockIds.join(',')}) AND roe IS NOT NULL
      GROUP BY stock_id
    ) latest ON vm.stock_id = latest.stock_id AND vm.metric_date = latest.latest_date
    WHERE vm.roe IS NOT NULL
    ORDER BY vm.roe DESC
    LIMIT ${limit}
  `, {
    type: db.sequelize.QueryTypes.SELECT
  });

  // Get stock details for the results
  const roeLeaders = await Promise.all(
    latestMetrics.map(async (metric) => {
      const stock = await db.Stock.findByPk(metric.stock_id, {
        attributes: ['symbol', 'companyName', 'marketCap']
      });
      
      return {
        stock,
        roe: metric.roe,
        pe: metric.symbol_pe,
        pb: metric.symbol_pb,
        metricDate: metric.metric_date
      };
    })
  );

  return roeLeaders;
};

/**
 * Get historical valuation metrics for a stock
 * @param {number} stockId - Stock ID
 * @param {Object} dateFilter - Date range filter
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Historical valuation metrics
 */
const getHistoricalValuationMetrics = async (stockId, dateFilter = {}, options = {}) => {
  const { limit = 50, page = 1, sortOrder = 'DESC' } = options;
  const { from: fromDate, to: toDate } = dateFilter;
  const offset = (page - 1) * limit;

  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Build where conditions
  const whereConditions = { stockId: stockId };

  if (fromDate || toDate) {
    whereConditions.metricDate = {};
    
    if (fromDate) {
      whereConditions.metricDate[Op.gte] = fromDate;
    }
    
    if (toDate) {
      whereConditions.metricDate[Op.lte] = toDate;
    }
  }

  const { rows, count } = await db.ValuationMetric.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [['metricDate', sortOrder], ['quarter', 'ASC']]
  });

  return {
    stock: {
      id: stock.id,
      symbol: stock.symbol,
      companyName: stock.companyName
    },
    historicalMetrics: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

/**
 * Get stocks with specific valuation criteria
 * @param {Object} criteria - Valuation criteria filters
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Stocks matching valuation criteria
 */
const getStocksByValuationCriteria = async (criteria, options = {}) => {
  const { limit = 50, page = 1, sortBy = 'symbolPe', sortOrder = 'ASC' } = options;
  const offset = (page - 1) * limit;

  // Build where conditions based on criteria
  const whereConditions = {};

  if (criteria.maxPE) {
    whereConditions.symbolPe = { [Op.lte]: criteria.maxPE, [Op.ne]: null };
  }

  if (criteria.minPE) {
    whereConditions.symbolPe = { 
      ...(whereConditions.symbolPe || {}),
      [Op.gte]: criteria.minPE 
    };
  }

  if (criteria.maxPB) {
    whereConditions.symbolPb = { [Op.lte]: criteria.maxPB, [Op.ne]: null };
  }

  if (criteria.minROE) {
    whereConditions.roe = { [Op.gte]: criteria.minROE, [Op.ne]: null };
  }

  if (criteria.maxDebtToEquity) {
    whereConditions.debtToEquity = { [Op.lte]: criteria.maxDebtToEquity, [Op.ne]: null };
  }

  // Get latest metrics for each stock
  const subquery = await db.sequelize.query(`
    SELECT stock_id, MAX(metric_date) as latest_date
    FROM st_valuation_metrics 
    GROUP BY stock_id
  `, {
    type: db.sequelize.QueryTypes.SELECT
  });

  const latestConditions = subquery.map(item => ({
    stockId: item.stock_id,
    metricDate: item.latest_date,
    ...whereConditions
  }));

  const { rows, count } = await db.ValuationMetric.findAndCountAll({
    where: {
      [Op.or]: latestConditions
    },
    include: [
      {
        model: db.Stock,
        as: 'stock',
        attributes: ['symbol', 'companyName', 'marketCap'],
        where: { isActive: true },
        include: [
          { model: db.DetailedSector, as: 'detailedSector', attributes: ['sector'] }
        ]
      }
    ],
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

  return {
    criteria,
    stocks: rows,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit
    }
  };
};

module.exports = {
  getValuationMetrics,
  addValuationMetrics,
  getSectorValuationComparison,
  getPEComparison,
  getROELeaders,
  getHistoricalValuationMetrics,
  getStocksByValuationCriteria
};