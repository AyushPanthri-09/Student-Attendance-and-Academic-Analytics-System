-- Run this in MySQL to reset the database
-- Replace 'your_database_name' with your actual database name (e.g., academic_erp)

-- Option 1: Drop and recreate database (RECOMMENDED)
DROP DATABASE IF EXISTS academic_erp;
CREATE DATABASE academic_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Option 2: If you want to keep the database but drop all tables
-- Uncomment and use this instead if you prefer:
/*
USE academic_erp;
SET FOREIGN_KEY_CHECKS = 0;
SELECT CONCAT('DROP TABLE IF EXISTS ', table_name, ';') 
FROM information_schema.tables 
WHERE table_schema = 'academic_erp';
SET FOREIGN_KEY_CHECKS = 1;
*/
