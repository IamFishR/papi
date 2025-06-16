/**
 * News service - handles business logic for news operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const ApiError = require('../../../core/utils/ApiError');
const db = require('../../../database/models');

/**
 * Get stock news with filtering
 * @param {number} stockId - Stock ID
 * @param {Object} filter - Filter options (sentiment, from)
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Paginated news with metadata
 */
const getStockNews = async (stockId, filter, options) => {
  const { limit, page, sortBy, sortOrder } = options;
  const offset = (page - 1) * limit;

  // Verify stock exists
  const stock = await db.Stock.findByPk(stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Stock not found');
  }

  // Prepare filter conditions
  const whereConditions = { 
    stockId 
  };
  
  // Apply sentiment filter if provided
  if (filter.sentiment && filter.sentiment !== 'any') {
    const sentimentType = await db.SentimentType.findOne({
      where: { name: filter.sentiment }
    });
    
    if (sentimentType) {
      whereConditions.sentimentTypeId = sentimentType.id;
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid sentiment type');
    }
  }
  
  // Apply date filter if provided
  if (filter.from) {
    whereConditions.publicationDate = {
      [Op.gte]: new Date(filter.from)
    };
  }

  // Execute query with includes for related data
  const { rows, count } = await db.NewsMention.findAndCountAll({
    where: whereConditions,
    limit,
    offset,
    order: [[sortBy || 'publicationDate', sortOrder || 'DESC']],
    include: [
      { model: db.NewsSource, as: 'newsSource' },
      { model: db.SentimentType, as: 'sentimentType' }
    ]
  });

  // Return paginated result
  return {
    results: rows,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit
  };
};

/**
 * Add news mention for a stock
 * @param {Object} newsData - News data
 * @returns {Promise<Object>} Created news mention
 */
const addNewsMention = async (newsData) => {
  // Verify stock exists
  const stock = await db.Stock.findByPk(newsData.stockId);
  
  if (!stock) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid stock ID');
  }

  // Verify news source exists
  const newsSource = await db.NewsSource.findByPk(newsData.newsSourceId);
  
  if (!newsSource) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid news source ID');
  }

  // Verify sentiment type exists
  const sentimentType = await db.SentimentType.findByPk(newsData.sentimentTypeId);
  
  if (!sentimentType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid sentiment type ID');
  }

  // Create news mention
  const newsMention = await db.NewsMention.create(newsData);

  // Get the created news mention with related data
  return db.NewsMention.findByPk(newsMention.id, {
    include: [
      { model: db.NewsSource, as: 'newsSource' },
      { model: db.SentimentType, as: 'sentimentType' }
    ]
  });
};

/**
 * Process news for all stocks
 * This is used by the background job to fetch and analyze news
 * @returns {Promise<Object>} Processing results
 */
const processNews = async () => {
  // Get all active stocks
  const stocks = await db.Stock.findAll({
    where: { isActive: true }
  });

  const processedStocks = [];
  const failedStocks = [];
  const newNews = [];

  // Process each stock
  for (const stock of stocks) {
    try {
      // Fetch news for the stock
      // This would integrate with a news API or web scraping service
      // This is a placeholder for actual news fetching logic
      const fetchedNews = await fetchNewsForStock(stock);
      
      // Add each news item to the database
      for (const newsItem of fetchedNews) {
        const newsMention = await addNewsMention({
          stockId: stock.id,
          newsSourceId: newsItem.sourceId,
          title: newsItem.title,
          content: newsItem.content,
          url: newsItem.url,
          publicationDate: newsItem.publicationDate,
          author: newsItem.author,
          sentimentTypeId: newsItem.sentimentId,
          keywords: newsItem.keywords
        });
        
        newNews.push(newsMention);
      }
      
      processedStocks.push({
        stock,
        newsCount: fetchedNews.length
      });
    } catch (error) {
      failedStocks.push({
        stock,
        error: error.message
      });
    }
  }

  return {
    processedCount: stocks.length,
    successCount: processedStocks.length,
    failedCount: failedStocks.length,
    newNewsCount: newNews.length,
    processedStocks,
    failedStocks,
    newNews
  };
};

/**
 * Fetch news for a stock
 * This is a placeholder for actual news fetching logic
 * @param {Object} stock - Stock object
 * @returns {Promise<Array>} Fetched news items
 */
const fetchNewsForStock = async (stock) => {
  // This would integrate with a news API or web scraping service
  // This is a placeholder that returns an empty array
  // In a real implementation, this would fetch news from external sources
  
  return [];
};

module.exports = {
  getStockNews,
  addNewsMention,
  processNews
};
