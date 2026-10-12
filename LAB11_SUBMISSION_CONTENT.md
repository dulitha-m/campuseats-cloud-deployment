# SE3090 Software Engineering Frameworks
## Lab Practical 11: DevOps and Cloud Hosting Platforms
**Student Submission Report Content**

---

### Task 01: Repository Preparation, Production Build, and Secrets Management

#### Explanation:
In Task 01, the project repository was prepared for professional cloud deployment following DevOps best practices:
1. **Repository Structure:** The monorepo contains the React/Vite frontend (`campuseats-dashboard`) and the ASP.NET Core 8 Web API backend (`CampusEats.Api`).
2. **Git Ignore Configuration:** A comprehensive `.gitignore` file was configured at the root and frontend directories. It strictly excludes build outputs (`dist/`, `build/`, `bin/`, `obj/`), dependencies (`node_modules/`), development secrets (`.env`, `.env.*`), local database files, and local backup files (`appsettings.LocalBackup.json`).
3. **Secrets Segregation:** In accordance with the Twelve-Factor App methodology, all credentials and sensitive configuration values were removed from tracked files. The production configuration template (`appsettings.json`) maintains empty placeholder strings for `ConnectionStrings:Default` and `Jwt:Key`. In local development, .NET User Secrets (`UserSecretsId: c2fee876-ee2c-4a0d-a5bc-07847446e10b`) are used to securely inject connection strings and JWT signing keys without risking exposure in version control.
4. **Production Build Verification:** Both frontend and backend were compiled locally to confirm production readiness:
   - Frontend: `npm run build` executed successfully via Vite, generating optimized production bundles in `dist/`.
   - Backend: `dotnet build -c Release` executed successfully with 0 warnings and 0 errors, compiling `CampusEats.Api.dll` for `net8.0`.

*(Insert Screenshot: Git repository status showing clean branch, `.gitignore`, and successful local build outputs)*

---

### Task 02: Deploying Frontend to Vercel

#### Explanation:
In Task 02, the React frontend was configured and deployed to Vercel, a high-performance cloud platform designed for modern frontend applications:
1. **Platform Configuration:** In the Vercel project settings, the repository root was set to `campuseats-dashboard`, the framework preset was detected as `Vite`, the build command was set to `npm run build`, and the output directory was mapped to `dist`.
2. **Client-Side Routing Support:** A `vercel.json` configuration file was created containing URL rewrite rules (`"source": "/(.*)", "destination": "/index.html"`). This ensures that client-side routes handled by React Router (such as `/dish/:id` and `/order`) resolve properly when users refresh or bookmark pages, preventing HTTP 404 errors.
3. **Environment Variable Configuration:** The application was updated to read `import.meta.env.VITE_API_URL`. A centralized configuration helper (`src/config/api.js`) provides an automated fallback: if `VITE_API_URL` is configured in Vercel, the frontend connects directly to the cloud backend API; if left unset, it falls back seamlessly to the local `/menu.json` dataset.

- **Vercel Project URL:** `[INSERT_YOUR_VERCEL_FRONTEND_URL_HERE]`  
- **GitHub Repository:** `https://github.com/dulitha-m/campuseats-cloud-deployment`

*(Insert Screenshot: Vercel deployment dashboard showing "Ready" status, project settings, and the live web application loaded in browser)*

---

### Task 03: Preparing and Deploying ASP.NET Core Backend on Render

#### Explanation:
In Task 03, the ASP.NET Core Web API was containerized and configured for deployment on Render as a cloud Web Service:
1. **Multi-Stage Dockerfile:** A Dockerfile was engineered utilizing the official Microsoft .NET 8 SDK image (`mcr.microsoft.com/dotnet/sdk:8.0`) for dependency restore, compilation, and release publishing, followed by the lightweight ASP.NET runtime image (`mcr.microsoft.com/dotnet/aspnet:8.0`). This multi-stage approach produces a minimal container footprint and ensures reproducible builds.
2. **Dynamic Port Binding:** Cloud platforms like Render assign a dynamic port at runtime through the `PORT` environment variable. `Program.cs` was configured to detect the `PORT` variable and bind Kestrel to `http://0.0.0.0:{port}`, allowing Render's edge load balancer to route traffic into the container.
3. **CORS Configuration:** A dedicated CORS policy (`AllowFrontend`) was implemented. It allows local development origins (`http://localhost:5173`, `http://localhost:3000`), custom production URLs specified via the `FrontendUrl` environment variable, and any dynamic `*.vercel.app` domain.
4. **Health Check Probes:** Lightweight endpoints (`/` and `/health`) were registered to provide immediate HTTP 200 responses for Render's automated health check and uptime monitoring probes.

