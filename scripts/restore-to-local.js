#!/usr/bin/env node

/**
 * Restore Neon Backup to Local MySQL Database
 * 
 * This script restores a Neon PostgreSQL backup to local MySQL database by:
 * 1. Reading the backup JSON file
 * 2. Converting PostgreSQL data to MySQL format
 * 3. Rebuilding the local database with the backup data
 * 4. Handling foreign key constraints properly
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../src/config/config');

// Local MySQL connection configuration
const localConfig = {
  dialect: config.db.localDialect,
  host: config.db.localHost,
  port: config.db.localPort,
  database: config.db.localName,
  username: config.db.localUser,
  password: config.db.localPassword,
  logging: false
};

// Tables in dependency order (to handle foreign key constraints)
const RESTORE_ORDER = [
  // Reference/lookup tables first
  'st_exchanges',
  'st_currencies',
  'st_news_sources',
  'st_trigger_types',
  'st_threshold_conditions',
  'st_volume_conditions',
  'st_indicator_types',
  'st_indicator_conditions',
  'st_sentiment_types',
  'st_alert_frequencies',
  'st_condition_logic_types',
  'st_alert_statuses',
  'st_notification_methods',
  'st_notification_statuses',
  'st_risk_tolerance_levels',
  'st_priority_levels',
  'st_stock_indices',
  'st_market_status',
  'st_api_endpoints',
  
  // Core data tables in dependency order
  'users',
  'user_custom_tags',
  'st_detailed_sectors',
  'st_stocks',
  'st_stock_prices',
  'st_trading_tickers',
  'st_alerts',
  'st_alert_history',
  'st_watchlists',
  'st_watchlist_stocks',
  'st_user_preferences',
  'st_technical_indicators',
  'st_notification_queue',
  'st_news_mentions',
  'st_valuation_metrics',
  'st_pre_market_data',
  'st_pre_market_orders',
  'st_stock_index_memberships',
  'trade_journal_entries'
];

async function restoreToLocal(backupFilePath) {
  let localDb;
  
  try {
    console.log('🔄 Starting restore from Neon backup to local MySQL...');
    
    // Read backup file
    console.log(`📁 Reading backup file: ${backupFilePath}`);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }
    
    const backupContent = fs.readFileSync(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    console.log(`📊 Backup info:`);
    console.log(`   - Created: ${backupData.metadata.timestamp}`);
    console.log(`   - Database: ${backupData.metadata.database}`);
    console.log(`   - Host: ${backupData.metadata.host}`);
    console.log(`   - Tables: ${backupData.statistics.total_tables}`);
    console.log(`   - Records: ${backupData.statistics.total_records}`);
    console.log(`   - Size: ${(backupData.statistics.backup_size / 1024 / 1024).toFixed(2)} MB`);
    
    // Initialize local database connection
    console.log('📡 Connecting to local MySQL database...');
    localDb = new Sequelize(localConfig);
    await localDb.authenticate();
    console.log('✅ Connected to local MySQL database');
    
    // Disable foreign key checks for rebuilding
    console.log('🔧 Disabling foreign key checks...');
    await localDb.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Clear existing data and restore tables in order
    let totalRestored = 0;
    for (const tableName of RESTORE_ORDER) {
      if (backupData.tables[tableName]) {
        const restored = await restoreTable(localDb, tableName, backupData.tables[tableName]);
        totalRestored += restored;
      }
    }
    
    // Re-enable foreign key checks
    console.log('🔧 Re-enabling foreign key checks...');
    await localDb.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('✅ Restore completed successfully!');
    console.log(`📊 Total records restored: ${totalRestored}`);
    
    // Create restore log
    const restoreLogPath = path.join(__dirname, '..', 'backups', `restore_log_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    const restoreLog = {
      timestamp: new Date().toISOString(),
      backup_file: backupFilePath,
      backup_timestamp: backupData.metadata.timestamp,
      total_records_restored: totalRestored,
      tables_restored: RESTORE_ORDER.filter(table => backupData.tables[table] && backupData.tables[table].length > 0),
      status: 'success'
    };
    
    fs.writeFileSync(restoreLogPath, JSON.stringify(restoreLog, null, 2));
    console.log(`📋 Restore log: ${restoreLogPath}`);
    
  } catch (error) {
    console.error('❌ Error during restore:', error);
    
    // Create error log
    const errorLogPath = path.join(__dirname, '..', 'backups', `restore_error_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    const errorLog = {
      timestamp: new Date().toISOString(),
      backup_file: backupFilePath,
      error: error.message,
      status: 'failed'
    };
    
    fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2));
    console.log(`📋 Error log: ${errorLogPath}`);
    
    process.exit(1);
  } finally {
    // Close connection
    if (localDb) {
      await localDb.query('SET FOREIGN_KEY_CHECKS = 1;');
      await localDb.close();
    }
  }
}

async function restoreTable(localDb, tableName, tableData) {
  try {
    console.log(`🔄 Restoring table: ${tableName}`);
    
    // Handle error objects in backup data
    if (tableData.error) {
      console.log(`⚠️  Table ${tableName} had backup errors, skipping...`);
      return 0;
    }
    
    // Check if table exists in local database
    const [localExists] = await localDb.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '${tableName}' AND table_schema = '${localConfig.database}';`
    );
    
    if (localExists[0].count === 0) {
      console.log(`⚠️  Table ${tableName} does not exist in local database, skipping...`);
      return 0;
    }
    
    if (!Array.isArray(tableData) || tableData.length === 0) {
      console.log(`ℹ️  Table ${tableName} is empty, clearing local table...`);
      await localDb.query(`DELETE FROM ${tableName};`);
      return 0;
    }
    
    // Clear existing data
    await localDb.query(`DELETE FROM ${tableName};`);
    
    // Convert and insert data in batches
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < tableData.length; i += batchSize) {
      const batch = tableData.slice(i, i + batchSize);
      const convertedBatch = batch.map(row => convertPostgresToMySQL(row));
      
      try {
        await localDb.getQueryInterface().bulkInsert(tableName, convertedBatch);
        totalInserted += batch.length;
      } catch (insertError) {
        console.log(`⚠️  Error inserting batch for ${tableName}:`, insertError.message);
        
        // Try inserting rows one by one
        for (const row of convertedBatch) {
          try {
            await localDb.getQueryInterface().bulkInsert(tableName, [row]);
            totalInserted++;
          } catch (rowError) {
            console.log(`⚠️  Skipping row in ${tableName}: ${rowError.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Restored ${totalInserted} records to ${tableName}`);
    return totalInserted;
    
  } catch (error) {
    console.error(`❌ Error restoring table ${tableName}:`, error.message);
    return 0;
  }
}

function convertPostgresToMySQL(row) {
  const convertedRow = {};
  
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      convertedRow[key] = null;
    } else if (typeof value === 'boolean') {
      // Convert PostgreSQL boolean to MySQL tinyint
      convertedRow[key] = value ? 1 : 0;
    } else if (value instanceof Date) {
      // Handle date conversion
      convertedRow[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Convert PostgreSQL JSON/arrays to MySQL JSON string
      convertedRow[key] = JSON.stringify(value);
    } else if (typeof value === 'string') {
      // Handle string values - check for JSON strings
      if (value.startsWith('[') || value.startsWith('{')) {
        try {
          // Try to parse and re-stringify to ensure valid JSON
          const parsed = JSON.parse(value);
          convertedRow[key] = JSON.stringify(parsed);
        } catch {
          // If not valid JSON, keep as string
          convertedRow[key] = value;
        }
      } else {
        convertedRow[key] = value;
      }
    } else {
      convertedRow[key] = value;
    }
  }
  
  return convertedRow;
}

// Utility function to find the latest backup file
function findLatestBackup() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    throw new Error('Backup directory not found');
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('neon_backup_') && file.endsWith('.json') && !file.includes('summary'))
    .sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)
  
  if (files.length === 0) {
    throw new Error('No backup files found');
  }
  
  return path.join(backupDir, files[0]);
}

// Run the restore
if (require.main === module) {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.log('Usage: node restore-to-local.js <backup-file-path>');
    console.log('Or: node restore-to-local.js latest');
    process.exit(1);
  }
  
  let backupPath;
  if (backupFile === 'latest') {
    try {
      backupPath = findLatestBackup();
      console.log(`🔍 Using latest backup: ${path.basename(backupPath)}`);
    } catch (error) {
      console.error('❌ Error finding latest backup:', error.message);
      process.exit(1);
    }
  } else {
    backupPath = path.isAbsolute(backupFile) ? backupFile : path.join(__dirname, '..', 'backups', backupFile);
  }
  
  restoreToLocal(backupPath);
}

module.exports = { restoreToLocal, findLatestBackup };