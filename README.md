# Express.js API Project

A modular and scalable REST API built with Express.js and Sequelize ORM.

## Project Structure

```
/project-root
├── /src
│   ├── /api                     # API versioning root
│   │   ├── /v1                  # Version 1 of your API
│   │   │   ├── /auth            # Authentication feature
│   │   │   ├── /users           # Users feature
│   │   │   ├── /products        # Products feature
│   │   │   ├── /orders          # Orders feature
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

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product (admin only)
- `PATCH /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)

### Orders
- `GET /api/v1/orders` - Get all orders (admin) or user's orders
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create new order
- `PATCH /api/v1/orders/:id` - Update order status (admin only)
- `DELETE /api/v1/orders/:id` - Cancel order

## Testing

```
npm test
```

## License

This project is licensed under the MIT License.
