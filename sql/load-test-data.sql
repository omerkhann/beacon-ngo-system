-- Clear existing test data and reload with comprehensive data
USE beacon_ngo;
GO

-- ============================================
-- CLEAR OLD DATA (in reverse dependency order)
-- ============================================
DELETE FROM volunteer_applications;
DELETE FROM donations;
DELETE FROM expenses;
DELETE FROM campaigns;
DELETE FROM users;
GO

-- Reset IDENTITY seeds to 1
DBCC CHECKIDENT ('users', RESEED, 0);
DBCC CHECKIDENT ('campaigns', RESEED, 0);
DBCC CHECKIDENT ('donations', RESEED, 0);
DBCC CHECKIDENT ('expenses', RESEED, 0);
DBCC CHECKIDENT ('volunteer_applications', RESEED, 0);
GO

-- ============================================
-- COMPREHENSIVE TEST DATA
-- ============================================

-- Admin Users (System Administrators)
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin1', 'admin123', 'Muhammad Rashid Khan', 'rashid@beacon.org', 'ADMIN'),
('admin2', 'admin123', 'Fatima Zahra Hussain', 'fatima@beacon.org', 'ADMIN');

-- Campaign Managers
INSERT INTO users (username, password, full_name, email, role) VALUES
('manager1', 'manager123', 'Omar Farooq Malik', 'omar@beacon.org', 'CAMPAIGN_MANAGER'),
('manager2', 'manager123', 'Laiba Azhar', 'leila@beacon.org', 'CAMPAIGN_MANAGER'),
('manager3', 'manager123', 'Hassan Ibrahim Siddiqui', 'hassan@beacon.org', 'CAMPAIGN_MANAGER');

-- Donors (Individual Contributors)
INSERT INTO users (username, password, full_name, email, role) VALUES
('donor_ali', 'donor123', 'Ali Ahmad Butt', 'ali@example.com', 'DONOR'),
('donor_sara', 'donor123', 'Saira Khan', 'sara@example.com', 'DONOR'),
('donor_fatima', 'donor123', 'Fatima Mirza', 'fatima.m@example.com', 'DONOR'),
('donor_hassan', 'donor123', 'Hassan Abdullah Sheikh', 'hassan.a@example.com', 'DONOR'),
('donor_amira', 'donor123', 'Amira Khalid', 'amira@example.com', 'DONOR'),
('donor_ahmed', 'donor123', 'Ahmad Mansoor Chaudhry', 'ahmed.m@example.com', 'DONOR');

-- Volunteers
INSERT INTO users (username, password, full_name, email, role) VALUES
('vol_ayesha', 'vol123', 'Ayesha Malik', 'ayesha@example.com', 'VOLUNTEER'),
('vol_zainab', 'vol123', 'Zainab Anwar', 'zainab@example.com', 'VOLUNTEER'),
('vol_karim', 'vol123', 'Kareem Anwar Baig', 'karim@example.com', 'VOLUNTEER'),
('vol_yasmin', 'vol123', 'Yasmin Hassan', 'yasmin@example.com', 'VOLUNTEER'),
('vol_rami', 'vol123', 'Rameen Saleem', 'rami@example.com', 'VOLUNTEER'),
('vol_hana', 'vol123', 'Hana Umaira', 'hana@example.com', 'VOLUNTEER');

-- ============================================
-- CAMPAIGN DATA (with manager assignments)
-- ============================================
INSERT INTO campaigns (name, description, goal_amount, current_funds, deadline, status, created_by, manager_id) VALUES
('Clean Water Initiative', 'Providing clean drinking water to rural areas across the region.', 500000.00, 65000.00, '2026-06-30', 'ACTIVE', 1, 3),
('Education For All', 'Funding school supplies and educational programs for underprivileged children.', 300000.00, 45000.00, '2026-08-15', 'ACTIVE', 1, 4),
('Healthcare Mobile Clinic', 'Operating a mobile healthcare clinic to serve remote communities.', 250000.00, 82000.00, '2026-07-20', 'ACTIVE', 2, 5),
('Youth Skills Training', 'Vocational training programs for unemployed youth.', 180000.00, 0.00, '2026-09-30', 'ACTIVE', 3, 3),
('Women Empowerment Project', 'Providing microloans and business training for women entrepreneurs.', 400000.00, 125000.00, '2026-10-15', 'ACTIVE', 2, 4),
('Emergency Relief Fund', 'Rapid response support for disaster-affected communities.', 200000.00, 156000.00, '2026-05-31', 'ACTIVE', 1, 5);

