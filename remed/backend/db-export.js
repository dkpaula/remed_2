/**
 * Database Export Script for ReMed
 *
 * This script will export the database schema and data to a SQL file
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const { dbConfig } = require('./config');

async function exportDatabase() {
  console.log('Starting database export script...');
  console.log(`Connecting to database: ${dbConfig.database}`);

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user, 
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('Database connection established successfully.');
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log(`Found ${tableNames.length} tables: ${tableNames.join(', ')}`);
    
    // Create SQL file header
    let sql = `-- ReMed Database Export\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `CREATE DATABASE IF NOT EXISTS ${dbConfig.database};\n`;
    sql += `USE ${dbConfig.database};\n\n`;
    
    // Export each table structure and data
    for (const tableName of tableNames) {
      console.log(`Exporting table: ${tableName}`);
      
      // Get table structure
      const [createTable] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
      sql += `${createTable[0]['Create Table']};\n\n`;
      
      // Get table data
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        sql += `-- Data for table ${tableName}\n`;
        sql += `INSERT INTO ${tableName} VALUES\n`;
        
        const values = rows.map(row => {
          // Convert each row to SQL-safe values
          const rowValues = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return value;
          });
          
          return `(${rowValues.join(', ')})`;
        });
        
        sql += values.join(',\n') + ';\n\n';
      }
    }
    
    // Write to file
    fs.writeFileSync('remed_database.sql', sql);
    console.log('Database export complete. File saved as remed_database.sql');
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('Error exporting database:', error);
  }
}

// Run the export function
exportDatabase(); 