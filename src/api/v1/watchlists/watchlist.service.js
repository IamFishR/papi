/**
 * Watchlist service - handles business logic for watchlist operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const errorMessages = require('../../../constants/errorMessages');
const db = require('../../../database/models');

/**
 * Get user watchlists
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User watchlists with stocks
 */
const getWatchlists = async (userId) => {
  const watchlists = await db.Watchlist.findAll({
    where: { userId },
    include: [
      {
        model: db.Stock,
        as: 'stocks',
        through: {
          attributes: ['positionOrder'],
          as: 'watchlistStock'
        },
        include: [
          { model: db.Exchange, as: 'exchange' },
          { model: db.Sector, as: 'sector' }
        ]
      }
    ],
    order: [
      ['name', 'ASC'],
      [{ model: db.Stock, as: 'stocks' }, db.WatchlistStock, 'positionOrder', 'ASC']
    ]
  });

  return watchlists;
};

/**
 * Create a new watchlist
 * @param {Object} watchlistData - Watchlist data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created watchlist
 */
const createWatchlist = async (watchlistData, userId) => {
  // Check if a default watchlist is being created and user already has one
  if (watchlistData.isDefault) {
    const existingDefault = await db.Watchlist.findOne({
      where: { 
        userId,
        isDefault: true
      }
    });
    
    if (existingDefault) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User already has a default watchlist');
    }
  }

  // Add userId to watchlist data
  const watchlistWithUserId = {
    ...watchlistData,
    userId
  };

  // Create watchlist
  const watchlist = await db.Watchlist.create(watchlistWithUserId);

  // If stocks are provided, add them to the watchlist
  if (watchlistData.stocks && Array.isArray(watchlistData.stocks) && watchlistData.stocks.length > 0) {
    await addStocksToWatchlist(watchlist.id, watchlistData.stocks);
  }

  // Get the created watchlist with stocks
  return getWatchlistById(watchlist.id, userId);
};

/**
 * Get a watchlist by ID
 * @param {number} id - Watchlist ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Watchlist with stocks
 */
