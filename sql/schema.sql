-- ============================================
-- Beacon NGO Management System — Database Schema
-- Sprint 1: Campaign & Donation Core
-- ============================================

-- 1. Create Database (Check if exists first)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'beacon_db')
BEGIN
    CREATE DATABASE beacon_db;
END
GO

USE beacon_db;
GO

-- 2. Users table (Use IDENTITY for auto-increment and CHECK for ENUM)
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DONOR', 'VOLUNTEER', 'CAMPAIGN_MANAGER')),
    created_at DATETIME DEFAULT GETDATE()
);

-- 3. Campaigns table
CREATE TABLE campaigns (
    campaign_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    goal_amount DECIMAL(12, 2) NOT NULL,
    current_funds DECIMAL(12, 2) DEFAULT 0.00,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_by INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 4. Donations table
CREATE TABLE donations (
    donation_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    donor_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date DATETIME DEFAULT GETDATE(),
    receipt_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    FOREIGN KEY (donor_id) REFERENCES users(user_id)
);


-- Sample data for testing
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin1', 'admin123', 'System Admin', 'admin@beacon.org', 'ADMIN'),
('donor1', 'donor123', 'Ali Ahmed', 'ali@example.com', 'DONOR'),
('donor2', 'donor123', 'Sara Khan', 'sara@example.com', 'DONOR');

INSERT INTO campaigns (name, description, goal_amount, deadline, created_by) VALUES
('Clean Water Initiative', 'Providing clean drinking water to rural areas.', 500000.00, '2026-06-30', 1),
('Education For All', 'Funding school supplies for underprivileged children.', 300000.00, '2026-08-15', 1);