# Stock Trading & Portfolio Management API

A comprehensive REST API for stock trading, portfolio management, and market analysis built with Express.js and Sequelize ORM. Features advanced alerting system, trading journal, watchlist management, and **enhanced Indian stock market support** with NSE/BSE data integration, pre-market trading, NIFTY indices, and comprehensive valuation metrics.

## Project Structure

```
/project-root
├── /src
│   ├── /api                     # API versioning root
│   │   ├── /v1                  # Version 1 of your API
│   │   │   ├── /auth            # Authentication & authorization
│   │   │   ├── /users           # User management
│   │   │   ├── /stocks          # Stock data & management (enhanced for Indian market)
│   │   │   ├── /sectors         # Detailed sector hierarchy (4-level classification)
│   │   │   ├── /indices         # Stock indices (NIFTY 50, NIFTY 200, etc.)
│   │   │   ├── /pre-market      # Pre-market trading data and IEP tracking
│   │   │   ├── /valuation       # Financial ratios and valuation metrics
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

### 📈 Enhanced Stock Management System ⭐ **UPDATED**
- **Indian Market Support**: Complete NSE/BSE integration with Indian-specific fields
- **ISIN Integration**: International Securities Identification Number support
- **Advanced Filtering**: Search by ISIN, FNO status, surveillance stage, trading status
- **Circuit Breakers**: Upper and lower circuit price tracking
- **Trading Series**: Support for EQ, BE, and other trading series
- **52-Week Data**: High/low tracking with dates
- **VWAP & Price Bands**: Volume-weighted average price and band classifications
- **Surveillance Tracking**: GSM, ASM, and other surveillance stage monitoring
- **FNO Status**: Futures & Options enabled stock identification
- **Comprehensive Price Data**: Enhanced OHLC with Indian market specifics

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

### 🇮🇳 Indian Stock Market Features ⭐ **NEW**

#### 🏢 **4-Level Detailed Sector Classification**
- **Macro Sector** → **Sector** → **Industry** → **Basic Industry** hierarchy
- Enhanced sector-based stock filtering and analysis
- Industry-specific performance tracking and comparisons
- Sector hierarchy management with full CRUD operations

#### 📊 **Pre-Market Trading Support**
- **IEP Tracking**: Indicative Equilibrium Price monitoring
- **Order Book Data**: Buy/sell order tracking with quantities
- **ATO Orders**: At The Open order quantity tracking
- **Session Management**: Pre-market session timing and data
- **Historical Pre-Market**: Historical IEP and volume data
- **Market Movers**: Top gainers/losers in pre-market sessions

#### 📈 **NIFTY Indices Management**
- **Index Creation**: Support for NIFTY 50, NIFTY 200, sector indices
- **Membership Tracking**: Stock-to-index relationships with weights
- **Weight Management**: Dynamic index weight updates
- **Index Composition**: Detailed composition analysis and statistics
- **Historical Membership**: Track when stocks join/leave indices
- **Sector Distribution**: Index composition by sector analysis

#### 💰 **Comprehensive Valuation Metrics**
- **Financial Ratios**: P/E, P/B, ROE, ROA, Debt-to-Equity, Current Ratio
- **Valuation Metrics**: EV/EBITDA, PEG ratio, Price-to-Sales, FCF ratios
- **Sector Comparisons**: Stock performance vs sector averages
- **Historical Tracking**: Time-series valuation data
- **Screening Tools**: Filter stocks by valuation criteria
- **Performance Leaders**: Top ROE, P/E performers by sector

#### 🛡️ **Regulatory Compliance**
- **Surveillance Stages**: GSM, ASM, and other regulatory classifications
- **Trading Status**: Active, Suspended, Delisted status tracking
- **Board Status**: Main board, SME board classifications
- **Class of Shares**: Equity, Preference share categorization
- **Derivatives Status**: FNO, CAS, SLB availability tracking

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

### Stocks ⭐ **ENHANCED**
- `GET /api/v1/stocks` - Get all stocks with enhanced filtering (ISIN, FNO, surveillance)
- `GET /api/v1/stocks/:id` - Get stock by ID
- `GET /api/v1/stocks/by-isin/:isin` - **NEW**: Get stock by ISIN
- `GET /api/v1/stocks/fno-enabled` - **NEW**: Get FNO enabled stocks
- `GET /api/v1/stocks/surveillance/:stage` - **NEW**: Get stocks by surveillance stage
- `GET /api/v1/stocks/sector-detailed/:sectorId` - **NEW**: Get stocks by detailed sector
- `POST /api/v1/stocks` - Create new stock with Indian fields (admin only)
- `PUT /api/v1/stocks/:id` - Update stock with Indian fields (admin only)
- `PUT /api/v1/stocks/:id/indian-fields` - **NEW**: Update Indian-specific fields (admin only)
- `DELETE /api/v1/stocks/:id` - Delete stock (admin only)
- `GET /api/v1/stocks/:id/prices` - Get enhanced stock price history
- `POST /api/v1/stocks/:id/prices` - Add enhanced stock price data
- `POST /api/v1/stocks/bulk/prices` - Bulk update prices with Indian market data

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

### 🇮🇳 Indian Market APIs ⭐ **NEW**

#### Detailed Sectors
- `GET /api/v1/sectors/detailed` - Get detailed sectors with 4-level hierarchy
- `GET /api/v1/sectors/detailed/:id` - Get detailed sector by ID
- `GET /api/v1/sectors/detailed/hierarchy` - Get complete sector hierarchy
- `GET /api/v1/sectors/detailed/search` - Search sectors by keyword
- `GET /api/v1/sectors/detailed/macro/:macroSector` - Get sectors by macro sector
- `GET /api/v1/sectors/detailed/:id/stocks` - Get stocks in detailed sector
- `POST /api/v1/sectors/detailed` - Create detailed sector (admin only)
- `PUT /api/v1/sectors/detailed/:id` - Update detailed sector (admin only)
- `DELETE /api/v1/sectors/detailed/:id` - Delete detailed sector (admin only)

#### Pre-Market Trading
- `GET /api/v1/pre-market/summary` - Get pre-market summary for date
- `GET /api/v1/pre-market/movers` - Get top gainers/losers in pre-market
- `GET /api/v1/pre-market/stocks/:stockId` - Get pre-market data for stock
- `GET /api/v1/pre-market/stocks/:stockId/iep` - Get current IEP for stock
- `GET /api/v1/pre-market/stocks/:stockId/history` - Get historical pre-market data
- `POST /api/v1/pre-market/data` - Add pre-market data (admin only)
- `PUT /api/v1/pre-market/data/:id` - Update pre-market data (admin only)
- `POST /api/v1/pre-market/data/:id/orders` - Add order book data (admin only)
- `POST /api/v1/pre-market/multiple-stocks` - Get multiple stocks pre-market data

#### Stock Indices
- `GET /api/v1/indices` - Get all stock indices
- `GET /api/v1/indices/:id` - Get index by ID
- `GET /api/v1/indices/:id/memberships` - Get index memberships
- `GET /api/v1/indices/:id/composition` - Get index composition summary
- `GET /api/v1/indices/type/:type` - Get indices by type
- `GET /api/v1/indices/stocks/:stockId/memberships` - Get stock's index memberships
- `POST /api/v1/indices` - Create new index (admin only)
- `PUT /api/v1/indices/:id` - Update index (admin only)
- `DELETE /api/v1/indices/:id` - Delete index (admin only)
- `POST /api/v1/indices/:id/stocks` - Add stock to index (admin only)
- `DELETE /api/v1/indices/:id/stocks/:stockId` - Remove stock from index (admin only)
- `PUT /api/v1/indices/:id/weights` - Update index weights (admin only)

#### Valuation Metrics
- `GET /api/v1/valuation/stocks/:stockId` - Get valuation metrics for stock
- `GET /api/v1/valuation/stocks/:stockId/history` - Get historical valuation data
- `GET /api/v1/valuation/sector/:sectorId/comparison` - Get sector valuation comparison
- `GET /api/v1/valuation/pe-comparison/:stockId` - Get P/E comparison vs sector
- `GET /api/v1/valuation/sector/:sectorId/roe-leaders` - Get ROE leaders in sector
- `GET /api/v1/valuation/screening` - Screen stocks by valuation criteria
- `POST /api/v1/valuation/metrics` - Add valuation metrics (admin only)

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

### Core Tables ⭐ **ENHANCED**
- **Users** - User accounts with role-based permissions
- **Stocks** - Stock information with **enhanced Indian market data** (ISIN, FNO, surveillance, etc.)
- **StockPrices** - Historical price data with **Indian market specifics** (VWAP, circuit breakers, 52-week data)
- **Exchanges** - Stock exchange reference data
- **Sectors** - Industry sector classifications (legacy)
- **Currencies** - Supported currencies

### 🇮🇳 Indian Market Tables ⭐ **NEW**
- **DetailedSectors** - 4-level sector hierarchy (macro → sector → industry → basic industry)
- **StockIndices** - NIFTY indices and market indices (NIFTY 50, NIFTY 200, etc.)
- **StockIndexMemberships** - Stock-to-index relationships with weights and rankings
- **PreMarketData** - Pre-market trading sessions with IEP tracking
- **PreMarketOrders** - Order book data for pre-market sessions
- **ValuationMetrics** - Comprehensive financial ratios and valuation data

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

### 🇮🇳 Major Indian Market Enhancement (v2.0.0) ⭐ **NEW**
**Released: June 2025**

#### **Database Enhancements**
- **9 New Migration Files**: Complete Indian stock market database structure
- **Enhanced Stock Table**: 25+ new Indian-specific fields (ISIN, FNO, surveillance, etc.)
- **Enhanced Price Table**: 15+ new price fields (VWAP, circuit breakers, 52-week data)
- **New Tables**: DetailedSectors, StockIndices, PreMarketData, ValuationMetrics

#### **API Enhancements**
- **4 New API Modules**: Detailed Sectors, Pre-Market, Indices, Valuation
- **Enhanced Stock APIs**: Indian field support with comprehensive validation
- **60+ New Endpoints**: Complete Indian market API coverage
- **Advanced Filtering**: Search by ISIN, FNO status, surveillance stage

#### **Key Features Added**
- **Pre-Market Trading**: IEP tracking, order book data, session management
- **NIFTY Indices**: Complete index and membership management
- **4-Level Sectors**: Detailed industry classification hierarchy
- **Valuation Metrics**: Comprehensive financial ratios and sector comparisons
- **Regulatory Compliance**: Surveillance stages, circuit breakers, trading status

#### **Technical Improvements**
- **Performance Optimized**: Strategic indexing for Indian market queries
- **Data Integrity**: Proper foreign keys and validation
- **Comprehensive Validation**: Joi schemas for all new data structures
- **Enhanced Error Handling**: Indian market specific error responses

### Previous Features (v1.2.0)
- Enhanced alert validation with camelCase field support
- Improved stock validation with positive value enforcement
- Volume field precision improvements (DECIMAL type)
- Foreign key naming standardization
- Smart seeder system with duplicate prevention
- Active record filtering capabilities

### Migration Guide

To upgrade to v2.0.0 with Indian market support:

1. **Run New Migrations**:
   ```bash
   npm run migrate
   ```

2. **Update API Calls**: New endpoints available for Indian market features

3. **Enhanced Data**: Existing stock data enhanced with Indian fields

4. **New Capabilities**: Access to pre-market, indices, and valuation APIs

## License

This project is licensed under the MIT License.
