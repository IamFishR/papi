/**
 * Sequelize models index file
 * Initializes Sequelize, loads all models, and defines associations
 */
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../../config/database');
const logger = require('../../config/logger');

// Get environment configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
let sequelize;
if (dbConfig.use_env_variable) {
  // Use connection string from environment variable
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
  });
} else {
  // Use individual connection parameters
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      timezone: dbConfig.timezone,
      define: dbConfig.define,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions,
    }
  );
}

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connection established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
  });

const db = {};

// Load model files
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-9) === '.model.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
