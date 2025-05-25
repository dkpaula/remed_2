/**
 * Database Check Script for ReMed
 *
 * This script checks if the database is properly set up and all required tables and columns exist
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

async function checkDatabase() {
  console.log('ReMed Database Check Tool');
  console.log('=========================');
  console.log(`Connecting to database: ${dbConfig.database}`);

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user, 
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ Database connection successful');
    
    // Check required tables
    const requiredTables = [
      'USER', 'PATIENT', 'FAMILY', 'NURSE', 'MED_CABINET', 
      'FREQUENCY', 'VAULT', 'REPORT', 'CARETAKER_PATIENT'
    ];
    
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log('\nChecking required tables:');
    let missingTables = [];
    
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`❌ Table ${table} is missing`);
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\n⚠️ Warning: Missing tables detected. Run the db-update.js script to fix.');
    } else {
      console.log('\n✅ All required tables exist');
    }
    
    // Check required columns in FREQUENCY table
    console.log('\nChecking FREQUENCY table columns:');
    const requiredFrequencyColumns = [
      'Frequency_ID', 'Medicine_ID', 'Time', 'Day', 'Status', 
      'Custom_Sound', 'Flexible_Window', 'Description', 'Period', 'Options'
    ];
    
    const [frequencyColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY'
    `, [dbConfig.database]);
    
    const frequencyColumnNames = frequencyColumns.map(col => col.COLUMN_NAME);
    let missingFrequencyColumns = [];
    
    for (const column of requiredFrequencyColumns) {
      if (frequencyColumnNames.includes(column)) {
        console.log(`✅ Column ${column} exists in FREQUENCY table`);
      } else {
        console.log(`❌ Column ${column} is missing in FREQUENCY table`);
        missingFrequencyColumns.push(column);
      }
    }
    
    if (missingFrequencyColumns.length > 0) {
      console.log('\n⚠️ Warning: Missing columns in FREQUENCY table. Run the db-update.js script to fix.');
    } else {
      console.log('\n✅ All required columns exist in FREQUENCY table');
    }
    
    // Check required columns in MED_CABINET table
    console.log('\nChecking MED_CABINET table columns:');
    const requiredMedCabinetColumns = [
      'Medicine_ID', 'Medicine_Name', 'Generic_Name', 'Dosage', 
      'Description', 'Expiration_Date', 'Logged_By_ID', 'Patient_ID', 
      'Created_At', 'Category', 'Form', 'Color', 'Shape', 
      'Image_Path', 'As_Needed', 'Notes'
    ];
    
    const [medCabinetColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'MED_CABINET'
    `, [dbConfig.database]);
    
    const medCabinetColumnNames = medCabinetColumns.map(col => col.COLUMN_NAME);
    let missingMedCabinetColumns = [];
    
    for (const column of requiredMedCabinetColumns) {
      if (medCabinetColumnNames.includes(column)) {
        console.log(`✅ Column ${column} exists in MED_CABINET table`);
      } else {
        console.log(`❌ Column ${column} is missing in MED_CABINET table`);
        missingMedCabinetColumns.push(column);
      }
    }
    
    if (missingMedCabinetColumns.length > 0) {
      console.log('\n⚠️ Warning: Missing columns in MED_CABINET table. Run the db-update.js script to fix.');
    } else {
      console.log('\n✅ All required columns exist in MED_CABINET table');
    }
    
    // Close connection
    await connection.end();
    
    // Summary
    console.log('\nSummary:');
    if (missingTables.length === 0 && missingFrequencyColumns.length === 0 && missingMedCabinetColumns.length === 0) {
      console.log('✅ Database is correctly configured');
    } else {
      console.log('⚠️ Database needs updates. Run the db-update.js script to fix issues.');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
    console.log('\n❌ Database check failed. Make sure MySQL is running and credentials are correct.');
  }
}

// Run the check function
checkDatabase(); 