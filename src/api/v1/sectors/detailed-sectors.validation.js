/**
 * Detailed Sectors validation schemas
 */
const Joi = require('joi');

/**
 * Schema for listing detailed sectors with filters
 */
const listDetailedSectors = {
  query: Joi.object().keys({
    search: Joi.string().allow('', null),
    macroSector: Joi.string().allow(null),
    sector: Joi.string().allow(null),
    industry: Joi.string().allow(null),
    basicIndustry: Joi.string().allow(null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('macroSector', 'sector', 'industry', 'basicIndustry', 'code').default('macroSector'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for getting a detailed sector by ID
 */
const getDetailedSectorById = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for getting stocks by detailed sector
 */
const getStocksByDetailedSector = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('symbol', 'companyName', 'marketCap', 'listingDate').default('symbol'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

/**
 * Schema for creating a detailed sector
 */
const createDetailedSector = {
  body: Joi.object().keys({
    macroSector: Joi.string().min(1).max(100).required(),
    sector: Joi.string().min(1).max(100).required(),
    industry: Joi.string().min(1).max(100).required(),
    basicIndustry: Joi.string().min(1).max(100).required(),
    code: Joi.string().min(1).max(50).required(),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Schema for updating a detailed sector
 */
const updateDetailedSector = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    macroSector: Joi.string().min(1).max(100),
    sector: Joi.string().min(1).max(100),
    industry: Joi.string().min(1).max(100),
    basicIndustry: Joi.string().min(1).max(100),
    code: Joi.string().min(1).max(50),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean(),
  }).min(1),
};

/**
 * Schema for deleting a detailed sector
 */
const deleteDetailedSector = {
  params: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Schema for getting detailed sectors by macro sector
 */
const getDetailedSectorsByMacroSector = {
  params: Joi.object().keys({
    macroSector: Joi.string().required(),
  }),
};

/**
 * Schema for searching detailed sectors
 */
const searchDetailedSectors = {
  query: Joi.object().keys({
    q: Joi.string().min(1).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = {
  listDetailedSectors,
  getDetailedSectorById,
  getStocksByDetailedSector,
  createDetailedSector,
  updateDetailedSector,
  deleteDetailedSector,
  getDetailedSectorsByMacroSector,
  searchDetailedSectors,
};