-- ============================================
-- Beacon NGO Management System
-- Sprint 2 Migration (US5-US8 only)
-- ============================================

USE beacon_db;
GO

-- US5: Expenses table
IF OBJECT_ID('expenses', 'U') IS NULL
BEGIN
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
END
GO

-- US6/US7: Volunteer Applications table
IF OBJECT_ID('volunteer_applications', 'U') IS NULL
BEGIN
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
END
GO

-- Seed a volunteer user if missing (US6 testing)
IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'volunteer1')
BEGIN
    INSERT INTO users (username, password, full_name, email, role)
    VALUES ('volunteer1', 'vol123', 'Ayesha Malik', 'ayesha@example.com', 'VOLUNTEER');
END
GO
