# SE3090 Software Engineering Frameworks - Lab Practical 11 Implementation Report
**Topic:** DevOps and Cloud Hosting Platforms  
**Date:** October 12, 2026  
**Repository:** `dulitha-m/campuseats-cloud-deployment`  
**Branch:** `main`

---

## 1. Files Inspected

| File / Path | Purpose & Context | Inspection Status |
|---|---|---|
| `.gitignore` (Root) | Repository-wide ignore rules for secrets, builds, OS artifacts | Verified comprehensive ignore list |
| `.gitattributes` | Line ending and text normalization settings | Verified tracked on `origin/main` |
| `CampusEats.Api/appsettings.json` | ASP.NET Core production configuration template | Verified sensitive values (`ConnectionStrings:Default`, `Jwt:Key`) are empty |
| `CampusEats.Api/appsettings.Development.json` | Development logging configuration | Verified contains only logging config |
| `CampusEats.Api/appsettings.LocalBackup.json` | Local developer backup configuration | Verified ignored by `.gitignore` |
| `CampusEats.Api/CampusEats.Api.csproj` | .NET 8 target framework, packages, and UserSecretsId | Verified `UserSecretsId` present, packages current |
| `CampusEats.Api/Program.cs` | Application entry point, DI, routing, auth | Inspected for hardcoded URLs, port binding, CORS |
| `CampusEats.Api/Controllers/AuthController.cs` | JWT issuance & registration logic | Verified reads JWT key from configuration |
| `CampusEats.Api/Controllers/MenuController.cs` | CRUD endpoints for menu items | Verified `GET /api/menu` is public; admin routes secured |
| `CampusEats.Api/Data/AppDbContext.cs` | EF Core context | Verified mappings for `MenuItems` and `Users` |
| `CampusEats.Api/Migrations/20260810080454_InitialCreate.cs` | Database migration schema | Verified initial migration is defined |
| `campuseats-dashboard/package.json` | Frontend dependencies (React 19, Vite, React Router 7) | Verified build script (`vite build`) |
| `campuseats-dashboard/vite.config.js` | Vite bundler configuration | Verified React plugin configuration |
| `campuseats-dashboard/src/App.jsx` | React SPA client routes | Inspected client-side paths (`/`, `/dish/:id`, `/order`) |
| `campuseats-dashboard/src/features/menu/pages/MenuPage.jsx` | Menu display and live search | Inspected data fetching source |
| `campuseats-dashboard/src/features/menu/pages/DishDetailPage.jsx` | Individual dish details page | Inspected data fetching source |
| `campuseats-dashboard/public/menu.json` | Static mock fallback data | Verified schema matches `MenuItemDto` |

---

## 2. Files Changed and Rationale

| File Modified / Created | Action | Technical Rationale |
|---|---|---|
| `campuseats-dashboard/src/config/api.js` | **Created** | Centralized API endpoint resolver that reads `import.meta.env.VITE_API_URL`. Seamlessly falls back to `/menu.json` when `VITE_API_URL` is omitted, preserving local offline operation. |
| `campuseats-dashboard/src/features/menu/pages/MenuPage.jsx` | **Updated** | Swapped hardcoded `"/menu.json"` with `MENU_ENDPOINT` from configuration to enable cloud backend connection while preserving offline fallback. |
| `campuseats-dashboard/src/features/menu/pages/DishDetailPage.jsx` | **Updated** | Swapped hardcoded `"/menu.json"` with `MENU_ENDPOINT` from configuration; added robust array/object resolution for fetched data. |
| `campuseats-dashboard/.env.example` | **Created** | Provided clear template for environment variables (`VITE_API_URL`) without storing active credentials. |
| `campuseats-dashboard/vercel.json` | **Created** | Added client-side rewrite rule (`/(.*) -> /index.html`) so React Router SPA URLs (`/order`, `/dish/1`) do not return 404 on page refresh on Vercel. |
| `campuseats-dashboard/.gitignore` | **Updated** | Added explicit exclusions for `.env` and `.env.*` (excluding `!.env.example`) to ensure local frontend environment files are never committed. |
| `CampusEats.Api/Program.cs` | **Updated** | 1. Added dynamic port binding via `Environment.GetEnvironmentVariable("PORT")` for Render compatibility.<br>2. Added CORS policy (`AllowFrontend`) allowing local ports, configured frontend URL (`FrontendUrl`), and any `*.vercel.app` origin.<br>3. Added defensive fallback for startup without crashing if secrets are unpopulated.<br>4. Added `/` and `/health` endpoints for cloud health checks.<br>5. Safeguarded startup database seeding in a `try/catch` with `CanConnect()` check to prevent container boot failures. |
| `Dockerfile` (Root) | **Created** | Multi-stage Dockerfile targeting .NET 8 SDK and ASP.NET Core runtime, optimized for Render builds initiated from the repository root. |
| `CampusEats.Api/Dockerfile` | **Created** | Multi-stage Dockerfile optimized for Render builds where the Root Directory is set to `CampusEats.Api`. |
| `.dockerignore` (Root & Api) | **Created** | Excluded `node_modules`, `bin`, `obj`, `.git`, `.env`, and documentation to ensure lean and fast container builds. |

