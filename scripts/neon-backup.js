#!/usr/bin/env node

/**
 * Neon Database Backup Script
 * 
 * This script creates a backup of the Neon PostgreSQL database by:
 * 1. Connecting to the Neon database
 * 2. Exporting all table data to JSON format
 * 3. Creating a comprehensive backup file with metadata
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../src/config/config');

// Neon connection configuration - using same approach as sync script
const neonConfig = {
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
};

// All tables to backup
const ALL_TABLES = [
  // Reference/lookup tables
  'st_exchanges',
  'st_sectors',
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
  'st_industries',
  'st_stock_indices',
  'st_market_status',
  'st_api_endpoints',
  
  // Core data tables
  'users',
  'user_custom_tags',
  'trade_journal_entries',
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
  'st_stock_index_memberships'
];

async function createBackup() {
  let neonDb;
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      database: config.db.name,
      host: config.db.host,
      backup_type: 'full',
      created_by: 'neon-backup.js',
      version: '1.0.0'
    },
    tables: {},
    statistics: {
      total_tables: 0,
      total_records: 0,
      backup_size: 0
    }
  };

  try {
    console.log('🔄 Starting Neon database backup...');
    
    // Initialize connection
    console.log('📡 Connecting to Neon PostgreSQL...');
    neonDb = new Sequelize(neonConfig);
    await neonDb.authenticate();
    console.log('✅ Connected to Neon PostgreSQL');

    // Backup each table
    for (const tableName of ALL_TABLES) {
      await backupTable(neonDb, tableName, backupData);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupFileName = `neon_backup_${timestamp}.json`;
    const backupPath = path.join(__dirname, '..', 'backups', backupFileName);

    // Create backups directory if it doesn't exist
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Calculate backup size
    const backupContent = JSON.stringify(backupData, null, 2);
    backupData.statistics.backup_size = Buffer.byteLength(backupContent, 'utf8');

    // Write backup file
    fs.writeFileSync(backupPath, backupContent);
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup file: ${backupPath}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total tables: ${backupData.statistics.total_tables}`);
    console.log(`   - Total records: ${backupData.statistics.total_records}`);
    console.log(`   - Backup size: ${(backupData.statistics.backup_size / 1024 / 1024).toFixed(2)} MB`);

    // Also create a compressed backup summary
    const summaryPath = path.join(__dirname, '..', 'backups', `neon_backup_summary_${timestamp}.json`);
    const summary = {
      metadata: backupData.metadata,
      statistics: backupData.statistics,
      tables: Object.keys(backupData.tables).map(tableName => ({
        name: tableName,
        record_count: backupData.tables[tableName].length
      }))
    };
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Summary file: ${summaryPath}`);

  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (neonDb) await neonDb.close();
  }
}

async function backupTable(neonDb, tableName, backupData) {
  try {
    console.log(`🔄 Backing up table: ${tableName}`);

    // Check if table exists
    const [tableExists] = await neonDb.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}');`
    );
    
    if (!tableExists[0].exists) {
      console.log(`⚠️  Table ${tableName} does not exist, skipping...`);
      return;
    }

    // Get table data
    const [tableData] = await neonDb.query(`SELECT * FROM ${tableName} ORDER BY id;`);
    
    if (tableData.length === 0) {
      console.log(`ℹ️  Table ${tableName} is empty`);
      backupData.tables[tableName] = [];
    } else {
      console.log(`✅ Backed up ${tableData.length} records from ${tableName}`);
      backupData.tables[tableName] = tableData;
    }

    // Update statistics
    backupData.statistics.total_tables++;
    backupData.statistics.total_records += tableData.length;

  } catch (error) {
    console.error(`❌ Error backing up table ${tableName}:`, error.message);
    // Continue with other tables
    backupData.tables[tableName] = {
      error: error.message,
      data: []
    };
  }
}

// Utility function to restore from backup
async function restoreFromBackup(backupFilePath) {
  try {
    console.log('🔄 Starting restore from backup...');
    console.log(`📁 Reading backup file: ${backupFilePath}`);
    
    const backupContent = fs.readFileSync(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    console.log(`📊 Backup info:`);
    console.log(`   - Created: ${backupData.metadata.timestamp}`);
    console.log(`   - Tables: ${backupData.statistics.total_tables}`);
    console.log(`   - Records: ${backupData.statistics.total_records}`);
    
    // You can implement restore logic here if needed
    console.log('ℹ️  Restore functionality can be implemented as needed');
    
  } catch (error) {
    console.error('❌ Error during restore:', error);
  }
}

// Run the backup
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'restore') {
    const backupFile = process.argv[3];
    if (!backupFile) {
      console.error('Usage: node neon-backup.js restore <backup-file-path>');
      process.exit(1);
    }
    restoreFromBackup(backupFile);
  } else {
    createBackup();
  }
}

module.exports = { createBackup, restoreFromBackup };