const getWatchlistById = async (id, userId) => {
  const watchlist = await db.Watchlist.findOne({
    where: {
      id,
      userId
    },
    include: [
      {
        model: db.Stock,
        as: 'stocks',
        through: {
          attributes: ['positionOrder'],
          as: 'watchlistStock'
        },
        include: [
          { model: db.Exchange, as: 'exchange' },
          { model: db.Sector, as: 'sector' }
        ]
      }
    ],
    order: [
      [{ model: db.Stock, as: 'stocks' }, db.WatchlistStock, 'positionOrder', 'ASC']
    ]
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  return watchlist;
};

/**
 * Update a watchlist
 * @param {number} id - Watchlist ID
 * @param {Object} watchlistData - Updated watchlist data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated watchlist
 */
const updateWatchlist = async (id, watchlistData, userId) => {
  // Find watchlist by ID and userId
  const watchlist = await db.Watchlist.findOne({
    where: {
      id,
      userId
    }
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  // If setting as default, update other watchlists to not be default
  if (watchlistData.isDefault && !watchlist.isDefault) {
    await db.Watchlist.update(
      { isDefault: false },
      { 
        where: { 
          userId,
          isDefault: true
        }
      }
    );
  }

  // Update watchlist
  await watchlist.update(watchlistData);

  // Get the updated watchlist with stocks
  return getWatchlistById(id, userId);
};

/**
 * Delete a watchlist
 * @param {number} id - Watchlist ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteWatchlist = async (id, userId) => {
  // Find watchlist by ID and userId
  const watchlist = await db.Watchlist.findOne({
    where: {
      id,
      userId
    }
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  // Cannot delete the default watchlist
  if (watchlist.isDefault) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete the default watchlist');
  }

  // Delete watchlist (this will also delete related watchlist stocks due to cascade)
  await watchlist.destroy();

  return true;
};

/**
 * Add a stock to a watchlist
 * @param {number} watchlistId - Watchlist ID
 * @param {number} stockId - Stock ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated watchlist
 */
const addStockToWatchlist = async (watchlistId, stockId, userId) => {
  // Find watchlist by ID and userId
  const watchlist = await db.Watchlist.findOne({
    where: {
      id: watchlistId,
      userId
    }
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid stock ID');
  }

  // Check if stock is already in the watchlist
  const existingEntry = await db.WatchlistStock.findOne({
    where: {
      watchlistId,
      stockId
    }
  });

  if (existingEntry) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Stock is already in the watchlist');
  }

  // Get the current highest position order
  const highestOrder = await db.WatchlistStock.max('positionOrder', {
    where: { watchlistId }
  });

  // Add stock to watchlist with next position order
  await db.WatchlistStock.create({
    watchlistId,
    stockId,
    positionOrder: (highestOrder || 0) + 1
  });

  // Get the updated watchlist
  return getWatchlistById(watchlistId, userId);
};

/**
 * Add multiple stocks to a watchlist
 * @param {number} watchlistId - Watchlist ID
 * @param {Array} stocks - Array of stock IDs or objects with stockId and positionOrder
 * @returns {Promise<Array>} Created watchlist stock entries
 */
const addStocksToWatchlist = async (watchlistId, stocks) => {
  // Get the current highest position order
  const highestOrder = await db.WatchlistStock.max('positionOrder', {
    where: { watchlistId }
  }) || 0;

  // Prepare watchlist stock entries
  const watchlistStockEntries = stocks.map((stock, index) => {
    const stockId = typeof stock === 'object' ? stock.stockId : stock;
    const positionOrder = typeof stock === 'object' && stock.positionOrder ? 
      stock.positionOrder : highestOrder + index + 1;

    return {
      watchlistId,
      stockId,
      positionOrder
    };
  });

  // Create watchlist stock entries
  return db.WatchlistStock.bulkCreate(watchlistStockEntries);
};

/**
 * Remove a stock from a watchlist
 * @param {number} watchlistId - Watchlist ID
 * @param {number} stockId - Stock ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated watchlist
 */
const removeStockFromWatchlist = async (watchlistId, stockId, userId) => {
  // Find watchlist by ID and userId
  const watchlist = await db.Watchlist.findOne({
    where: {
      id: watchlistId,
      userId
    }
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  // Check if stock is in the watchlist
  const watchlistStock = await db.WatchlistStock.findOne({
    where: {
      watchlistId,
      stockId
    }
  });

  if (!watchlistStock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock is not in the watchlist');
  }

  // Remove stock from watchlist
  await watchlistStock.destroy();

  // Reorder remaining stocks to fill the gap
  const remainingStocks = await db.WatchlistStock.findAll({
    where: { watchlistId },
    order: [['positionOrder', 'ASC']]
  });

  // Update position orders
  const updatePromises = remainingStocks.map((stock, index) => {
    return stock.update({ positionOrder: index + 1 });
  });

  await Promise.all(updatePromises);

  // Get the updated watchlist
  return getWatchlistById(watchlistId, userId);
};

/**
 * Reorder stocks in a watchlist
 * @param {number} watchlistId - Watchlist ID
 * @param {Array} stockOrders - Array of objects with stockId and positionOrder
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated watchlist
 */
const reorderWatchlistStocks = async (watchlistId, stockOrders, userId) => {
  // Find watchlist by ID and userId
  const watchlist = await db.Watchlist.findOne({
    where: {
      id: watchlistId,
      userId
    }
  });

  if (!watchlist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Watchlist not found');
  }

  // Update position orders for each stock
  const updatePromises = stockOrders.map((stockOrder) => {
    return db.WatchlistStock.update(
      { positionOrder: stockOrder.positionOrder },
      {
        where: {
          watchlistId,
          stockId: stockOrder.stockId
        }
      }
    );
  });

  await Promise.all(updatePromises);

  // Get the updated watchlist
  return getWatchlistById(watchlistId, userId);
};

module.exports = {
  getWatchlists,
  createWatchlist,
  getWatchlistById,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  reorderWatchlistStocks
};