- **Render Web Service URL:** `[INSERT_YOUR_RENDER_BACKEND_URL_HERE]`

*(Insert Screenshot: Render Web Service settings, environment variables tab, build/deployment logs, and `/health` response in browser)*

---

### Task 04: Database Setup on Neon PostgreSQL and Migrations

#### Explanation:
In Task 04, a managed PostgreSQL database was provisioned on Neon to support persistent cloud data storage:
1. **Managed Serverless PostgreSQL:** Neon was selected as the database hosting provider, offering serverless PostgreSQL with automated scaling and branch management.
2. **Encrypted Communication (SSL/TLS):** Neon requires all connections to be encrypted using SSL/TLS. The connection string was configured with `SSL Mode=Require;Trust Server Certificate=true` to secure data in transit between Render and Neon.
3. **Cloud Environment Variable Mapping:** The database connection string is passed securely to the Render Web Service using the environment variable `ConnectionStrings__Default`. ASP.NET Core's configuration provider automatically maps double-underscore delimiters to nested configuration keys.
4. **Safe Migration Execution:** Entity Framework Core migrations (`InitialCreate`) create the `MenuItems` and `Users` tables. Migrations are executed using `dotnet ef database update` with the cloud connection string passed via temporary environment variables, ensuring production database credentials are never hardcoded or checked into Git.

*(Insert Screenshot: Neon project dashboard, connection settings with SSL requirement, and tables view showing `MenuItems` and `Users`)*

---

### Task 05: Deployment Verification, Testing, and Monitoring

#### Explanation:
In Task 05, the fully integrated cloud application was validated and monitored:
1. **End-to-End Functional Testing:** The frontend hosted on Vercel was tested in the browser. Menu items were fetched from the cloud backend hosted on Render, and orders were processed through the UI.
2. **Network Inspection:** Browser Developer Tools (Network tab) were used to verify that HTTP requests made from the Vercel domain to the Render backend succeeded with HTTP 200 status codes and appropriate CORS response headers (`Access-Control-Allow-Origin`).
3. **Log and Health Inspection:** Render runtime logs were inspected to verify container startup, port binding, and request handling. The `/health` endpoint confirmed continuous availability.
4. **Metrics Monitoring:** Platform monitoring dashboards on Vercel and Render were checked to evaluate memory consumption, CPU utilization, and response latency.

*(Insert Screenshot: Browser Network tab showing successful API calls between Vercel and Render, Render runtime logs, and platform metrics)*

---

### Task 06: Platform Justification and DevOps Reflection

#### Platform Justification Table:

| Component | Selected Platform | Primary Advantages | Key Limitations & Mitigations |
|---|---|---|---|
| **Frontend** | **Vercel** | - Native Git-integrated CI/CD pipeline<br>- Global Edge CDN delivery for low latency<br>- Instant preview deployments for pull requests<br>- Zero server configuration required | - Limited to static/SSR frontend applications.<br>*Mitigation:* Decouple backend logic into a specialized API service. |
| **Backend** | **Render** | - Direct Docker container support<br>- Automated build and deploy on Git push<br>- Native SSL certificate generation and management<br>- Clear environment variable injection | - Free tier instances experience cold starts after 15 minutes of inactivity.<br>*Mitigation:* Add lightweight `/health` probe and inform users of initial spin-up delay. |
| **Database** | **Neon PostgreSQL** | - Fully managed, serverless PostgreSQL<br>- Automated scaling and instant branching<br>- Strict SSL/TLS encryption by default<br>- Compatible with standard Npgsql/EF Core | - Connection limits on free tier compute.<br>*Mitigation:* Utilize connection pooling and efficient DbContext lifecycle management. |

#### DevOps Reflection (4–5 Sentences):
Implementing this cloud deployment pipeline highlighted the importance of decoupling application architecture into specialized tiers, where the frontend, backend, and database leverage platforms best suited to their operational models. Managing secrets through environment variables rather than configuration files enforced the Twelve-Factor App principles and eliminated security vulnerabilities across Git history. Automating builds through Docker multi-stage containers guaranteed that dependencies and runtimes remain identical between local development and cloud production. Finally, configuring CORS policies, dynamic port binding, and SPA rewrite rules demonstrated that successful DevOps workflows require proactive attention to network boundaries and hosting constraints.

---

### Quick Test Answers (Q1 – Q8)

