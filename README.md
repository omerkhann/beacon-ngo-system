#Beacon — NGO & Volunteering Management System

A Java-based desktop application for centralizing and streamlining the core operations of non-governmental organizations.

## Project Vision

Beacon addresses a common problem faced by NGOs: reliance on spreadsheets, paper forms, and informal communication for managing campaigns, donations, volunteers, and expenses. Our vision is to provide NGOs with a single, transparent platform where admins, donors, volunteers, and campaign managers can collaborate effectively — reducing disorganization and improving accountability.

## Team

| Name | Role | GitHub |
|------|------|--------|
| M. Omer Khan | Team Lead & Product Owner | [@omerkhann](https://github.com/omerkhann) |
| Ibrahim Azad | Architect & Lead Developer | [@ibrahim-azad](https://github.com/ibrahim-azad) |
| M. Basit Rauf | Scrum Master & UI Designer | [@i200461](https://github.com/i200461) |

**Team Name:** Team SOLBIX

## Features (Sprint 1 — Campaign & Donation Core)

- **US1:** Create a new fundraising campaign (Admin)
- **US2:** View active and past campaigns dashboard (Admin)
- **US3:** Browse campaigns and contribute funds (Donor)
- **US4:** View donation receipt and history (Donor)

## Tech Stack

- **Language:** Java 17+
- **UI:** JavaFX / Swing
- **Database:** Microsoft SQL Server
- **Connectivity:** JDBC
- **Build:** Manual compilation (javac)

## Project Structure

```
beacon-ngo-system/
├── src/main/java/com/beacon/
│   ├── model/          # Data classes (Campaign, Donation, User)
│   ├── dao/            # Database access layer (JDBC queries)
│   ├── service/        # Business logic layer
│   ├── ui/             # JavaFX/Swing UI forms
│   └── util/           # Utility classes (DB connection)
├── sql/                # Database schema scripts
└── README.md
```

## Database Setup

1. Install SQL Server and create a database named `beacon_db`.
2. Run the schema script: `sql/schema.sql`.
3. Add SQL Server JDBC driver JAR (for example `mssql-jdbc-12.8.1.jre11.jar`) to a local `lib/` folder.
4. Configure connection values using environment variables:

```powershell
$env:BEACON_DB_URL = "jdbc:sqlserver://localhost:1433;databaseName=beacon_db;encrypt=true;trustServerCertificate=true"
$env:BEACON_DB_USER = "sa"
$env:BEACON_DB_PASSWORD = "yourStrongPassword"
```

## How to Run

```powershell
if (Test-Path out) { Remove-Item -Recurse -Force out }
New-Item -ItemType Directory -Path out | Out-Null
$files = Get-ChildItem -Path src/main/java -Recurse -Filter *.java | ForEach-Object { $_.FullName }
javac -cp "lib/*" -d out $files
java -cp "out;lib/*" com.beacon.Main
```

## License

This project is developed for academic purposes at FAST-NUCES.
