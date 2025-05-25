-- ReMed Database Schema Updates for FREQUENCY table
USE remed;

-- Add all missing columns to FREQUENCY table if they don't exist
-- First, check if Custom_Sound column exists
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Custom_Sound'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE FREQUENCY ADD COLUMN Custom_Sound VARCHAR(100) DEFAULT "default"', 
    'SELECT "Custom_Sound column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if Flexible_Window column exists
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Flexible_Window'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE FREQUENCY ADD COLUMN Flexible_Window INT DEFAULT 30', 
    'SELECT "Flexible_Window column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if Description column exists
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Description'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE FREQUENCY ADD COLUMN Description TEXT', 
    'SELECT "Description column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if Period column exists
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Period'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE FREQUENCY ADD COLUMN Period ENUM("Morning", "Afternoon", "Evening", "Night", "Custom") DEFAULT "Custom"', 
    'SELECT "Period column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if Options column exists
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'FREQUENCY' AND COLUMN_NAME = 'Options'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE FREQUENCY ADD COLUMN Options JSON DEFAULT NULL AFTER Status', 
    'SELECT "Options column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add missing columns to MED_CABINET if they don't exist (reported in earlier errors)
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'MED_CABINET' AND COLUMN_NAME = 'Category'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE MED_CABINET ADD COLUMN Category ENUM("Prescription", "OTC", "Vitamin", "Supplement", "Other") DEFAULT "Other"', 
    'SELECT "Category column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Additional columns for MED_CABINET from medisafe_updates.sql if needed
SET @columnExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'remed' AND TABLE_NAME = 'MED_CABINET' AND COLUMN_NAME = 'Form'
);

SET @stmt = IF(@columnExists = 0, 
    'ALTER TABLE MED_CABINET ADD COLUMN Form ENUM("Tablet", "Capsule", "Liquid", "Injection", "Inhaler", "Patch", "Other") DEFAULT "Tablet"', 
    'SELECT "Form column already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 