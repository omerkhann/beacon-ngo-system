-- Fresh database setup for Beacon NGO Management System
USE master;
GO

-- Drop and recreate database
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'beacon_db')
    DROP DATABASE beacon_db;
GO

CREATE DATABASE beacon_db;
GO

USE beacon_db;
GO

-- 1. Users table
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DONOR', 'VOLUNTEER', 'CAMPAIGN_MANAGER')),
    created_at DATETIME DEFAULT GETDATE()
);

-- 2. Campaigns table (WITH manager_id)
CREATE TABLE campaigns (
    campaign_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    goal_amount DECIMAL(12, 2) NOT NULL,
    current_funds DECIMAL(12, 2) DEFAULT 0.00,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_by INT,
    manager_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (manager_id) REFERENCES users(user_id)
);

-- 3. Donations table
CREATE TABLE donations (
    donation_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    donor_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    donation_date DATETIME DEFAULT GETDATE(),
    receipt_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    FOREIGN KEY (donor_id) REFERENCES users(user_id)
);

-- 4. Expenses table
CREATE TABLE expenses (
    expense_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    created_by INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description NVARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 5. Volunteer Applications table
CREATE TABLE volunteer_applications (
    application_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    skill VARCHAR(100) NOT NULL,
    bio NVARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason NVARCHAR(255),
    reviewed_by INT,
    applied_at DATETIME DEFAULT GETDATE(),
    reviewed_at DATETIME,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

PRINT 'Database beacon_db created successfully!';
GO