---

## 3. Security Verification Findings

- **Zero Committed Secrets:** A thorough audit of Git commit history confirmed that the single existing commit (`Initial commit`) contains only `.gitattributes`. No secret, password, or connection string has ever entered Git history.
- **Empty Template Files:** `CampusEats.Api/appsettings.json` has `ConnectionStrings:Default` set to `""` and `Jwt:Key` set to `""`.
- **Local Secret Isolation:** Local development utilizes .NET User Secrets (`UserSecretsId: c2fee876-ee2c-4a0d-a5bc-07847446e10b`), stored in the developer's user profile folder outside the repository.
- **Ignored Backup Configurations:** `CampusEats.Api/appsettings.LocalBackup.json` was verified against `git check-ignore` and is strictly ignored.
- **Ignored Build & Node Artifacts:** `dist/`, `node_modules/`, `bin/`, `obj/`, and `.env*` files are excluded by `.gitignore` across both root and subprojects.
- **No Hardcoded Production URLs:** No hardcoded localhost addresses or live database strings exist in client-side or server-side production code paths.

---

## 4. Frontend Build Results

- **Command Executed:** `npm run build` in `campuseats-dashboard`
- **Bundler:** Vite v8.1.5 (React 19, React Router 7)
- **Result:** **PASS (Success)**
- **Output Artifacts:**
  - `dist/index.html` (0.47 kB)
  - `dist/assets/index-CuAf7zjh.css` (4.92 kB)
  - `dist/assets/index-BouBnnM1.js` (238.41 kB)
  - Build execution time: ~181ms

---

## 5. Backend Build & Container Results

- **Release Compilation:**
  - **Command Executed:** `dotnet build -c Release .\CampusEats.Api\CampusEats.Api.csproj`
  - **Result:** **PASS (Success)**
  - **Diagnostics:** 0 Warning(s), 0 Error(s)
  - Target output: `CampusEats.Api.dll` targeting `net8.0`
- **Docker Image Build Verification:**
  - **Command Executed:** `docker build -t campuseats-api:test -f Dockerfile .`
  - **Result:** **PASS (Success)**
  - **Diagnostics:** Multi-stage image built successfully. SDK restore, build, and publish stages completed without errors. Runtime layer configured with `ASPNETCORE_HTTP_PORTS=8080`.

---

## 6. Git Readiness

- **Current Branch:** `main`
- **Remote:** `origin` (`https://github.com/dulitha-m/campuseats-cloud-deployment.git`)
- **Untracked Staging Candidates:**
  - Core configuration: `.gitignore`, `.dockerignore`, `Dockerfile`
  - Backend project: `CampusEats.Api/` (all source files, migrations, appsettings template, Dockerfile)
  - Frontend project: `campuseats-dashboard/` (source files, `vercel.json`, `.env.example`, `.gitignore`)
- **Safety Status:** Completely safe to stage and commit. All sensitive files are strictly excluded by `.gitignore`.

---

## 7. Vercel Deployment Settings (Frontend)

To deploy the React dashboard on Vercel:

| Parameter | Recommended Value |
|---|---|
| **Git Repository** | `dulitha-m/campuseats-cloud-deployment` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `campuseats-dashboard` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Environment Variables** | `VITE_API_URL` = `<Your-Render-Backend-URL>` *(e.g., `https://campuseats-api.onrender.com`)* |

> **Note on Routing:** The added `campuseats-dashboard/vercel.json` automatically guarantees that direct visits to `/order` and `/dish/:id` will resolve correctly without 404 errors.

---

## 8. Render Deployment Settings (Backend)

To deploy the ASP.NET Core Web API on Render:

| Parameter | Recommended Value |
|---|---|
| **Service Type** | **Web Service** |
| **Git Repository** | `dulitha-m/campuseats-cloud-deployment` |
| **Language / Runtime** | `Docker` |
| **Root Directory** | `.` *(Repo Root)* |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | Free |
| **Health Check Path** | `/health` |

### Required Environment Variables on Render:

| Variable Name | Value Description |
|---|---|
| `ConnectionStrings__Default` | Neon PostgreSQL connection string (see Section 9) |
| `Jwt__Key` | Secure secret key (minimum 32 characters, e.g., `CampusEatsSuperSecretKey2026!Deployment`) |
| `Jwt__Issuer` | `CampusEats` |
| `Jwt__Audience` | `CampusEatsUsers` |
| `FrontendUrl` | Vercel production frontend URL *(e.g., `https://campuseats-dashboard.vercel.app`)* |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

---

## 9. Neon Database Configuration Procedure

