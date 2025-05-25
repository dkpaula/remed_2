/**
 * Database Initialization Script for ReMed
 *
 * This script will create the initial database schema for ReMed
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { dbConfig } = require('./config');

async function initializeDatabase() {
  console.log('Starting database initialization script...');
  console.log(`Connecting to database: ${dbConfig.database}`);

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user, 
      password: dbConfig.password,
      multipleStatements: true // Required for running multiple SQL statements
    });

    console.log('Connected to MySQL server.');

    // Try to create database if it doesn't exist
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
      console.log(`Database '${dbConfig.database}' created or already exists.`);
    } catch (err) {
      console.error('Error creating database:', err);
      process.exit(1);
    }

    // Switch to the database
    await connection.query(`USE ${dbConfig.database}`);
    console.log(`Using database: ${dbConfig.database}`);

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    let sql = await fs.readFile(sqlFilePath, 'utf8');
    
    console.log('Executing database schema script...');
    await connection.query(sql);
    console.log('Base schema created successfully.');

    // Apply Medisafe updates
    const medisafeUpdatesPath = path.join(__dirname, 'medisafe_updates.sql');
    console.log('Applying Medisafe updates...');
    
    try {
      const medisafeSQL = await fs.readFile(medisafeUpdatesPath, 'utf8');
      await connection.query(medisafeSQL);
      console.log('Medisafe updates applied successfully.');
    } catch (err) {
      console.error('Error applying Medisafe updates:', err);
      // Continue anyway as this is not critical
    }

    // Run db-update.js to ensure all columns are created
    console.log('Running db-update.js to ensure all columns are created...');
    
    // Get all available columns in FREQUENCY table
    const [frequencyColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY'
    `, [dbConfig.database]);

    const existingFrequencyColumns = frequencyColumns.map(col => col.COLUMN_NAME);
    
    // Add missing columns to FREQUENCY table
    const requiredColumns = [
      { name: 'Custom_Sound', type: "VARCHAR(100) DEFAULT 'default'" },
      { name: 'Flexible_Window', type: "INT DEFAULT 30" },
      { name: 'Description', type: "TEXT" },
      { name: 'Period', type: "ENUM('Morning', 'Afternoon', 'Evening', 'Night', 'Custom') DEFAULT 'Custom'" },
      { name: 'Options', type: "JSON DEFAULT NULL" }
    ];
    
    for (const col of requiredColumns) {
      if (!existingFrequencyColumns.includes(col.name)) {
        console.log(`Adding ${col.name} column to FREQUENCY table...`);
        await connection.query(`
          ALTER TABLE FREQUENCY 
          ADD COLUMN ${col.name} ${col.type}
        `);
      }
    }
    
    // Get all available columns in MED_CABINET table
    const [medCabinetColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'MED_CABINET'
    `, [dbConfig.database]);

    const existingMedCabinetColumns = medCabinetColumns.map(col => col.COLUMN_NAME);
    
    // Add missing columns to MED_CABINET table
    const requiredMedCabinetColumns = [
      { name: 'Category', type: "ENUM('Prescription', 'OTC', 'Vitamin', 'Supplement', 'Other') DEFAULT 'Other'" },
      { name: 'Form', type: "ENUM('Tablet', 'Capsule', 'Liquid', 'Injection', 'Inhaler', 'Patch', 'Other') DEFAULT 'Tablet'" },
      { name: 'Color', type: "VARCHAR(50)" },
      { name: 'Shape', type: "VARCHAR(50)" },
      { name: 'Image_Path', type: "VARCHAR(255)" },
      { name: 'As_Needed', type: "BOOLEAN DEFAULT FALSE" },
      { name: 'Notes', type: "TEXT" }
    ];
    
    for (const col of requiredMedCabinetColumns) {
      if (!existingMedCabinetColumns.includes(col.name)) {
        console.log(`Adding ${col.name} column to MED_CABINET table...`);
        await connection.query(`
          ALTER TABLE MED_CABINET 
          ADD COLUMN ${col.name} ${col.type}
        `);
      }
    }

    // Close connection
    await connection.end();

    console.log('Database initialization completed successfully.');
    console.log('ReMed database is now ready for use!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 