**Q1: What is the purpose of the `.gitignore` file in a cloud deployment workflow, and why is it critical for sensitive configuration files like `appsettings.Production.json` or `.env`?**  
**Answer:** The `.gitignore` file instructs Git to untrack and ignore specific files and directories, preventing them from being committed to the source control repository. In a cloud deployment workflow, it is critical because files like `.env`, `secrets.json`, and `appsettings.Production.json` contain sensitive credentials, database passwords, and API keys. Committing these files exposes them to unauthorized repository viewers or public breaches. Instead, sensitive configurations must be kept local and supplied to cloud hosting platforms dynamically via host environment variables.

**Q2: What is the purpose of the build step (`npm run build` / `dotnet publish`) before deploying to production?**  
**Answer:** The production build step compiles, tree-shakes, bundles, and minifies source code into optimized, standalone artifacts ready for execution. For the frontend (`npm run build`), it transforms JSX, bundles modules, removes development overhead, and optimizes asset sizes for fast delivery over CDNs. For the backend (`dotnet publish`), it compiles C# into intermediate language, resolves dependencies, applies compiler optimizations, and packages only the required runtime binaries into a deployable folder or container layer.

**Q3: How does Vercel determine routing for Single Page Applications (SPAs) built with Vite/React, and why is a rewrite rule needed for client-side routing?**  
**Answer:** In a Single Page Application, page routing is handled dynamically in the user's browser by a client-side router (e.g., React Router) rather than by the web server. When a user navigates directly to a path like `/order` or refreshes the page, Vercel looks for a physical file named `order` or `order.html`. Because that file does not exist on disk, Vercel returns an HTTP 404 error. A rewrite rule in `vercel.json` (`"source": "/(.*)", "destination": "/index.html"`) routes all incoming requests back to `index.html`, allowing the client-side router to parse the URL and render the correct view.

**Q4: What is the difference between client-side environment variables (e.g., `VITE_API_URL`) and server-side environment variables? When are client-side variables injected?**  
**Answer:** Client-side environment variables (prefixed with `VITE_` in Vite) are statically baked into the JavaScript bundle during the build phase (`npm run build`) and are visible to anyone inspecting the browser source code. Therefore, they must never contain sensitive secrets. Server-side environment variables (e.g., on Render) exist only inside the server runtime environment, are read dynamically at application runtime, and are never exposed to the client.

**Q5: Why does Render use a dynamic port environment variable (`PORT`), and how does the containerized application bind to it?**  
**Answer:** Render uses a dynamic `PORT` environment variable because its shared hosting infrastructure and container orchestrator allocate internal port numbers dynamically to host processes behind a reverse proxy. To bind to this port, the ASP.NET Core application reads the `PORT` environment variable on startup using `Environment.GetEnvironmentVariable("PORT")` and instructs Kestrel to listen on `http://0.0.0.0:{port}`, allowing incoming web traffic to be forwarded into the container.

**Q6: What is Cross-Origin Resource Sharing (CORS), and why must the ASP.NET Core backend explicitly configure CORS policies for the Vercel frontend URL?**  
**Answer:** CORS is a browser security mechanism that restricts web applications running at one origin (domain, protocol, or port) from making HTTP requests to a different origin. Because the React frontend runs on Vercel (e.g., `https://campuseats-dashboard.vercel.app`) and the backend runs on Render (e.g., `https://campuseats-api.onrender.com`), the browser treats API requests as cross-origin. The ASP.NET Core backend must explicitly configure a CORS policy with `AllowCredentials()`, `WithOrigins()`, and allow headers/methods so the browser allows the frontend to access API responses.

**Q7: Why does a cloud PostgreSQL database like Neon require SSL/TLS (`sslmode=require`), and what are the risks of disabling SSL in production?**  
**Answer:** Cloud databases are hosted on public cloud infrastructure and accessed across the open internet. Neon mandates `sslmode=require` so that all communications between the backend application and database server are encrypted using TLS/SSL. Disabling SSL in production would transmit plaintext SQL queries, customer information, and database credentials over public networks, exposing them to eavesdropping, packet sniffing, and Man-in-the-Middle (MitM) attacks.

**Q8: How do database migrations differ when deployed in a cloud CI/CD pipeline versus running locally in development?**  
**Answer:** In local development, migrations are frequently executed interactively via CLI tools (`dotnet ef database update`) against local test databases that can be reset easily. In a cloud production CI/CD pipeline, migrations must be executed carefully to prevent data loss or downtime: they are typically applied using idempotent SQL migration scripts (`dotnet ef migrations script --idempotent`) reviewed by administrators, run during automated deployment release stages, or executed with backward-compatible schema changes to avoid breaking currently running application instances.
