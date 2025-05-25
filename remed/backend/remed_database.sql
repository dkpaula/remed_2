-- ReMed Database Export
-- Generated on 2025-05-17T07:06:43.037Z

CREATE DATABASE IF NOT EXISTS remed;
USE remed;

CREATE TABLE `CARETAKER_PATIENT` (
  `Caretaker_ID` int NOT NULL,
  `Patient_ID` int NOT NULL,
  PRIMARY KEY (`Caretaker_ID`,`Patient_ID`),
  KEY `Patient_ID` (`Patient_ID`),
  CONSTRAINT `caretaker_patient_ibfk_1` FOREIGN KEY (`Caretaker_ID`) REFERENCES `USER` (`User_ID`) ON DELETE CASCADE,
  CONSTRAINT `caretaker_patient_ibfk_2` FOREIGN KEY (`Patient_ID`) REFERENCES `PATIENT` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table CARETAKER_PATIENT
INSERT INTO CARETAKER_PATIENT VALUES
(2, 1),
(3, 1),
(3, 4),
(5, 4);

CREATE TABLE `FAMILY` (
  `User_ID` int NOT NULL,
  `Relation_to_Patient` varchar(50) NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `family_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `USER` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table FAMILY
INSERT INTO FAMILY VALUES
(2, 'Daughter'),
(5, 'Son');

CREATE TABLE `FREQUENCY` (
  `Frequency_ID` int NOT NULL AUTO_INCREMENT,
  `Medicine_ID` int DEFAULT NULL,
  `Time` time NOT NULL,
  `Day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Daily') NOT NULL,
  `Status` enum('Active','Inactive') DEFAULT 'Active',
  `Options` json DEFAULT NULL,
  `Custom_Sound` varchar(100) DEFAULT 'default',
  `Flexible_Window` int DEFAULT '30',
  `Description` text,
  `Period` enum('Morning','Afternoon','Evening','Night','Custom') DEFAULT 'Custom',
  PRIMARY KEY (`Frequency_ID`),
  KEY `Medicine_ID` (`Medicine_ID`),
  CONSTRAINT `frequency_ibfk_1` FOREIGN KEY (`Medicine_ID`) REFERENCES `MED_CABINET` (`Medicine_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table FREQUENCY
INSERT INTO FREQUENCY VALUES
(1, 1, '08:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom'),
(2, 1, '20:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom'),
(3, 2, '08:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom'),
(4, 3, '08:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom'),
(5, 3, '20:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom'),
(6, 4, '10:00:00', 'Daily', 'Active', NULL, 'default', 30, NULL, 'Custom');

CREATE TABLE `MED_CABINET` (
  `Medicine_ID` int NOT NULL AUTO_INCREMENT,
  `Medicine_Name` varchar(100) NOT NULL,
  `Generic_Name` varchar(100) DEFAULT NULL,
  `Dosage` varchar(50) NOT NULL,
  `Description` text,
  `Expiration_Date` date DEFAULT NULL,
  `Logged_By_ID` int DEFAULT NULL,
  `Patient_ID` int DEFAULT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Category` enum('Prescription','OTC','Vitamin','Supplement','Other') DEFAULT 'Other',
  `Form` enum('Tablet','Capsule','Liquid','Injection','Inhaler','Patch','Other') DEFAULT 'Tablet',
  `Color` varchar(50) DEFAULT NULL,
  `Shape` varchar(50) DEFAULT NULL,
  `Image_Path` varchar(255) DEFAULT NULL,
  `As_Needed` tinyint(1) DEFAULT '0',
  `Notes` text,
  PRIMARY KEY (`Medicine_ID`),
  KEY `Logged_By_ID` (`Logged_By_ID`),
  KEY `Patient_ID` (`Patient_ID`),
  CONSTRAINT `med_cabinet_ibfk_1` FOREIGN KEY (`Logged_By_ID`) REFERENCES `USER` (`User_ID`) ON DELETE SET NULL,
  CONSTRAINT `med_cabinet_ibfk_2` FOREIGN KEY (`Patient_ID`) REFERENCES `PATIENT` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table MED_CABINET
INSERT INTO MED_CABINET VALUES
(1, 'Metformin', 'Metformin HCl', '500mg', 'Take with meals', '2024-12-30 16:00:00', 3, 1, '2025-05-16 14:36:19', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(2, 'Lisinopril', 'Lisinopril', '10mg', 'Take in the morning', '2024-10-14 16:00:00', 3, 1, '2025-05-16 14:36:19', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(3, 'Ventolin', 'Albuterol', '100mcg', 'Use as needed for breathing', '2025-01-30 16:00:00', 3, 4, '2025-05-16 14:36:19', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(4, 'Claritin', 'Loratadine', '10mg', 'Take once daily', '2024-08-19 16:00:00', 5, 4, '2025-05-16 14:36:19', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(5, 'Ibuprofen (Advil, Motrin)', 'Ibuprofen', '500mg', '', NULL, 31, 31, '2025-05-17 03:31:08', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(6, 'Acetaminophen (Tylenol)', 'Acetaminophen', '500mg', '', '2025-05-26 16:00:00', 31, 31, '2025-05-17 03:53:41', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL),
(7, 'Metformin (Glucophage)', 'Metformin', '10mg', '', NULL, 31, 31, '2025-05-17 04:07:04', 'Other', 'Tablet', NULL, NULL, NULL, 0, NULL);

CREATE TABLE `NURSE` (
  `User_ID` int NOT NULL,
  `Assigned_Hospital` varchar(100) NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `nurse_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `USER` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table NURSE
INSERT INTO NURSE VALUES
(3, 'City General Hospital');

CREATE TABLE `PATIENT` (
  `User_ID` int NOT NULL,
  `Health_Condition` text,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `USER` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table PATIENT
INSERT INTO PATIENT VALUES
(1, 'Hypertension, Diabetes Type 2'),
(4, 'Asthma, Allergic Rhinitis'),
(31, '');

CREATE TABLE `REPORT` (
  `Report_ID` int NOT NULL AUTO_INCREMENT,
  `Date_Created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Report_Type` enum('Medication Log','Inventory Update','Health Update') NOT NULL,
  `Creator_ID` int DEFAULT NULL,
  `Patient_ID` int DEFAULT NULL,
  `Notes` text,
  PRIMARY KEY (`Report_ID`),
  KEY `Creator_ID` (`Creator_ID`),
  KEY `Patient_ID` (`Patient_ID`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`Creator_ID`) REFERENCES `USER` (`User_ID`) ON DELETE SET NULL,
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`Patient_ID`) REFERENCES `PATIENT` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table REPORT
INSERT INTO REPORT VALUES
(1, '2025-05-16 14:36:19', 'Medication Log', 3, 1, 'Patient started new medication regimen'),
(2, '2025-05-16 14:36:19', 'Inventory Update', 3, 1, 'Refilled Metformin - 60 tablets'),
(3, '2025-05-16 14:36:19', 'Health Update', 5, 4, 'Asthma symptoms improving with regular medication'),
(4, '2025-05-17 03:31:08', 'Medication Log', 31, 31, 'Added new medicine: Ibuprofen (Advil, Motrin), Initial quantity: 3'),
(5, '2025-05-17 03:53:41', 'Medication Log', 31, 31, 'Added new medicine: Acetaminophen (Tylenol), Initial quantity: 7'),
(6, '2025-05-17 04:07:04', 'Medication Log', 31, 31, 'Added new medicine: Metformin (Glucophage), Initial quantity: 4');

CREATE TABLE `USER` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Contact_Number` varchar(20) DEFAULT NULL,
  `User_Type` enum('Patient','Family','Nurse') NOT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table USER
INSERT INTO USER VALUES
(1, 'John Smith', 'john@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09123456789', 'Patient', '2025-05-16 14:36:19'),
(2, 'Maria Garcia', 'maria@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09987654321', 'Family', '2025-05-16 14:36:19'),
(3, 'Dr. Robert Lee', 'robert@hospital.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09567891234', 'Nurse', '2025-05-16 14:36:19'),
(4, 'Sarah Johnson', 'sarah@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09345678912', 'Patient', '2025-05-16 14:36:19'),
(5, 'Michael Brown', 'michael@example.com', '$2b$10$7JfHRZtU5zqM5BUxx9QV5O.YX.K4vUi8Z7LmV4xyD.j5CIL5wSAEq', '09765432198', 'Family', '2025-05-16 14:36:19'),
(31, 'Dan Hehe', 'danhehe@example.com', '$2b$10$KvyiKOPli55az3ipPdfv9.NimbZPNvxT3CQkDMs6JQLEpi0QCXSpi', '0987654321', 'Patient', '2025-05-16 15:03:17');

CREATE TABLE `VAULT` (
  `Vault_ID` int NOT NULL AUTO_INCREMENT,
  `Medicine_ID` int DEFAULT NULL,
  `Medicine_Pieces` int NOT NULL DEFAULT '0',
  `Created_By` int DEFAULT NULL,
  `Patient_ID` int DEFAULT NULL,
  `Last_Updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Vault_ID`),
  KEY `Medicine_ID` (`Medicine_ID`),
  KEY `Created_By` (`Created_By`),
  KEY `Patient_ID` (`Patient_ID`),
  CONSTRAINT `vault_ibfk_1` FOREIGN KEY (`Medicine_ID`) REFERENCES `MED_CABINET` (`Medicine_ID`) ON DELETE CASCADE,
  CONSTRAINT `vault_ibfk_2` FOREIGN KEY (`Created_By`) REFERENCES `USER` (`User_ID`) ON DELETE SET NULL,
  CONSTRAINT `vault_ibfk_3` FOREIGN KEY (`Patient_ID`) REFERENCES `PATIENT` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for table VAULT
INSERT INTO VAULT VALUES
(1, 1, 60, 3, 1, '2025-05-16 14:36:19'),
(2, 2, 30, 3, 1, '2025-05-16 14:36:19'),
(3, 3, 200, 3, 4, '2025-05-16 14:36:19'),
(4, 4, 28, 5, 4, '2025-05-16 14:36:19'),
(5, 5, 3, 31, 31, '2025-05-17 03:31:08'),
(6, 6, 7, 31, 31, '2025-05-17 03:53:41'),
(7, 7, 4, 31, 31, '2025-05-17 04:07:04');

