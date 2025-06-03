/**
 * Sequelize connection options
 */
const config = require('./config');

module.exports = {
  [config.env]: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+00:00', // For writing to database
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: config.env === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
