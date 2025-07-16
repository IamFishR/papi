# Project Information

This document provides a comprehensive overview of the project structure, code conventions, and technology stack to help AI assistants better understand and work with the codebase.

## Project Overview

This is a financial tracking and trading application with a modern architecture:

- **Frontend**: Next.js 15 application with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Express.js REST API with Sequelize ORM, MySQL, and JWT authentication

## Tech Stack

### Frontend (pfront)

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui based on Radix UI primitives
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **Toast Notifications**: Sonner
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Data Tables**: TanStack Table

### Backend (papi)

- **Framework**: Express.js
- **Database ORM**: Sequelize with MySQL
- **Authentication**: JWT with bcrypt for password hashing
- **Validation**: Joi and express-validator
- **Logging**: Winston with daily rotating files
- **Security**: Helmet, CORS, XSS protection, rate limiting
- **Testing**: Jest with Supertest
- **File Uploads**: Multer

## Project Structure

### Frontend Structure (pfront)

```
/pfront
├── /app                 # Next.js App Router pages and layouts
│   ├── /api             # API routes (Backend for Frontend)
│   ├── /auth            # Authentication pages
│   ├── /dashboard       # Main application pages
│   │   ├── /accounts
│   │   ├── /alerts
│   │   ├── /reports
│   │   ├── /settings
│   │   ├── /trading
│   │   ├── /trading-journal
│   │   ├── /transactions
│   │   └── /watchlists
├── /components          # Reusable UI components
│   ├── /alerts          # Alert system components
│   ├── /charts          # Data visualization components
│   ├── /forms           # Form components
│   ├── /layout          # Layout components (Header, Sidebar)
│   ├── /shared          # Shared utility components
│   ├── /tables          # Table components
│   ├── /trading         # Trading-specific components
│   ├── /ui              # shadcn/ui base components
│   └── /watchlists      # Watchlist components
├── /hooks               # Custom React hooks
├── /lib                 # Core utilities and services
│   ├── /api             # API client and services
│   ├── /data            # Data utilities
│   ├── /hooks           # Shared hooks
│   ├── /schemas         # Zod validation schemas
│   ├── /store           # Zustand state stores
│   └── /utils           # Utility functions
└── /public              # Static assets
```

### Backend Structure (papi)

```
/papi
├── /src
│   ├── /api                     # API versioning root
│   │   ├── /v1                  # Version 1 of the API
│   │   │   ├── /auth            # Authentication endpoints
│   │   │   ├── /users           # User management endpoints
│   │   │   ├── /journal         # Trading journal endpoints
│   │   │   ├── /alerts          # Alert system endpoints
│   │   │   ├── /stocks          # Stock data endpoints
│   │   │   ├── /watchlists      # Watchlist endpoints
│   │   │   └── /notifications   # Notification endpoints
│   │   ├── /v2                  # Version 2 of the API
│   │   └── index.js             # Main API router
│   ├── /config                  # Configuration files
│   ├── /constants               # Application constants
│   ├── /core                    # Core shared functionalities
│   │   ├── /middlewares         # Express middlewares
│   │   ├── /services            # Shared services
│   │   └── /utils               # Utility functions
│   ├── /database                # Database related files
│   │   ├── /migrations          # Sequelize migrations
│   │   ├── /models              # Sequelize models
│   │   └── /seeders             # Sequelize seeders
│   ├── /jobs                    # Background jobs
│   ├── /subscribers             # Event subscribers
│   ├── /tests                   # Automated tests
│   ├── app.js                   # Express application setup
│   └── server.js                # Server initialization
```

## API Structure

### API Versioning

- All endpoints are prefixed with `/api/v1` or `/api/v2`
- New features should be added to the latest API version
- Authentication is required for most endpoints

### Common API Response Format

```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": {} | [] | null,
  "errors": {} | null
}
```

### Error Handling

- Centralized error handling middleware
- HTTP status codes align with standard REST practices
- Detailed error messages in development, generic in production
- Error logging with Winston

## UI Component Library

### shadcn/ui Components

The project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives. To add a new component:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components can be found in `components/ui` directory.

### Toast Notifications

For toast notifications, we use Sonner:

```tsx
import { toast } from "sonner";

// Usage
toast.success("Operation completed successfully");
toast.error("Something went wrong");
```

## Authentication Flow

1. User registers or logs in via `/api/v1/auth/register` or `/api/v1/auth/login`
2. Server returns JWT access token and sets HTTP-only refresh token cookie
3. Frontend stores access token in Zustand store
4. Access token is sent in Authorization header for API requests
5. Axios interceptors handle 401 responses by logging out the user

## Development Guidelines

### Frontend Guidelines

- Use smaller, composable components for better reusability
- Follow the file structure and naming conventions of existing components
- Use Zustand for global state management
- Use React Hook Form with Zod for form validation
- Use the API client services in `/lib/api` for API calls
- Apply consistent error handling using try/catch and toast notifications

### Backend Guidelines

- Follow the module structure of controllers, services, validations, and routes
- Use the catchAsync utility for handling asynchronous route handlers
- Apply authentication middleware to all protected routes
- Follow existing patterns for route naming and API versioning
- Implement thorough validation using Joi or express-validator
- Write unit and integration tests for new features

## Feature Implementation Process

When implementing a new feature, follow this workflow:

1. **Backend**:
   - Define database models and migrations
   - Create validation schemas
   - Implement service layer business logic
   - Build controllers for HTTP request handling
   - Define routes and apply middleware
   - Register routes in the API index
   - Write tests for the new feature

2. **Frontend**:
   - Create API service in `/lib/api`
   - Implement UI components in `/components`
   - Set up state management in `/lib/store` if needed
   - Create pages in the App Router structure
   - Add form validation schemas in `/lib/schemas`
   - Connect UI to API services
   - Add error handling and loading states

## Common Commands

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Install shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

### Backend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run specific test file
npm run test:journal

# Create database migration
npm run makemigration

# Run database migrations
npm run migrate
```

## Documentation References

- API Routes: `/papi/docs/trading/alert/api_route_structure.md`
- Trading Journal: `/pfront/docs/journaling-feature.md`
- Development Flow: `/papi/.copilot/project-flow.md`
