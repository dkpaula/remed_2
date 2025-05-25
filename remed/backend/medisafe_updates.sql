-- ReMed Database Updates for Medisafe-like Features

USE remed;

-- Add medication categories
ALTER TABLE MED_CABINET 
ADD COLUMN Category ENUM('Prescription', 'OTC', 'Vitamin', 'Supplement', 'Other') DEFAULT 'Other',
ADD COLUMN Form ENUM('Tablet', 'Capsule', 'Liquid', 'Injection', 'Inhaler', 'Patch', 'Other') DEFAULT 'Tablet',
ADD COLUMN Color VARCHAR(50),
ADD COLUMN Shape VARCHAR(50),
ADD COLUMN Image_Path VARCHAR(255),
ADD COLUMN As_Needed BOOLEAN DEFAULT FALSE,
ADD COLUMN Notes TEXT;

-- Create table for medication interaction warnings
CREATE TABLE IF NOT EXISTS MED_INTERACTIONS (
    Interaction_ID INT AUTO_INCREMENT PRIMARY KEY,
    Medicine_ID_1 INT,
    Medicine_ID_2 INT,
    Severity ENUM('Low', 'Medium', 'High') NOT NULL,
    Description TEXT NOT NULL,
    FOREIGN KEY (Medicine_ID_1) REFERENCES MED_CABINET(Medicine_ID) ON DELETE CASCADE,
    FOREIGN KEY (Medicine_ID_2) REFERENCES MED_CABINET(Medicine_ID) ON DELETE CASCADE
);

-- Enhance reminders with more features
ALTER TABLE FREQUENCY 
ADD COLUMN Custom_Sound VARCHAR(100) DEFAULT 'default',
ADD COLUMN Flexible_Window INT DEFAULT 30, -- Minutes
ADD COLUMN Description TEXT,
ADD COLUMN Period ENUM('Morning', 'Afternoon', 'Evening', 'Night', 'Custom') DEFAULT 'Custom';

-- Create medication intake tracking
CREATE TABLE IF NOT EXISTS MED_INTAKE (
    Intake_ID INT AUTO_INCREMENT PRIMARY KEY,
    Frequency_ID INT,
    Status ENUM('Taken', 'Skipped', 'Missed') NOT NULL,
    Taken_At TIMESTAMP,
    Scheduled_For TIMESTAMP NOT NULL,
    Notes TEXT,
    FOREIGN KEY (Frequency_ID) REFERENCES FREQUENCY(Frequency_ID) ON DELETE CASCADE
);

-- Tracking for adherence statistics
CREATE TABLE IF NOT EXISTS ADHERENCE_STATS (
    Stat_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT,
    Medicine_ID INT,
    Period_Start DATE NOT NULL,
    Period_End DATE NOT NULL,
    Total_Scheduled INT NOT NULL,
    Total_Taken INT NOT NULL,
    Adherence_Percentage DECIMAL(5,2),
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Medicine_ID) REFERENCES MED_CABINET(Medicine_ID) ON DELETE CASCADE
);

-- User preferences for personalization
CREATE TABLE IF NOT EXISTS USER_PREFERENCES (
    User_ID INT PRIMARY KEY,
    Theme VARCHAR(50) DEFAULT 'default',
    Reminder_Sound VARCHAR(100) DEFAULT 'default',
    Hide_Taken_Meds BOOLEAN DEFAULT FALSE,
    Preferred_Units VARCHAR(20) DEFAULT 'metric',
    Health_Goals TEXT,
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID) ON DELETE CASCADE
);

-- Insert some sample data for the new fields
INSERT INTO USER_PREFERENCES (User_ID, Theme, Reminder_Sound, Hide_Taken_Meds)
SELECT User_ID, 'default', 'bell', FALSE FROM USER WHERE User_Type = 'Patient';

-- Update existing medicines with categories
UPDATE MED_CABINET SET Category = 'Prescription' WHERE Medicine_ID IN (1, 2);
UPDATE MED_CABINET SET Category = 'OTC' WHERE Medicine_ID IN (3, 4);

-- Add some medicine forms and appearances
UPDATE MED_CABINET SET Form = 'Tablet', Color = 'White', Shape = 'Round' WHERE Medicine_ID = 1;
UPDATE MED_CABINET SET Form = 'Capsule', Color = 'Blue', Shape = 'Oblong' WHERE Medicine_ID = 2;
UPDATE MED_CABINET SET Form = 'Inhaler', Color = 'Blue', Shape = 'Inhaler' WHERE Medicine_ID = 3;
UPDATE MED_CABINET SET Form = 'Tablet', Color = 'Pink', Shape = 'Round' WHERE Medicine_ID = 4; 