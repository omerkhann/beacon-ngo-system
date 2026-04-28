-- Migration: Add manager_id to campaigns table
USE beacon_db;
GO

-- Drop foreign key constraint if it exists
IF OBJECT_ID('FK__campaigns__manager_id', 'F') IS NOT NULL
    ALTER TABLE campaigns DROP CONSTRAINT FK__campaigns__manager_id;

-- Check if column exists, if not add it
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'manager_id')
BEGIN
    ALTER TABLE campaigns ADD manager_id INT;
    ALTER TABLE campaigns ADD CONSTRAINT FK__campaigns__manager_id 
        FOREIGN KEY (manager_id) REFERENCES users(user_id);
    PRINT 'Added manager_id column to campaigns table';
END
ELSE
BEGIN
    PRINT 'manager_id column already exists';
END
GO
