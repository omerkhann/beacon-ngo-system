# 🏛️ Beacon — NGO & Volunteering Management System

**Version:** 3.0 (Sprint 3 Complete) | **Course:** Software Engineering (FAST-NUCES)  
**Status:** ✅ Fully Functional & Production-Ready | **Team:** SOLBIX

A comprehensive full-stack web application designed to solve operational chaos faced by NGOs worldwide. Instead of juggling spreadsheets, paper forms, and fragmented systems, Beacon provides a single, unified platform where admins create campaigns, managers assign tasks, donors contribute funds, and volunteers track their work—with every transaction auditable and transparent.

## 📋 Project Vision

Beacon helps NGOs move away from spreadsheets and manual tracking by giving admins, managers, donors, and volunteers a single platform for fundraising, volunteer coordination, expense transparency, and impact reporting.

## 👥 Team

| Name           | Role                                              | GitHub                                           |
|----------------|---------------------------------------------------|--------------------------------------------------|
| M. Omer Khan   | Developr/ Backened/ Scrum Master & Product Owner  | [@omerkhann](https://github.com/omerkhann)       |
| Ibrahim Azad   | System Architect/ Database & Lead Developer       | [@ibrahim-azad](https://github.com/ibrahim-azad) |
| M. Basit Rauf  | QA Engineer & UI/UX Designer                      | [@i200461](https://github.com/i200461)           |

**Team Name:** Team SOLBIX

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Java 17, JDBC, REST API |
| **Database** | Microsoft SQL Server |
| **Build / Test** | Maven, JUnit 5, Mockito |

## 🎯 Core Features by Sprint

### Sprint 1: Campaign & Donation Core 🚀
Founded on the "Financial Engine" pillar—making NGO income and spending transparent.

- **US1: Campaign Creation** — Admins create fundraising campaigns with goal amount, deadline, and description. Validation ensures goal > 0, deadline is required.
- **US2: Campaign Dashboard** — Public users browse active/past campaigns with real-time progress bars showing funds raised vs. goal.
- **US3: Donation Processing** — Donors contribute securely with validation: amount > 0, only active campaigns accept donations, transactions are atomic (all-or-nothing).
- **US4: Donation History & Receipts** — Donors view past contributions, download receipts, and track impact. Receipt numbers are unique and immutable.
- **US5: Expense Logging** — Managers categorize and record campaign expenses. Validation: amount > 0, cannot exceed remaining campaign balance.

**Validation Rules:**
- Campaign goal must be positive integer
- Donation amount must be positive integer
- Only campaigns with status = ACTIVE accept donations
- Expense amount cannot exceed (campaign_goal - sum_of_donations)

### Sprint 2: Volunteer & Administrative Management 👥
Focused on the "People Power" pillar—coordinating human resources and detailed financial reporting.

- **US6: Volunteer Application** — Volunteers apply to campaigns with skill selection and bio/statement of interest. Prevents duplicate applications to same campaign.
- **US7: Admin Approval Workflow** — Admins/managers review applications in data table, approve/reject with mandatory feedback reason. Rejection reason cannot be empty.
- **US8: Detailed Expense Management** — Expenses categorized (Supplies, Logistics, etc.) for complete audit trails. Each entry tracks date, amount, approver.
- **US9: Impact Reporting** — Visual dashboards (charts/graphs) showing campaign success metrics vs. expenses; displays funds raised, expenses, net impact, achievement percentage.
- **US10: Task Assignment & Tracking** — Volunteers view assigned tasks with descriptions and status (Not Started, In Progress, Completed).

**Validation Rules:**
- Applications require: campaign_id, skill_name, bio_text
- Rejection reason field is required when status = REJECTED
- Tasks can only be assigned to volunteers with application status = APPROVED
- Service hours must be ≥ 0 (non-negative)

### Sprint 3: Advanced Features & Analytics 📊
Enhancing the system with modern UX, advanced analytics, and comprehensive management tools.

- **US11: Multi-Role Authentication** — Secure login/signup with role-based access control. Username ≥ 3 chars, Password ≥ 6 chars with uppercase + number.
  - Roles: ADMIN (full system access), CAMPAIGN_MANAGER (own campaigns), VOLUNTEER, DONOR
- **US12: Campaign Search & Discovery** — Real-time filtering by name, status (ACTIVE/COMPLETED/CANCELLED), goal amount range, deadline.
- **US13: Interactive Donor Flow** — Step-by-step donation modal with form validation, instant receipt generation.
- **US14: Admin Volunteer Approval Pipeline** — Review table showing applications with approve/reject actions, mandatory rejection feedback, email notification.
- **US15: Manager Task Delegation** — Campaign managers assign specific tasks to approved volunteers with title, description, deadline.
- **US16: Volunteer Task Console** — Personal dashboard showing assigned tasks with status updates, service hour logging, completion date tracking.
- **US17: Financial Analytics Dashboard** — Admin/Manager dashboard with charts: funds raised trends, expense breakdown by category, net impact over time, achievement %.

**Backend Validation Rules (Service Layer):**
```
UserService:
  - username.length >= 3 AND unique
  - password.length >= 6 AND contains [A-Z] AND contains [0-9]

CampaignService:
  - name != null AND name.length > 0
  - goal_amount > 0
  - deadline != null

DonationService:
  - amount > 0
  - campaign.status == ACTIVE (enforced at service level)
  - transaction is atomic (fund updated or nothing)

ExpenseService:
  - amount > 0
  - (campaign.goal - sum(donations)) >= amount

VolunteerApplicationService:
  - campaign_id, skill, bio all required
  - rejection_reason required when rejecting

VolunteerTaskService:
  - status IN ['Not Started', 'In Progress', 'Completed']
  - service_hours >= 0
  - Only approved volunteers can receive tasks

ImpactReportService:
  - Aggregates: total_funds, total_expenses, net_impact
  - Groups by campaign_id
```

## 📂 Project Structure & Architecture

```
beacon-ngo-system/
├── src/
│   ├── main/java/com/beacon/
│   │   ├── ApiOnly.java                 # API server entry point (port 7000)
│   │   ├── Main.java                    # JavaFX UI entry point (legacy)
│   │   ├── api/                         # REST API endpoints (Express.js / Java routing)
│   │   ├── service/                     # Business logic layer (8 service classes)
│   │   │   ├── UserService.java
│   │   │   ├── CampaignService.java
│   │   │   ├── DonationService.java
│   │   │   ├── ExpenseService.java
│   │   │   ├── VolunteerApplicationService.java
│   │   │   ├── VolunteerTaskService.java
│   │   │   ├── ImpactReportService.java
│   │   │   └── (All with input validation & business rules)
│   │   ├── dao/                         # Data Access Objects (JDBC to SQL Server)
│   │   ├── model/                       # Java POJOs (User, Campaign, Donation, Expense, VolunteerApplication, VolunteerTask, ImpactReport)
│   │   ├── util/                        # DBConnection, Utils
│   │   └── resources/
│   │       └── styles/beacon.css        # (Legacy UI styling)
│   │
│   └── test/java/com/beacon/
│       └── service/                     # JUnit 5 Test Suite
│           ├── TestUtils.java           # Reflection-based mock injection utility
│           ├── UserServiceTest.java     # 3 tests: login, signup validation, password rules
│           ├── CampaignServiceTest.java # 3 tests: validation rules
│           ├── DonationServiceTest.java # 3+ tests: amount validation, active campaign check
│           ├── ExpenseServiceTest.java  # 3+ tests: balance validation
│           ├── VolunteerApplicationServiceTest.java  # 3+ tests
│           ├── VolunteerTaskServiceTest.java         # 3+ tests: status/hours validation
│           └── ImpactReportServiceTest.java          # 2+ tests: data aggregation
│
├── frontend/
│   ├── artifacts/
│   │   ├── beacon/                      # React 18 SPA Frontend
│   │   │   ├── src/
│   │   │   │   ├── App.tsx              # Main router component
│   │   │   │   ├── main.tsx             # React DOM render
│   │   │   │   ├── store.tsx            # Global state management
│   │   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   │   ├── components/
│   │   │   │   │   ├── public-header.tsx
│   │   │   │   │   ├── public-footer.tsx
│   │   │   │   │   ├── layout/          # Layout components
│   │   │   │   │   └── ui/              # Reusable UI components
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── use-mobile.tsx
│   │   │   │   │   └── use-toast.ts
│   │   │   │   ├── lib/
│   │   │   │   │   ├── api.ts           # API client/fetch logic
│   │   │   │   │   └── utils.ts         # Utility functions
│   │   │   │   ├── pages/               # Route pages (Campaign, Donations, Volunteers, Reports, etc.)
│   │   │   │   └── assets/              # Images, logos
│   │   │   ├── vite.config.ts
│   │   │   ├── tsconfig.json
│   │   │   └── package.json
│   │   │
│   │   └── api-server/                  # Node.js/Express REST API (alternative backend)
│   │       ├── src/
│   │       │   ├── app.ts
│   │       │   ├── index.ts
│   │       │   ├── routes/              # API endpoints
│   │       │   ├── lib/logger.ts
│   │       │   └── middlewares/
│   │       └── package.json
│   │
│   └── lib/
│       ├── api-client-react/            # Generated React API hooks
│       ├── api-spec/
│       │   ├── openapi.yaml             # OpenAPI schema
│       │   ├── orval.config.ts          # Code generation config
│       │   └── package.json
│       ├── api-zod/                     # Zod schema validation
│       └── db/                          # Drizzle ORM & migrations
│
├── sql/                                 # Database initialization & migrations
│   ├── init-fresh-db.sql                # Master schema (creates all 6 tables)
│   ├── load-test-data.sql               # Seed data for development/testing
│   ├── schema-sprint1.sql               # (Legacy schema, superseded by init-fresh-db.sql)
│   ├── scheme-sprint2.sql               # (Legacy schema)
│   ├── migration-add-manager-id.sql     # (Legacy migration)
│   └── migrations/
│       └── 004-volunteer-tasks.sql      # Sprint 3: Added volunteer_tasks table
│
├── pom.xml                              # Maven build configuration (Java backend, tests)
├── run.ps1                              # Launch JavaFX UI app (legacy)
├── run-api.ps1                          # Launch Java API server on port 7000
├── clean.ps1                            # Clean build artifacts (out/, target/)
├── db.env                               # LOCAL DATABASE CONFIG (gitignored - contains passwords)
├── db.env.example                       # TEMPLATE - copy to db.env and fill credentials
├── exclude.txt                          # Files to exclude from builds
├── README.md                            # This file
└── INTEGRATION.md                       # Integration testing notes
```

### Database Schema (6 Tables in MS SQL Server)

**Table: users**
```sql
user_id          INT IDENTITY(1,1) PRIMARY KEY
username         VARCHAR(50) UNIQUE NOT NULL      -- Min 3 chars, alphanumeric
password         VARCHAR(255) NOT NULL            -- Hashed, min 6 chars + uppercase + digit
full_name        VARCHAR(100) NOT NULL
email            VARCHAR(100) UNIQUE NOT NULL
role             VARCHAR(20) NOT NULL             -- ADMIN, DONOR, VOLUNTEER, CAMPAIGN_MANAGER
created_at       DATETIME DEFAULT GETDATE()
```

**Table: campaigns**
```sql
campaign_id      INT IDENTITY(1,1) PRIMARY KEY
name             VARCHAR(200) NOT NULL            -- Not null, not empty
description      TEXT NOT NULL
goal_amount      DECIMAL(12,2) NOT NULL           -- > 0
current_funds    DECIMAL(12,2) DEFAULT 0.0
deadline         DATE NOT NULL                     -- Not null (hard requirement)
status           VARCHAR(20) DEFAULT 'ACTIVE'     -- ACTIVE, COMPLETED, CANCELLED
created_by       INT NOT NULL (FK → users)        -- Admin who created
manager_id       INT NULL (FK → users)            -- Campaign manager (nullable)
created_at       DATETIME DEFAULT GETDATE()
```

**Table: donations**
```sql
donation_id      INT IDENTITY(1,1) PRIMARY KEY
campaign_id      INT NOT NULL (FK → campaigns)
donor_id         INT NOT NULL (FK → users)
amount           DECIMAL(12,2) NOT NULL           -- > 0, only if campaign.status = ACTIVE
transaction_date DATETIME DEFAULT GETDATE()
receipt_number   VARCHAR(50) UNIQUE NOT NULL      -- Immutable for audit trail
```

**Table: expenses**
```sql
expense_id       INT IDENTITY(1,1) PRIMARY KEY
campaign_id      INT NOT NULL (FK → campaigns)
created_by       INT NOT NULL (FK → users)        -- Manager who logged
category         VARCHAR(50) NOT NULL             -- Supplies, Logistics, etc.
description      TEXT NOT NULL
amount           DECIMAL(12,2) NOT NULL           -- > 0, must not exceed remaining balance
expense_date     DATE NOT NULL
```

**Table: volunteer_applications**
```sql
application_id   INT IDENTITY(1,1) PRIMARY KEY
campaign_id      INT NOT NULL (FK → campaigns)
volunteer_id     INT NOT NULL (FK → users)
skill            VARCHAR(100) NOT NULL            -- Skill name/category
bio              TEXT NOT NULL                     -- Statement of interest
status           VARCHAR(20) DEFAULT 'PENDING'    -- PENDING, APPROVED, REJECTED
rejection_reason VARCHAR(500) NULL                -- Required if status = REJECTED
reviewed_by      INT NULL (FK → users)            -- Admin/manager who reviewed
applied_at       DATETIME DEFAULT GETDATE()
reviewed_at      DATETIME NULL
UNIQUE(campaign_id, volunteer_id)                 -- Prevent duplicate applications
```

**Table: volunteer_tasks**
```sql
task_id          INT IDENTITY(1,1) PRIMARY KEY
campaign_id      INT NOT NULL (FK → campaigns)
volunteer_id     INT NOT NULL (FK → users)
title            VARCHAR(200) NOT NULL
description      TEXT NOT NULL
status           VARCHAR(50) DEFAULT 'Not Started'  -- Not Started, In Progress, Completed
assigned_date    DATETIME DEFAULT GETDATE()
start_date       DATETIME NULL
end_date         DATETIME NULL
serviceHours     DECIMAL(5,2) DEFAULT 0.0          -- >= 0 (non-negative)
```

## �️ Tech Stack - Detailed

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend Runtime** | Java | 17+ (LTS) | Compiled backend API |
| **Backend Build** | Maven | 3.9+ | Dependency management & compilation |
| **Backend Testing** | JUnit 5 | 5.10.0 | Unit test framework |
| **Backend Mocking** | Mockito | 5.5.0 | Mock service dependencies |
| **Database Driver** | mssql-jdbc | 12.x | JDBC driver for SQL Server |
| **Frontend Framework** | React | 18.x | UI library |
| **Frontend Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Frontend Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Frontend Build** | Vite | 5.x | Lightning-fast build tool |
| **Frontend Package Mgr** | pnpm | 8.x+ | Fast Node package manager |
| **Database** | Microsoft SQL Server | 2019+ (Express free) | RDBMS |
| **API Style** | REST JSON over HTTP | HTTP/1.1 | Stateless API design |

---

## 🚀 Complete Setup Guide

### Prerequisites & Installation

#### 1. **Install Java 17+ (Required for Backend)**

**Windows:**
- Download: https://adoptium.net/ (Eclipse Adoptium - free, open source)
- Or: https://www.oracle.com/java/technologies/downloads/ (Oracle JDK)
- Choose: Windows Installer, 64-bit
- Install with defaults
- Verify installation:
  ```powershell
  java -version
  # Expected: openjdk version "17.x.x" or "21.x.x"
  ```

**Set JAVA_HOME (if needed):**
```powershell
# PowerShell as Administrator
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.x", "User")
# Restart PowerShell after setting
```

#### 2. **Install Maven 3.9+ (Required for Compilation & Testing)**

**Windows:**
1. Download: https://maven.apache.org/download.cgi
   - Choose: "Binary zip archive" (e.g., apache-maven-3.9.15-bin.zip)
2. Extract to: `D:\apache-maven-3.9.15` (or any location without spaces)
3. Set environment variables (PowerShell as Administrator):
   ```powershell
   [Environment]::SetEnvironmentVariable("M2_HOME", "D:\apache-maven-3.9.15", "User")
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";D:\apache-maven-3.9.15\bin", "User")
   ```
4. Restart PowerShell completely (close all windows)
5. Verify:
   ```powershell
   mvn -version
   # Expected: Apache Maven 3.9.15, Java version: 17.x.x
   ```

**Troubleshooting Maven:**
- If `mvn` still not found after restart: Check that `D:\apache-maven-3.9.15\bin\mvn.cmd` exists
- Clear npm cache if needed: `mvn clean`

#### 3. **Install Microsoft SQL Server 2019 Express (Required for Database)**

**Windows:**
1. Download: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Choose: "SQL Server 2019 Express" (completely free)
   - Or: "SQL Server 2022 Express"
2. Run installer:
   - Installation Type: **Basic**
   - Instance name: **SQLEXPRESS** (default, or any custom name)
   - Accept default options
   - Accept SQL Server terms
   - Click "Install"
3. After installation, note:
   - Server name: `localhost\SQLEXPRESS` (or `localhost\<YOUR_INSTANCE_NAME>`)
   - Default authentication: **Windows Authentication** (your current user)
   - Optional: Install SQL Server Management Studio (SSMS) for GUI access

**Verify SQL Server is Running:**
```powershell
# Check service status
Get-Service MSSQL* | Select-Object Status, Name
# Expected: Status = Running, Name = MSSQLSERVER or MSSQL$SQLEXPRESS

# If not running, start it
Start-Service MSSQL$SQLEXPRESS  # If using named instance
# OR
Start-Service MSSQLSERVER       # If using default
```

**Create SQL Server Login (Recommended for Development):**
- Open SQL Server Management Studio (SSMS)
- Connect: Server = `localhost\SQLEXPRESS`, Auth = Windows
- Right-click "Logins" → New Login
- Create login: Username = `sa`, Password = `Beacon@2026` (or your preference)
- Set default database: beacon_db

#### 4. **Install Node.js 18+ & pnpm (Required for Frontend)**

**Windows:**
1. Download Node.js: https://nodejs.org/ (LTS version recommended)
2. Install with defaults (includes npm)
3. Install pnpm globally:
   ```powershell
   npm install -g pnpm
   pnpm -v  # Verify
   ```

### Local Configuration

#### Create `db.env` Configuration File

**File:** `beacon-ngo-system/db.env`

Create this file in the project root with your local database credentials:

```env
# Microsoft SQL Server Connection String
DB_HOST=localhost\SQLEXPRESS
DB_PORT=1433
DB_NAME=beacon_db
DB_USER=sa
DB_PASSWORD=Beacon@2026
DB_AUTHENTICATION=SqlServer

# Alternative: If using Windows Authentication
# DB_AUTHENTICATION=Windows
# DB_USER=<YOUR_WINDOWS_USERNAME>
# DB_PASSWORD=<NOT_NEEDED>
```

⚠️ **IMPORTANT:** `db.env` is in `.gitignore` — never commit to repository (contains passwords)

### Initialize Database Schema

**Method 1: Using SQL Server Management Studio (Recommended)**
```powershell
# 1. Open SQL Server Management Studio (SSMS)
# 2. Connect: Server = localhost\SQLEXPRESS, Auth = SQL Server, User = sa
# 3. File → Open → Query File
# 4. Open: beacon-ngo-system\sql\init-fresh-db.sql
# 5. Click "Execute" (F5)
# 6. Repeat for: load-test-data.sql
```

**Method 2: Using PowerShell (Alternative)**
```powershell
$sqlPath = "C:\path\to\beacon-ngo-system\sql"
$server = "localhost\SQLEXPRESS"
$user = "sa"
$password = "Beacon@2026"

# Run schema initialization
sqlcmd -S $server -U $user -P $password -i "$sqlPath\init-fresh-db.sql"
# Run test data
sqlcmd -S $server -U $user -P $password -i "$sqlPath\load-test-data.sql"
```

**Verify Database Created:**
```sql
-- In SSMS or sqlcmd
USE beacon_db;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
-- Expected: users, campaigns, donations, expenses, volunteer_applications, volunteer_tasks
```

---

## 🚀 Running the Application

### Option 1: Start API Server Only

**Terminal 1 - Start Java API Server (port 7000):**
```powershell
cd c:\path\to\beacon-ngo-system
.\run-api.ps1
# Expected output:
# [STEP] Launching Beacon API Server...
# [OK] Database config loaded from db.env
# [OK] Compilation successful (out/ directory created)
# [OK] Starting API server...
# [OK] Server listening on http://localhost:7000
```

**Verify API is Running:**
```powershell
# In another terminal, test health endpoint
Invoke-WebRequest -Uri "http://localhost:7000/health" -Method GET
# Expected: Status 200 OK with response body
```

### Option 2: Start Frontend (React SPA)

**Terminal 2 - Start React Frontend (port 5173):**
```powershell
cd c:\path\to\beacon-ngo-system\frontend\artifacts\beacon
pnpm install    # First time only - installs dependencies
pnpm dev        # Start Vite dev server
# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

### Option 3: Full System Startup

```powershell
# Terminal 1: Start API server
cd c:\path\to\beacon-ngo-system
.\run-api.ps1
# Wait for: "Server listening on http://localhost:7000"

# Terminal 2: Start React frontend
cd c:\path\to\beacon-ngo-system\frontend\artifacts\beacon
pnpm dev
# Wait for: "Local: http://localhost:5173/"

# Terminal 3: Open browser
start http://localhost:5173
```

---

## 👤 Default Test Credentials & Role-Based Access

### Test Users (Seeded via `load-test-data.sql`)

| Role | Username | Password | Permissions |
|------|----------|----------|------------|
| **Admin** | admin | admin123 | Create/edit all campaigns, approve volunteers, view all reports, manage users |
| **Campaign Manager** | manager | manager123 | Create own campaigns, assign tasks, view team metrics |
| **Volunteer** | volunteer | volunteer123 | Apply to campaigns, view assigned tasks, update status, log hours |
| **Donor** | donor | donor123 | Browse campaigns, make donations, view own donation history |

**Login Flow:**
1. Navigate to http://localhost:5173
2. Enter username and password from table
3. Click "Login"
4. Redirected to role-specific dashboard

### Role-Based Access Control (RBAC) Matrix

| Feature | Admin | Manager | Volunteer | Donor | Public |
|---------|:-----:|:-------:|:---------:|:-----:|:------:|
| **Campaigns** |  |  |  |  |  |
| Create Campaign | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Campaign | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| View All Campaigns | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search/Filter Campaigns | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Volunteers** |  |  |  |  |  |
| View Applications | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| Approve Applications | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| Reject Applications | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| Apply to Campaign | ❌ | ❌ | ✅ | ❌ | ❌ |
| View My Applications | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Tasks** |  |  |  |  |  |
| Assign Tasks | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| View All Tasks | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| View My Tasks | ❌ | ❌ | ✅ | ❌ | ❌ |
| Update Task Status | ❌ | ❌ | ✅ (own) | ❌ | ❌ |
| **Donations** |  |  |  |  |  |
| Make Donation | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Donation History | ✅ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| Download Receipt | ❌ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| **Finances** |  |  |  |  |  |
| Log Expenses | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| View Impact Report | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |
| View Analytics Dashboard | ✅ | ✅ (own campaigns) | ❌ | ❌ | ❌ |

---

## 📊 Testing & Quality Assurance

### JUnit Backend Tests

The project includes comprehensive backend unit tests covering all Sprint 3 user stories.

**Test Coverage:**
```
UserServiceTest                    ├─ Login validation
                                    ├─ Signup validation (password rules, username length)
                                    └─ Authentication flow

CampaignServiceTest                ├─ Campaign creation validation (name, goal, deadline)
                                    └─ Campaign status management

DonationServiceTest                ├─ Donation amount validation (null, zero, negative)
                                    ├─ Active campaign requirement
                                    └─ Transaction atomicity

ExpenseServiceTest                 ├─ Expense amount validation
                                    ├─ Balance checking
                                    └─ Remaining balance calculation

VolunteerApplicationServiceTest     ├─ Application field validation
                                    ├─ Rejection reason requirement
                                    └─ Duplicate application prevention

VolunteerTaskServiceTest           ├─ Status validation (3 valid statuses)
                                    ├─ Service hours non-negative check
                                    └─ Task status transitions

ImpactReportServiceTest            └─ Report data aggregation
```

**Running Tests:**
```powershell
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run with detailed output
mvn test -X

# Generate code coverage report (if configured)
mvn test jacoco:report
```

**Expected Output:**
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.beacon.service.UserServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.102 s
[INFO]
[INFO] Running com.beacon.service.CampaignServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.087 s
...
[INFO]
[INFO] BUILD SUCCESS
```

### Black-Box Test Cases

A comprehensive set of 22 black-box test cases has been generated using:
- **Equivalence Partitioning**: Grouping inputs into valid/invalid classes
- **Boundary Value Analysis**: Testing edge cases (0, null, max values)
- **Error Guessing**: Identifying likely failure modes

See attached testing documentation for complete test specifications.

### API Documentation

The backend REST API is documented via inline specifications in source code.

**Key Endpoints:**
```
GET  /health                              Health check
POST /auth/login                          User login
POST /auth/signup                         User signup
GET  /campaigns                           List all campaigns
GET  /campaigns/:id                       Get campaign details
POST /campaigns                           Create new campaign
GET  /donations/history/:donorId          Get donor's donation history
POST /donations                           Process donation
GET  /volunteers/applications             List all volunteer applications
PUT  /volunteers/applications/:id/approve Approve volunteer application
PUT  /volunteers/applications/:id/reject  Reject volunteer application
POST /volunteers/tasks                    Create task assignment
GET  /volunteers/tasks/:volunteerId       Get volunteer's tasks
PUT  /volunteers/tasks/:id/status         Update task status
GET  /reports/impact                      Get financial impact report
```

**Test API Locally:**
```powershell
# Using PowerShell
$headers = @{'Content-Type' = 'application/json'}
$body = @{username='volunteer'; password='volunteer123'} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:7000/auth/login" `
  -Method POST -Headers $headers -Body $body

$token = $response | ConvertFrom-Json | Select-Object -ExpandProperty token
```

---

## 🔧 Troubleshooting

### Issue: `mvn` command not found
**Solution:**
1. Download Maven from https://maven.apache.org/download.cgi
2. Extract to `D:\apache-maven-3.9.15`
3. Set environment variables (as described in Prerequisites)
4. Restart PowerShell completely
5. Verify with `mvn -version`

### Issue: Database connection refused
**Likely causes:**
- SQL Server not running
- Wrong hostname/port in db.env
- Wrong credentials

**Solution:**
```powershell
# Check SQL Server is running
Get-Service MSSQL* | Select-Object Status, Name
# Should show "Running" for MSSQLSERVER or SQLEXPRESS

# If not running, start it
Start-Service MSSQL$SQLEXPRESS  # If using named instance
Start-Service MSSQLSERVER       # If using default

# Verify connection with SSMS or sqlcmd
sqlcmd -S localhost\SQLEXPRESS -U sa -P <password> -Q "SELECT @@VERSION"
```

### Issue: `java: command not found`
**Solution:**
1. Install Java 17+ from https://adoptium.net or https://www.oracle.com/java/technologies/downloads/
2. Set `JAVA_HOME` environment variable:
   ```powershell
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
   ```
3. Restart PowerShell
4. Verify: `java -version`

### Issue: React app shows "Cannot connect to backend"
**Solution:**
1. Ensure API server is running: `http://localhost:7000/health` should return status
2. Check firewall isn't blocking port 7000
3. Verify db.env is configured correctly
4. Check API server logs for errors

### Issue: Tests fail with "Cannot connect to database"
**Solution:**
- Most tests mock the database, so this usually means:
  - db.env not configured (some tests may try real connection)
  - Solution: Either configure db.env or modify test to use mocks only

### Issue: `pnpm` command not found
**Solution:**
```powershell
# Install pnpm globally
npm install -g pnpm
# Verify
pnpm -v
```

---

## 📝 Development Workflow

### Adding a New Feature

1. **Create database migration** (if needed):
   ```sql
   -- sql/migrations/005-new-feature.sql
   CREATE TABLE new_table (
     id INT IDENTITY(1,1) PRIMARY KEY,
     ...
   );
   GO
   ```

2. **Add backend service**:
   ```java
   // src/main/java/com/beacon/service/NewFeatureService.java
   public class NewFeatureService {
     private final NewFeatureDAO dao = new NewFeatureDAO();
     
     public boolean doSomething(Object input) {
       // Validate input
       if (input == null) return false;
       
       // Call DAO
       return dao.persist(input);
     }
   }
   ```

3. **Add backend tests**:
   ```java
   // src/test/java/com/beacon/service/NewFeatureServiceTest.java
   class NewFeatureServiceTest {
     @Test
     void doSomething_withInvalidInput_returnsFalse() {
       NewFeatureService service = new NewFeatureService();
       boolean result = service.doSomething(null);
       assertFalse(result);
     }
   }
   ```

4. **Add REST endpoint** (in api-server or Java API)
5. **Add React component** and connect to API
6. **Run tests**: `mvn test`
7. **Manual testing**: Start both services and test in browser

---

## 🔒 Security Notes

- **db.env**: Contains database credentials—never commit to git
- **Passwords**: All user passwords should be hashed (bcrypt/Argon2) in production
- **API Authentication**: Use JWT tokens for stateless authentication
- **HTTPS**: Always use HTTPS in production, not HTTP
- **Input Validation**: All user inputs are validated at service layer
- **SQL Injection Prevention**: Use parameterized queries (PreparedStatement in Java)
- **CORS**: Configure CORS policies to restrict cross-origin requests

---

## 📄 License

This project is developed for academic purposes at FAST-NUCES.  
**Course:** Software Engineering (CS-308)  
**Semester:** Spring 2026

