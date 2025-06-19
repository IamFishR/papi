# Stock Trading & Portfolio Management API

A comprehensive REST API for stock trading, portfolio management, and market analysis built with Express.js and Sequelize ORM. Features advanced alerting system, trading journal, watchlist management, and real-time stock data tracking.

## Project Structure

```
/project-root
├── /src
│   ├── /api                     # API versioning root
│   │   ├── /v1                  # Version 1 of your API
│   │   │   ├── /auth            # Authentication & authorization
│   │   │   ├── /users           # User management
│   │   │   ├── /stocks          # Stock data & management
│   │   │   ├── /alerts          # Stock alert system
│   │   │   ├── /journal         # Trading journal & tags
│   │   │   ├── /watchlist       # Watchlist management
│   │   │   └── index.js         # Aggregates all v1 routes
│   │   ├── /v2                  # Future Version 2 of your API
│   │   └── index.js             # Main API router
│   ├── /config                  # Configuration files
│   ├── /constants               # Application-wide constants
│   ├── /core                    # Core, shared functionalities
│   │   ├── /middlewares         # Custom middlewares
│   │   ├── /utils               # Utility functions
│   │   └── /services            # Shared business logic
│   ├── /database                # Database related files
│   │   ├── /migrations          # Sequelize migrations
│   │   ├── /seeders             # Sequelize seeders
│   │   └── /models              # Sequelize models
│   ├── /jobs                    # Background jobs
│   ├── /public                  # Static assets
│   ├── /subscribers             # Event subscribers
│   ├── /tests                   # Automated tests
│   ├── app.js                   # Express application setup
│   └── server.js                # Server initialization
├── .env                         # Environment variables
├── .env.example                 # Example environment variables
├── package.json
└── README.md                    # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (or another database supported by Sequelize)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up your database
5. Run database migrations:
   ```
   npm run migrate
   ```

### Running the Application

The API runs on port 8080 by default.

#### Development Mode
```
npm run dev
```

#### Production Mode
```
npm start
```

## Packages & Dependencies

This project uses the following packages to provide a robust and secure API:

### Core Dependencies

#### **Web Framework & Server**
- **express** (^5.1.0) - Fast, unopinionated web framework for Node.js
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware
- **helmet** (^8.1.0) - Security middleware that sets various HTTP headers
- **morgan** (^1.10.0) - HTTP request logger middleware

#### **Database & ORM**
- **sequelize** (^6.37.7) - Promise-based ORM for Node.js with support for PostgreSQL, MySQL, MariaDB, SQLite and Microsoft SQL Server
- **mysql2** (^3.14.1) - MySQL client for Node.js with focus on performance

#### **Authentication & Security**
- **bcryptjs** (^3.0.2) - Password hashing library
- **jsonwebtoken** (^9.0.2) - JSON Web Token implementation
- **express-rate-limit** (^7.5.0) - Basic rate-limiting middleware for Express
- **xss** (^1.0.15) - XSS filtering library

#### **Validation & Data Processing**
- **joi** (^17.13.3) - Object schema validation library
- **express-validator** (^7.2.1) - Set of express.js middlewares that wraps validator.js
- **lodash** (^4.17.21) - Modern JavaScript utility library

#### **Utilities**
- **dotenv** (^16.5.0) - Loads environment variables from .env file
- **cookie-parser** (^1.4.7) - Parse Cookie header and populate req.cookies
- **multer** (^2.0.0) - Middleware for handling multipart/form-data (file uploads)
- **http-status-codes** (^2.3.0) - Constants enumerating the HTTP status codes

#### **Logging**
- **winston** (^3.17.0) - Multi-transport async logging library
- **winston-daily-rotate-file** (^5.0.0) - Daily rotating file transport for winston

### Development Dependencies

#### **Testing**
- **jest** (^29.7.0) - JavaScript testing framework
- **supertest** (^7.1.1) - HTTP assertion library for testing Node.js HTTP servers

#### **Development Tools**
- **nodemon** (^3.1.10) - Utility that monitors for changes and automatically restarts server
- **sequelize-cli** (^6.6.3) - Sequelize command line interface
- **sequelize-auto-migrations** - Automatic migration generation for Sequelize

## Features

### 🔐 Authentication & User Management
- JWT-based authentication with access and refresh tokens
- User registration with email verification
- Password reset functionality
- Role-based authorization (user/admin)
- User profile management with soft delete support
- Rate limiting for security

### 📈 Stock Management System
- Comprehensive stock data with CRUD operations
- Stock search and filtering by symbol, exchange, sector, market cap
- Historical stock price data with date range filtering
- Stock metrics tracking (P/E ratio, dividend yield, beta)
- Exchange, sector, and currency reference data

### 🚨 Advanced Alert System
- Multi-condition alerts with various trigger types:
  - Price threshold alerts (above/below)
  - Volume-based alerts
  - Technical indicator alerts (RSI, moving averages)
  - News sentiment alerts
- Alert scheduling with frequency controls and cooldown periods
- Alert history tracking and status management
- Priority levels and risk tolerance settings

### 📊 Trading Journal
- Comprehensive trade entry logging
- Custom tag system for trade categorization
- Trade performance tracking with P&L calculations
- Advanced filtering and pagination
- User-specific tag management

### 👀 Watchlist Management
- Personal watchlist creation and management
- Stock addition/removal from watchlists
- Portfolio tracking and organization

### 📰 News & Market Data
- Stock news tracking with sentiment analysis
- News mention monitoring for specific stocks
- Market data integration capabilities

### 🔧 Technical Features
- RESTful API with versioning support
- Comprehensive input validation using Joi
- Advanced error handling and logging
- Database migrations and seeding system
- Security headers and XSS protection

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/verify-email/:token` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/me` - Get current user profile

### Stocks
- `GET /api/v1/stocks` - Get all stocks with filtering
- `GET /api/v1/stocks/:id` - Get stock by ID
- `POST /api/v1/stocks` - Create new stock (admin only)
- `PUT /api/v1/stocks/:id` - Update stock (admin only)
- `DELETE /api/v1/stocks/:id` - Delete stock (admin only)
- `GET /api/v1/stocks/:id/prices` - Get stock price history
- `POST /api/v1/stocks/:id/prices` - Add stock price data

### Alerts
- `GET /api/v1/alerts` - Get user's alerts
- `GET /api/v1/alerts/:id` - Get alert by ID
- `POST /api/v1/alerts` - Create new alert
- `PUT /api/v1/alerts/:id` - Update alert
- `DELETE /api/v1/alerts/:id` - Delete alert
- `POST /api/v1/alerts/:id/trigger` - Manually trigger alert
- `GET /api/v1/alerts/history` - Get alert history

### Trading Journal
- `POST /api/v1/journal/trades` - Create a new trade entry
- `GET /api/v1/journal/trades` - Get all trade entries (with pagination & filtering)
- `GET /api/v1/journal/trades/:tradeId` - Get trade entry by ID
- `PUT /api/v1/journal/trades/:tradeId` - Update trade entry
- `DELETE /api/v1/journal/trades/:tradeId` - Delete trade entry

### Custom Tags
- `POST /api/v1/journal/tags` - Create a new custom tag
- `GET /api/v1/journal/tags?type={tagType}` - Get user's tags by type
- `PUT /api/v1/journal/tags/:tagId` - Update custom tag
- `DELETE /api/v1/journal/tags/:tagId` - Delete custom tag

### Watchlist
- `GET /api/v1/watchlist` - Get user's watchlists
- `POST /api/v1/watchlist` - Create new watchlist
- `PUT /api/v1/watchlist/:id` - Update watchlist
- `DELETE /api/v1/watchlist/:id` - Delete watchlist
- `POST /api/v1/watchlist/:id/stocks` - Add stock to watchlist
- `DELETE /api/v1/watchlist/:id/stocks/:stockId` - Remove stock from watchlist

## Testing

### Running Tests

To run all tests:

```
npm test
```

To run specific Journal API tests:

```
npm run test:journal
```

### Database Setup

Run database migrations and seed data:

```bash
# Run migrations
npm run migrate

