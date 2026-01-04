# Kitchen API

A RESTful API for managing customers, vendors, and menu items in a kitchen'.

## Documentation

For detailed API documentation, see [doc.md](./doc.md).

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js (SQL query builder)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Dependency Injection**: Awilix
- **Testing**: Jest with Supertest
- **Development**: Nodemon

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kitchen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/kitchen
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=24h
   PORT=3000
   ```

4. **Run database migrations**
   ```bash
   npx knex migrate:latest
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run seed` - Run database seeds
- `npx knex migrate:latest` - Run pending migrations
- `npx knex migrate:rollback` - Rollback last migration

## Project Structure

```
kitchen/
├── src/
│   ├── app.js                 # Application entry point
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Database operations
│   ├── middlewares/          # Express middlewares
│   ├── validators/           # Joi validation schemas
│   ├── utils/                # Utility functions
│   └── loaders/               # Application initialization
├── migrations/                # Database migrations
├── seeds/                     # Database seeds
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
└── package.json
```

## Features

- Customer registration and authentication
- Vendor registration and authentication
- Menu item management (CRUD operations)
- Pagination support for menu items
- JWT-based authentication
- Role-based access control (customers vs vendors)
- Ownership validation for menu items
- Comprehensive error handling
- Input validation with Joi