-- ============================================
-- DONATION DATA
-- ============================================
INSERT INTO donations (campaign_id, donor_id, amount, donation_date, receipt_number) VALUES
(1, 3, 5000.00, '2026-03-15 10:30:00', 'RCP-2026-001'),
(1, 4, 10000.00, '2026-03-16 14:20:00', 'RCP-2026-002'),
(1, 5, 15000.00, '2026-03-17 09:15:00', 'RCP-2026-003'),
(1, 6, 8000.00, '2026-03-18 16:45:00', 'RCP-2026-004'),
(1, 7, 12000.00, '2026-03-19 11:30:00', 'RCP-2026-005'),
(1, 8, 15000.00, '2026-03-20 13:00:00', 'RCP-2026-006'),
(2, 3, 8000.00, '2026-03-21 10:00:00', 'RCP-2026-007'),
(2, 5, 12000.00, '2026-03-22 15:30:00', 'RCP-2026-008'),
(2, 7, 10000.00, '2026-03-23 12:00:00', 'RCP-2026-009'),
(2, 8, 15000.00, '2026-03-24 14:20:00', 'RCP-2026-010'),
(3, 4, 20000.00, '2026-03-15 11:00:00', 'RCP-2026-011'),
(3, 6, 15000.00, '2026-03-16 16:30:00', 'RCP-2026-012'),
(3, 8, 25000.00, '2026-03-17 13:45:00', 'RCP-2026-013'),
(3, 3, 22000.00, '2026-03-18 10:15:00', 'RCP-2026-014'),
(4, 5, 10000.00, '2026-03-20 09:30:00', 'RCP-2026-015'),
(5, 4, 25000.00, '2026-03-21 14:00:00', 'RCP-2026-016'),
(5, 6, 30000.00, '2026-03-22 11:20:00', 'RCP-2026-017'),
(5, 7, 35000.00, '2026-03-23 15:45:00', 'RCP-2026-018'),
(5, 8, 35000.00, '2026-03-24 12:30:00', 'RCP-2026-019'),
(6, 3, 50000.00, '2026-03-15 13:00:00', 'RCP-2026-020'),
(6, 4, 40000.00, '2026-03-16 10:45:00', 'RCP-2026-021'),
(6, 5, 35000.00, '2026-03-17 14:30:00', 'RCP-2026-022'),
(6, 7, 31000.00, '2026-03-18 16:00:00', 'RCP-2026-023');

-- ============================================
-- EXPENSE DATA
-- ============================================
INSERT INTO expenses (campaign_id, created_by, category, description, amount, expense_date) VALUES
(1, 1, 'EQUIPMENT', 'Water filtration systems', 15000.00, '2026-03-10 09:00:00'),
(1, 1, 'TRANSPORTATION', 'Vehicle rental for water distribution', 8000.00, '2026-03-12 10:30:00'),
(1, 1, 'LABOR', 'Worker wages and benefits', 22000.00, '2026-03-15 14:00:00'),
(1, 2, 'SUPPLIES', 'Plastic containers and tubes', 5000.00, '2026-03-16 11:20:00'),
(1, 2, 'MAINTENANCE', 'System maintenance and repairs', 3000.00, '2026-03-18 15:45:00'),
(2, 3, 'SUPPLIES', 'Textbooks and notebooks', 18000.00, '2026-03-11 09:15:00'),
(2, 3, 'EQUIPMENT', 'Classroom furniture', 12000.00, '2026-03-13 13:30:00'),
(2, 1, 'LABOR', 'Teacher stipends', 15000.00, '2026-03-17 10:00:00'),
(3, 2, 'EQUIPMENT', 'Medical equipment and supplies', 35000.00, '2026-03-14 08:30:00'),
(3, 2, 'TRANSPORTATION', 'Mobile clinic vehicle', 25000.00, '2026-03-15 09:00:00'),
(3, 2, 'LABOR', 'Healthcare worker salaries', 20000.00, '2026-03-19 14:15:00'),
(4, 3, 'TRAINING', 'Vocational training materials', 12000.00, '2026-03-20 10:30:00'),
(4, 3, 'LABOR', 'Instructor fees', 18000.00, '2026-03-21 11:00:00'),
(5, 1, 'ADMINISTRATION', 'Program management', 10000.00, '2026-03-22 09:45:00'),
(5, 1, 'TRAINING', 'Microbusiness training modules', 25000.00, '2026-03-23 13:20:00'),
(5, 2, 'SERVICES', 'Loan processing and monitoring', 15000.00, '2026-03-24 14:00:00'),
(6, 1, 'SUPPLIES', 'Emergency relief supplies', 45000.00, '2026-03-16 08:00:00'),
(6, 2, 'TRANSPORTATION', 'Emergency transport vehicles', 60000.00, '2026-03-17 09:30:00'),
(6, 2, 'LABOR', 'Emergency response team', 35000.00, '2026-03-18 16:45:00'),
(6, 3, 'COORDINATION', 'Coordination and logistics', 16000.00, '2026-03-19 12:00:00');

