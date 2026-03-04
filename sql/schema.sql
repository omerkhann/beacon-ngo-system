-- ============================================
-- Beacon NGO Management System — Database Schema
-- Sprint 1: Campaign & Donation Core
-- ============================================

CREATE DATABASE IF NOT EXISTS beacon_db;
USE beacon_db;

-- Users table (supports Admin, Donor, Volunteer, Campaign Manager roles)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('ADMIN', 'DONOR', 'VOLUNTEER', 'CAMPAIGN_MANAGER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table (US1, US2)
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(12, 2) NOT NULL,
    current_funds DECIMAL(12, 2) DEFAULT 0.00,
    deadline DATE NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Donations table (US3, US4)
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    donor_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
