# Beacon NGO System — Integration Guide

## What Has Been Done

### Backend (Java)
- `lib/` folder set up with JavaFX SDK 21.0.9 and MSSQL JDBC driver
- `run.ps1` fixed to launch via `com.beacon.Main`
- `ImpactReportDAO.java` SQL bug fixed (created_at added to GROUP BY)
- `src/main/java/com/beacon/api/BeaconApiServer.java` created — a lightweight 
  HTTP server that exposes all Java services as REST endpoints on port 7000
- `Main.java` updated to start the API server on a background thread before 
  launching the JavaFX window

### Frontend (React + TypeScript)
- Located in `frontend/artifacts/beacon/`
- Built with React, Vite, TailwindCSS, shadcn/ui
- All 7 pages implemented and connected to the Java API:
  - Campaign Dashboard
  - Create Campaign
  - Donations
  - Expense Log
  - Volunteer Apply
  - Admin Approvals
  - Impact Report
- `store.tsx` replaced — all data now comes from Java API via fetch()
- `vite.config.ts` configured with `/api` proxy pointing to localhost:7000

## How to Run

### Step 1 — Start the Java backend