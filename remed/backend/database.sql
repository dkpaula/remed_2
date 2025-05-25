-- ReMed Database Schema

CREATE DATABASE IF NOT EXISTS remed;
USE remed;

-- USER Table
CREATE TABLE IF NOT EXISTS USER (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Contact_Number VARCHAR(20),
    User_Type ENUM('Patient', 'Family', 'Nurse') NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PATIENT Table
CREATE TABLE IF NOT EXISTS PATIENT (
    User_ID INT PRIMARY KEY,
    Health_Condition TEXT,
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID) ON DELETE CASCADE
);

-- FAMILY Table
CREATE TABLE IF NOT EXISTS FAMILY (
    User_ID INT PRIMARY KEY,
    Relation_to_Patient VARCHAR(50) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID) ON DELETE CASCADE
);

-- NURSE Table
CREATE TABLE IF NOT EXISTS NURSE (
    User_ID INT PRIMARY KEY,
    Assigned_Hospital VARCHAR(100) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID) ON DELETE CASCADE
);

-- CARETAKER_PATIENT Table
CREATE TABLE IF NOT EXISTS CARETAKER_PATIENT (
    Caretaker_ID INT,
    Patient_ID INT,
    PRIMARY KEY (Caretaker_ID, Patient_ID),
    FOREIGN KEY (Caretaker_ID) REFERENCES USER(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(User_ID) ON DELETE CASCADE
);

-- MED_CABINET Table
CREATE TABLE IF NOT EXISTS MED_CABINET (
    Medicine_ID INT AUTO_INCREMENT PRIMARY KEY,
    Medicine_Name VARCHAR(100) NOT NULL,
    Generic_Name VARCHAR(100),
    Dosage VARCHAR(50) NOT NULL,
    Description TEXT,
    Expiration_Date DATE,
    Logged_By_ID INT,
    Patient_ID INT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Logged_By_ID) REFERENCES USER(User_ID) ON DELETE SET NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(User_ID) ON DELETE CASCADE
);

-- FREQUENCY Table
CREATE TABLE IF NOT EXISTS FREQUENCY (
    Frequency_ID INT AUTO_INCREMENT PRIMARY KEY,
    Medicine_ID INT,
    Time TIME NOT NULL,
    Day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily') NOT NULL,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (Medicine_ID) REFERENCES MED_CABINET(Medicine_ID) ON DELETE CASCADE
);

-- VAULT Table
CREATE TABLE IF NOT EXISTS VAULT (
    Vault_ID INT AUTO_INCREMENT PRIMARY KEY,
    Medicine_ID INT,
    Medicine_Pieces INT NOT NULL DEFAULT 0,
    Created_By INT,
    Patient_ID INT,
    Last_Updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Medicine_ID) REFERENCES MED_CABINET(Medicine_ID) ON DELETE CASCADE,
    FOREIGN KEY (Created_By) REFERENCES USER(User_ID) ON DELETE SET NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(User_ID) ON DELETE CASCADE
);

-- REPORT Table
CREATE TABLE IF NOT EXISTS REPORT (
    Report_ID INT AUTO_INCREMENT PRIMARY KEY,
    Date_Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Report_Type ENUM('Medication Log', 'Inventory Update', 'Health Update') NOT NULL,
    Creator_ID INT,
    Patient_ID INT,
    Notes TEXT,
    FOREIGN KEY (Creator_ID) REFERENCES USER(User_ID) ON DELETE SET NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PATIENT(User_ID) ON DELETE CASCADE
);

-- Insert sample data for demonstration
INSERT INTO USER (Name, Email, Password, Contact_Number, User_Type) VALUES
('John Smith', 'john@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09123456789', 'Patient'), -- password: password123
('Maria Garcia', 'maria@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09987654321', 'Family'),
('Dr. Robert Lee', 'robert@hospital.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09567891234', 'Nurse'),
('Sarah Johnson', 'sarah@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09345678912', 'Patient'),
('Michael Brown', 'michael@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09765432198', 'Family');

INSERT INTO PATIENT (User_ID, Health_Condition) VALUES
(1, 'Hypertension, Diabetes Type 2'),
(4, 'Asthma, Allergic Rhinitis');

INSERT INTO FAMILY (User_ID, Relation_to_Patient) VALUES
(2, 'Daughter'),
(5, 'Son');

INSERT INTO NURSE (User_ID, Assigned_Hospital) VALUES
(3, 'City General Hospital');

INSERT INTO CARETAKER_PATIENT (Caretaker_ID, Patient_ID) VALUES
(2, 1),
(3, 1),
(5, 4),
(3, 4);

INSERT INTO MED_CABINET (Medicine_Name, Generic_Name, Dosage, Description, Expiration_Date, Logged_By_ID, Patient_ID) VALUES
('Metformin', 'Metformin HCl', '500mg', 'Take with meals', '2024-12-31', 3, 1),
('Lisinopril', 'Lisinopril', '10mg', 'Take in the morning', '2024-10-15', 3, 1),
('Ventolin', 'Albuterol', '100mcg', 'Use as needed for breathing', '2025-01-31', 3, 4),
('Claritin', 'Loratadine', '10mg', 'Take once daily', '2024-08-20', 5, 4);

INSERT INTO FREQUENCY (Medicine_ID, Time, Day) VALUES
(1, '08:00:00', 'Daily'),
(1, '20:00:00', 'Daily'),
(2, '08:00:00', 'Daily'),
(3, '08:00:00', 'Daily'),
(3, '20:00:00', 'Daily'),
(4, '10:00:00', 'Daily');

INSERT INTO VAULT (Medicine_ID, Medicine_Pieces, Created_By, Patient_ID) VALUES
(1, 60, 3, 1),
(2, 30, 3, 1),
(3, 200, 3, 4),
(4, 28, 5, 4);

INSERT INTO REPORT (Report_Type, Creator_ID, Patient_ID, Notes) VALUES
('Medication Log', 3, 1, 'Patient started new medication regimen'),
('Inventory Update', 3, 1, 'Refilled Metformin - 60 tablets'),
('Health Update', 5, 4, 'Asthma symptoms improving with regular medication'); 