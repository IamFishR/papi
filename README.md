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
