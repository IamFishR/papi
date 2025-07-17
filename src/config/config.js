/**
 * General application configuration
 */
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  apiPrefix: process.env.API_PREFIX || '/api',
  timezone: 'Asia/Kolkata',
  
  // Database configuration
  db: {
    // Neon configuration
    neonConnectionString: process.env.NEON_STRING,
    useNeon: process.env.USE_NEON === 'true',
    
    // Local configuration
    localHost: process.env.LOCAL_DB_HOST || 'localhost',
    localPort: process.env.LOCAL_DB_PORT || 3306,
    localName: process.env.LOCAL_DB_NAME || 'papi_db',
    localUser: process.env.LOCAL_DB_USER || 'root',
    localPassword: process.env.LOCAL_DB_PASSWORD || '',
    localDialect: process.env.LOCAL_DB_DIALECT || 'mysql',
    
    // Legacy configuration (kept for backward compatibility)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'papi_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_here',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    path: process.env.LOG_PATH || './logs',
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  },
};
