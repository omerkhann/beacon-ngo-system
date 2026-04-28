# Beacon — NGO & Volunteering Management System

A full-stack web application for centralizing and streamlining the core operations of non-governmental organizations. Beacon provides a unified platform for campaigns, donations, volunteer management, expense tracking, and financial reporting.

## 📋 Project Vision

NGOs often struggle with fragmented systems: spreadsheets, paper forms, and scattered communication channels. Beacon solves this by providing a single, transparent platform where admins, donors, volunteers, and campaign managers collaborate effectively—reducing chaos and improving accountability.

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| M. Omer Khan | Team Lead & Product Owner | [@omerkhann](https://github.com/omerkhann) |
| Ibrahim Azad | Architect & Lead Developer | [@ibrahim-azad](https://github.com/ibrahim-azad) |
| M. Basit Rauf | Scrum Master & UI Designer | [@i200461](https://github.com/i200461) |

**Team Name:** Team SOLBIX

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Microsoft SQL Server with Drizzle ORM |
| **Build** | pnpm (monorepo workspace) |
| **API** | RESTful with OpenAPI/Zod schema generation |

## 🎯 Key Features

### Sprint 1: Campaign & Donation Core
- **Campaign Creation** — Admins create and publish fundraising campaigns
- **Campaign Dashboard** — Public users view active campaigns with progress bars
- **Donation Processing** — Donors contribute funds with secure payment flow
- **Donation History** — Donors track past contributions and receipts
- **Expense Logging** — Managers record campaign expenses for transparency

### Sprint 2: Volunteer & Administrative Management
- **Volunteer Application** — Volunteers apply to campaigns with skill selection
- **Admin Approval Workflow** — Admins review and approve/reject applications
- **Detailed Expense Management** — Categorized expense tracking and auditing
- **Impact Reporting** — Visual dashboards showing campaign financials vs. expenses
- **Task Assignment** — Volunteers view assigned tasks and fulfillment schedules

### Sprint 3: Advanced Features & Analytics
- **Multi-Role Authentication** — Secure login with role-based access (Admin, Manager, Volunteer, Donor)
- **Campaign Search & Discovery** — Real-time filtering and search for campaigns
- **Volunteer Task Tracking** — Volunteers update task status and log service hours
- **Campaign Manager Dashboard** — Manage volunteers, assign tasks, view campaign metrics
- **Financial Analytics** — Charts visualizing funds, expenses, and net impact
- **Role-Based Dashboards** — Customized views for each user role

## 📂 Project Structure

```
beacon-ngo-system/
├── frontend/
│   ├── artifacts/
│   │   ├── api-server/          # Node.js/Express backend
│   │   └── beacon/              # React SPA frontend
│   └── lib/
│       ├── api-client-react/    # Generated React API hooks
│       ├── api-spec/            # OpenAPI schema
│       ├── api-zod/             # Zod schema validation
│       └── db/                  # Drizzle ORM & migrations
├── sql/                         # Database initialization scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL 14+
- `.env` file configured (see `db.env` template)

### Run Everything

```powershell
# Start all services (frontend, backend, database)
.\run-all.ps1

# Stop all services
.\stop-all.ps1
```

### Run Individual Services

```powershell
# Backend API server (runs on http://localhost:3000)
cd frontend/artifacts/api-server
pnpm install
pnpm dev

# Frontend (runs on http://localhost:5173)
cd frontend/artifacts/beacon
pnpm install
pnpm dev
```

### Database Setup

```powershell
# Initialize fresh database
pnpm run db:init

# Run migrations
pnpm run db:migrate
```

## 👤 Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@beacon.ngo | admin123 |
| Campaign Manager | manager@beacon.ngo | manager123 |
| Donor | donor@beacon.ngo | donor123 |
| Volunteer | volunteer@beacon.ngo | volunteer123 |

## 📊 API Documentation

API spec is auto-generated from OpenAPI schema at `frontend/lib/api-spec/openapi.yaml`. 

Access the interactive API docs:
- Swagger UI: `http://localhost:3000/docs` (when backend is running)
- Raw OpenAPI: `http://localhost:3000/openapi.json`

## 📄 License

This project is developed for academic purposes at FAST-NUCES.
