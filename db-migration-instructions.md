# Database Migration Instructions

Before running the API, you'll need to set up the database and run the migrations.

## Prerequisites
1. Make sure MySQL server is installed and running
2. Create a database (e.g., `papi_db`)
3. Configure the database credentials in `.env` file

## Running Migrations
After setting up the database, run:

```bash
# Create the database if it doesn't exist
npx sequelize-cli db:create

# Run migrations to create tables
npx sequelize-cli db:migrate
```

## Troubleshooting

If you encounter "Access denied" errors:
1. Check your MySQL credentials in `.env` file
2. Make sure the user exists and has proper privileges
3. If using root, ensure the password is correct

Example `.env` configuration:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=papi_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql
```