# Run seeders (optional)
npm run seed
```

The seeding system includes intelligent duplicate prevention and will skip existing data.

### API Testing with Postman

A Postman collection is provided for manual API testing:

1. Import the collection from `src/tests/postman/journal-api.postman_collection.json`
2. Set up your environment variables:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:8080`)
   - `token`: JWT token obtained from login
   - `tradeId`: ID of a trade entry to test
   - `tagId`: ID of a custom tag to test
3. Execute the requests in the collection to test the API endpoints

## Database Schema

The API uses MySQL with the following key entities:

### Core Tables
- **Users** - User accounts with role-based permissions
- **Stocks** - Stock information with market data
- **StockPrices** - Historical price data with technical indicators
- **Exchanges** - Stock exchange reference data
- **Sectors** - Industry sector classifications
- **Currencies** - Supported currencies

### Alert System
- **Alerts** - User-defined stock alerts with conditions
- **AlertHistory** - Alert trigger history and logs
- **AlertConditions** - Alert condition configurations
- **AlertFrequencies** - Alert frequency settings

### Trading Journal
- **TradeEntries** - Individual trade records
- **CustomTags** - User-defined tags for categorization
- **TagTypes** - Tag type definitions

### Watchlist & News
- **Watchlists** - User watchlist collections
- **WatchlistStocks** - Stock-watchlist relationships
- **NewsArticles** - News article storage
- **StockNews** - Stock-news relationships

## Recent Updates

### Latest Features (v1.2.0)
- Enhanced alert validation with camelCase field support
- Improved stock validation with positive value enforcement
- Volume field precision improvements (DECIMAL type)
- Foreign key naming standardization
- Smart seeder system with duplicate prevention
- Active record filtering capabilities

## License

This project is licensed under the MIT License.