-- ============================================
-- VOLUNTEER APPLICATION DATA
-- ============================================
INSERT INTO volunteer_applications (campaign_id, volunteer_id, skill, bio, status, reviewed_by, applied_at, reviewed_at) VALUES
(1, 12, 'Water Engineering', 'Experienced water systems engineer with 5 years in NGO sector', 'APPROVED', 1, '2026-03-01 10:00:00', '2026-03-02 14:30:00'),
(1, 13, 'Project Management', 'Project manager specializing in community development', 'APPROVED', 1, '2026-03-02 11:30:00', '2026-03-03 09:15:00'),
(1, 14, 'Community Outreach', 'Social worker with strong community connections', 'PENDING', NULL, '2026-03-18 15:00:00', NULL),
(2, 15, 'Education', 'Teacher with 8 years of classroom experience', 'APPROVED', 2, '2026-03-04 13:00:00', '2026-03-05 10:45:00'),
(2, 16, 'Curriculum Development', 'Educational specialist', 'APPROVED', 2, '2026-03-05 14:20:00', '2026-03-06 11:30:00'),
(2, 17, 'Child Psychology', 'Child psychologist interested in education programs', 'REJECTED', 1, '2026-03-08 09:30:00', '2026-03-09 16:00:00'),
(3, 12, 'Medical Support', 'Nurse with emergency response background', 'APPROVED', 2, '2026-03-06 10:15:00', '2026-03-07 13:45:00'),
(3, 13, 'Logistics', 'Experienced in medical supply chain', 'APPROVED', 1, '2026-03-07 11:00:00', '2026-03-08 09:30:00'),
(3, 14, 'Administrative Support', 'Admin professional', 'PENDING', NULL, '2026-03-19 14:00:00', NULL),
(4, 15, 'Vocational Trainer', 'Skilled trainer in multiple vocations', 'APPROVED', 3, '2026-03-09 15:30:00', '2026-03-10 11:00:00'),
(4, 16, 'Career Counselor', 'Career guidance professional', 'APPROVED', 3, '2026-03-10 10:00:00', '2026-03-11 14:20:00'),
(5, 13, 'Business Mentoring', 'Entrepreneur mentor with startup experience', 'APPROVED', 1, '2026-03-11 13:45:00', '2026-03-12 10:15:00'),
(5, 15, 'Women Empowerment', 'Social activist focused on women rights', 'APPROVED', 2, '2026-03-12 11:20:00', '2026-03-13 15:30:00'),
(6, 16, 'Emergency Response', 'Emergency coordinator with disaster experience', 'APPROVED', 1, '2026-03-13 09:00:00', '2026-03-14 11:45:00'),
(6, 17, 'Relief Logistics', 'Logistics specialist in humanitarian aid', 'APPROVED', 2, '2026-03-14 14:30:00', '2026-03-15 10:00:00');

PRINT 'Database refreshed with comprehensive test data!';
GO
