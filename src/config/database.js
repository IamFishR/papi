/**
 * Sequelize connection options
 */
const config = require('./config');

// Choose database configuration based on environment
const getDatabaseConfig = () => {
  if (config.db.useNeon) {
    // Neon PostgreSQL configuration
    return {
      use_env_variable: 'NEON_STRING',
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      timezone: '+05:30',
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };
  } else {
    // Local MySQL configuration
    return {
      username: config.db.localUser,
      password: config.db.localPassword,
      database: config.db.localName,
      host: config.db.localHost,
      port: config.db.localPort,
      dialect: config.db.localDialect,
      timezone: '+05:30',
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };
  }
};

module.exports = {
  [config.env]: getDatabaseConfig(),
};
