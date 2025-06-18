# Database Migrations and Seeders Guide

This guide shows how to use Sequelize CLI for creating and managing database migrations and seeders.

## Prerequisites

Make sure you have sequelize-cli installed (it's already in devDependencies).

## Available Commands

### Migrations

```bash
# Create a new migration
npm run migration:create create-users-table

# Run all pending migrations
npm run db:migrate

# Undo the last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all
```

### Seeders

```bash
# Create a new seeder
npm run seeder:create demo-users

# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo
```

## Creating Migrations

### 1. Generate Migration File

```bash
npm run migration:create create-products-table
```

This creates a file like: `YYYYMMDDHHMMSS-create-products-table.js`

### 2. Migration Template

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('products', ['user_id']);
    await queryInterface.addIndex('products', ['name']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
```

## Creating Seeders

### 1. Generate Seeder File

```bash
npm run seeder:create demo-products
```

### 2. Seeder Template

```javascript
'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get some user IDs to reference
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 2',
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('products', [
      {
        id: uuidv4(),
        name: 'Sample Product 1',
        price: 29.99,
        user_id: users[0].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sample Product 2',
        price: 49.99,
        user_id: users[1] ? users[1].id : users[0].id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
```

## Project Conventions

### Column Naming
- Use `snake_case` for database columns
- Use `camelCase` for model attributes
- Map between them using `field` property in models

### Timestamps
- Always include `created_at` and `updated_at`
- Use `Sequelize.NOW` as default value

### Primary Keys
- Use UUID v4 for all primary keys
- Set `defaultValue: Sequelize.UUIDV4`

### Foreign Keys
- Use `snake_case` naming: `user_id`, `product_id`
- Include CASCADE rules for referential integrity
- Add indexes for foreign keys

### Indexes
- Add indexes for frequently queried columns
- Include foreign keys and commonly filtered fields

## Common Migration Operations

### Adding a Column
```javascript
await queryInterface.addColumn('table_name', 'new_column', {
  type: Sequelize.STRING,
  allowNull: true,
});
```

### Removing a Column
```javascript
await queryInterface.removeColumn('table_name', 'column_name');
```

### Adding an Index
```javascript
await queryInterface.addIndex('table_name', ['column_name']);
```

### Creating a Composite Index
```javascript
await queryInterface.addIndex('table_name', ['column1', 'column2']);
```

## Tips

1. **Always test migrations**: Run both up and down migrations in development
2. **Backup before production**: Always backup production data before running migrations
3. **Keep migrations atomic**: Each migration should do one specific thing
4. **Order matters**: Migrations run in chronological order based on filename
5. **Dependencies**: Make sure referenced tables exist before creating foreign keys
