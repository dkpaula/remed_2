/**
 * Database Update Script for ReMed
 *
 * This script will apply all necessary database schema updates
 * to fix the missing columns in the FREQUENCY and MED_CABINET tables
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { dbConfig } = require('./config');

async function applyUpdates() {
  console.log('Starting database update script...');
  console.log(`Connecting to database: ${dbConfig.database}`);

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user, 
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true // Required for running multiple SQL statements
    });

    console.log('Database connection established successfully.');
    console.log('Checking current schema...');

    // Check which columns exist in FREQUENCY table
    const [frequencyColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'FREQUENCY'
    `, [dbConfig.database]);

    const existingFrequencyColumns = frequencyColumns.map(col => col.COLUMN_NAME);

    console.log('Current FREQUENCY table columns:');
    console.log(existingFrequencyColumns);

    // Perform updates based on what's missing
    let updateActions = [];

    // Check for Custom_Sound column
    if (!existingFrequencyColumns.includes('Custom_Sound')) {
      console.log('Adding Custom_Sound column...');
      await connection.query(`
        ALTER TABLE FREQUENCY 
        ADD COLUMN Custom_Sound VARCHAR(100) DEFAULT 'default'
      `);
      updateActions.push('Added Custom_Sound column');
    }

    // Check for Flexible_Window column
    if (!existingFrequencyColumns.includes('Flexible_Window')) {
      console.log('Adding Flexible_Window column...');
      await connection.query(`
        ALTER TABLE FREQUENCY 
        ADD COLUMN Flexible_Window INT DEFAULT 30
      `);
      updateActions.push('Added Flexible_Window column');
    }

    // Check for Description column
    if (!existingFrequencyColumns.includes('Description')) {
      console.log('Adding Description column...');
      await connection.query(`
        ALTER TABLE FREQUENCY 
        ADD COLUMN Description TEXT
      `);
      updateActions.push('Added Description column');
    }

    // Check for Period column
    if (!existingFrequencyColumns.includes('Period')) {
      console.log('Adding Period column...');
      await connection.query(`
        ALTER TABLE FREQUENCY 
        ADD COLUMN Period ENUM('Morning', 'Afternoon', 'Evening', 'Night', 'Custom') DEFAULT 'Custom'
      `);
      updateActions.push('Added Period column');
    }

    // Check for Options column
    if (!existingFrequencyColumns.includes('Options')) {
      console.log('Adding Options column...');
      await connection.query(`
        ALTER TABLE FREQUENCY 
        ADD COLUMN Options JSON DEFAULT NULL AFTER Status
      `);
      updateActions.push('Added Options column');
    }

    // Check MED_CABINET columns
    const [medCabinetColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'MED_CABINET'
    `, [dbConfig.database]);

    const existingMedCabinetColumns = medCabinetColumns.map(col => col.COLUMN_NAME);

    console.log('Current MED_CABINET table columns:');
    console.log(existingMedCabinetColumns);

    // Check for Category column
    if (!existingMedCabinetColumns.includes('Category')) {
      console.log('Adding Category column...');
      await connection.query(`
        ALTER TABLE MED_CABINET 
        ADD COLUMN Category ENUM('Prescription', 'OTC', 'Vitamin', 'Supplement', 'Other') DEFAULT 'Other'
      `);
      updateActions.push('Added Category column to MED_CABINET');
    }

    // Check for Form column
    if (!existingMedCabinetColumns.includes('Form')) {
      console.log('Adding Form column...');
      await connection.query(`
        ALTER TABLE MED_CABINET 
        ADD COLUMN Form ENUM('Tablet', 'Capsule', 'Liquid', 'Injection', 'Inhaler', 'Patch', 'Other') DEFAULT 'Tablet'
      `);
      updateActions.push('Added Form column to MED_CABINET');
    }

    // Check for other columns from medisafe_updates.sql
    const otherColumns = [
      { name: 'Color', type: 'VARCHAR(50)' },
      { name: 'Shape', type: 'VARCHAR(50)' },
      { name: 'Image_Path', type: 'VARCHAR(255)' },
      { name: 'As_Needed', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'Notes', type: 'TEXT' }
    ];

    for (const col of otherColumns) {
      if (!existingMedCabinetColumns.includes(col.name)) {
        console.log(`Adding ${col.name} column...`);
        await connection.query(`
          ALTER TABLE MED_CABINET 
          ADD COLUMN ${col.name} ${col.type}
        `);
        updateActions.push(`Added ${col.name} column to MED_CABINET`);
      }
    }

    // Close connection
    await connection.end();

    if (updateActions.length === 0) {
      console.log('No schema updates were needed.');
    } else {
      console.log('Database schema updates completed successfully:');
      updateActions.forEach((action, i) => console.log(`${i + 1}. ${action}`));
    }

    console.log('Database is now ready for use!');
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the update
applyUpdates(); 