### Step 1: Create Managed PostgreSQL Instance on Neon
1. Log in to [Neon Console](https://console.neon.tech/).
2. Create a new project:
   - **Project Name:** `campuseats-db`
   - **Postgres Version:** 16 (or latest default)
   - **Region:** Select region closest to Render (e.g., `US East - Ohio` or `Frankfurt`).
3. Neon will display your database connection details.

### Step 2: Connection String Format for ASP.NET Core & Npgsql
From the Neon dashboard, select the **Connection Details** tab and copy the connection string.
Format as standard ADO.NET / Npgsql connection string:
```text
Host=<your-endpoint>.aws.neon.tech;Database=neondb;Username=<your-username>;Password=<your-password>;SSL Mode=Require;Trust Server Certificate=true
```
*(Or use the URI format: `postgresql://<user>:<password>@<endpoint>.aws.neon.tech/neondb?sslmode=require`)*

> [!IMPORTANT]
> **SSL Requirement:** Neon enforces encrypted connections over TLS/SSL. `SSL Mode=Require` is mandatory.

### Step 3: Executing Cloud Migrations Safely
To apply migrations to your Neon database without committing credentials:
Run from your local terminal with the environment variable set temporarily in PowerShell:
```powershell
$env:ConnectionStrings__Default="Host=<endpoint>.aws.neon.tech;Database=neondb;Username=<user>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true"
dotnet ef database update --project .\CampusEats.Api
Remove-Item Env:\ConnectionStrings__Default
```
Alternatively, generate an idempotent SQL script to run directly in the Neon SQL Editor:
```powershell
dotnet ef migrations script --idempotent --project .\CampusEats.Api -o migration.sql
```
*(Then execute `migration.sql` in the Neon SQL Editor console).*

---

## 10. Required Manual Actions Checklist

1. **Review and Approve Git Commit:**
   - Execute:
     ```powershell
     git add .
     git commit -m "feat(deployment): configure cloud deployment for Vercel, Render, and Neon"
     git push origin main
     ```
2. **Deploy Frontend on Vercel:**
   - Connect repository on Vercel dashboard.
   - Set Root Directory: `campuseats-dashboard`.
   - Deploy and obtain the live frontend URL (`https://<project-name>.vercel.app`).
3. **Provision Neon Database:**
   - Create project in Neon and obtain connection string.
   - Run EF Core migration script or update database.
4. **Deploy Backend on Render:**
   - Create new Web Service on Render from the GitHub repo.
   - Set environment variables (`ConnectionStrings__Default`, `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, `FrontendUrl`).
   - Trigger deployment and confirm `/health` returns 200 OK.
5. **Connect Frontend to Live Backend:**
   - Update `VITE_API_URL` in Vercel environment variables with your Render backend URL.
   - Trigger Vercel redeployment.

---

## 11. Screenshot Checklist for Lab Submission

| Task | Required Screenshot Evidence | Where to Capture |
|---|---|---|
| **Task 01** | Git repository on GitHub showing `main` branch, `.gitignore`, and no secrets | GitHub web interface |
| **Task 01** | Successful local build outputs (`npm run build` and `dotnet build -c Release`) | Terminal |
| **Task 02** | Vercel Project Settings (Root Directory: `campuseats-dashboard`, Vite preset) | Vercel Project Settings |
| **Task 02** | Vercel Deployment Overview showing "Ready" status and production domain | Vercel Deployments tab |
| **Task 02** | Deployed frontend running in browser (Menu page & Order page) | Web browser |
| **Task 03** | Render Web Service configuration (Docker runtime, environment variables) | Render Dashboard |
| **Task 03** | Render deployment build & deploy logs showing successful startup | Render Logs tab |
| **Task 03** | Render live API health check (`/health` or `/api/menu`) returning JSON in browser | Web browser |
| **Task 04** | Neon Project Dashboard showing active database and tables (`MenuItems`, `Users`) | Neon Console / Tables tab |
| **Task 04** | EF Core migration execution log or Neon SQL editor showing applied migration | Terminal / Neon SQL Editor |
| **Task 05** | Live frontend communicating with live backend (Menu items loaded from API) | Browser Developer Tools (Network tab) |
| **Task 05** | Cloud platform metrics/monitoring dashboards (Vercel Analytics & Render Metrics) | Vercel / Render dashboards |

---

## 12. Task 01-06 Completion Status

| Lab Practical Task | Description | Preparation Status | Execution Status |
|---|---|---|---|
| **Task 01** | Git repo, production build, `.gitignore`, secret security | **PASS** | Completed & verified locally |
| **Task 02** | Frontend configuration for Vercel (Vite, SPA routing, API fallback) | **PASS** | Ready for dashboard deployment |
| **Task 03** | ASP.NET Core backend Docker container, dynamic port, CORS for Render | **PASS** | Ready for dashboard deployment |
| **Task 04** | Neon PostgreSQL database setup, EF Core migrations, SSL config | **PASS** | Schema prepared, migration script ready |
| **Task 05** | End-to-end integration testing and platform log inspection | **READY** | Manual verification once URLs exist |
| **Task 06** | Platform justification table and DevOps reflection | **PASS** | Documented in submission report |

---

## 13. Remaining Blockers or Risks

- **No Local Blockers:** All local build, security, Dockerfile, and configuration steps are verified.
- **External Dependency:** Cloud deployments on Vercel, Render, and Neon require active user accounts and manual dashboard creation.
- **Cold Starts:** Render free tier services spin down after 15 minutes of inactivity; initial API requests may experience a 30-50 second delay before responding.
