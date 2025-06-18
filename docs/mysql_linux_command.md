Absolutely! Here are the most useful MySQL commands for Ubuntu/Linux development:

## MySQL Service Management (Ubuntu/WSL)

```bash
# Start MySQL service
sudo service mysql start

# Stop MySQL service
sudo service mysql stop

# Restart MySQL service
sudo service mysql restart

# Check MySQL service status
sudo service mysql status

# Check if MySQL is running on port 3306
sudo netstat -tlnp | grep :3306
```

## Connecting to MySQL

```bash
# Connect as root (requires sudo)
sudo mysql

# Connect as specific user
mysql -u rakeshdev -p
# Then enter password when prompted

# Connect to specific database
mysql -u rakeshdev -p your_database_name

# Connect with all options in one line
mysql -h localhost -P 3306 -u rakeshdev -p your_database_name
```

## Essential MySQL Commands (inside MySQL prompt)

```sql
-- Show all databases
SHOW DATABASES;

-- Use/select a specific database
USE your_database_name;

-- Show all tables in current database
SHOW TABLES;

-- Show table structure
DESCRIBE table_name;
-- or
SHOW COLUMNS FROM table_name;

-- Show create statement for table
SHOW CREATE TABLE table_name;

-- Show current user
SELECT USER();

-- Show current database
SELECT DATABASE();

-- Exit MySQL
EXIT;
-- or
QUIT;
```

## User Management

```sql
-- Show all users
SELECT user, host FROM mysql.user;

-- Show user privileges
SHOW GRANTS FOR 'rakeshdev'@'localhost';

-- Create new user
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'localhost';

-- Remove user
DROP USER 'username'@'localhost';

-- Change user password
ALTER USER 'rakeshdev'@'localhost' IDENTIFIED BY 'new_password';

-- Apply privilege changes
FLUSH PRIVILEGES;
```

## Database Operations

```sql
-- Create database
CREATE DATABASE database_name;

-- Drop database
DROP DATABASE database_name;

-- Show database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'your_database_name';
```

## Table Operations

```sql
-- Show all data in table
SELECT * FROM table_name;

-- Show first 10 rows
SELECT * FROM table_name LIMIT 10;

-- Count rows in table
SELECT COUNT(*) FROM table_name;

-- Show table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'your_database_name'
ORDER BY (data_length + index_length) DESC;
```

## Backup and Restore

```bash
# Export/backup database
mysqldump -u rakeshdev -p your_database_name > backup.sql

# Export with structure only (no data)
mysqldump -u rakeshdev -p --no-data your_database_name > structure.sql

# Export data only (no structure)
mysqldump -u rakeshdev -p --no-create-info your_database_name > data.sql

# Import/restore database
mysql -u rakeshdev -p your_database_name < backup.sql

# Create database and import in one go
mysql -u rakeshdev -p -e "CREATE DATABASE new_database_name;"
mysql -u rakeshdev -p new_database_name < backup.sql
```

## Useful File Operations

```bash
# Find MySQL configuration file
sudo find / -name "my.cnf" 2>/dev/null

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log

# Check MySQL data directory
mysql -u rakeshdev -p -e "SHOW VARIABLES LIKE 'datadir';"
```

## Quick Sequelize CLI commands (for your project)

```bash
# Create database (uses config/config.json)
npx sequelize-cli db:create

# Run all migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Run all seeders
npx sequelize-cli db:seed:all

# Check migration status
npx sequelize-cli db:migrate:status
```

## Make your life easier - Add these aliases

```bash
# Add to ~/.bashrc for shortcuts
echo 'alias mysql-start="sudo service mysql start"' >> ~/.bashrc
echo 'alias mysql-stop="sudo service mysql stop"' >> ~/.bashrc
echo 'alias mysql-status="sudo service mysql status"' >> ~/.bashrc
echo 'alias mysql-connect="mysql -u rakeshdev -p"' >> ~/.bashrc

# Reload bashrc
source ~/.bashrc

# Now you can use:
# mysql-start, mysql-stop, mysql-status, mysql-connect
```

These commands should cover 90% of your daily MySQL needs! Bookmark this for reference. 📖