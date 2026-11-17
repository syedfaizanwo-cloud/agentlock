# AgentLock: AI Agent Vulnerability Scanner and Automated Red Teaming Platform

AgentLock is an automated red teaming platform and vulnerability evaluation system designed for autonomous AI agents, tool-augmented LLM architectures, and multi-agent systems.

## Overview

AgentLock systematically evaluates AI agents against adversarial attack vectors before and during production deployment. It targets the four primary vulnerability categories in agentic architectures:
- Prompt Injection: Direct instruction overrides, indirect prompt injection via retrieved content, and delimiter evasion.
- Data Leakage: Extraction of system instructions, secret keys, sensitive database credentials, and protected user records.
- Tool Abuse: Unauthorized function calls, parameter manipulation, SSRF via agent tools, and privilege escalation.
- Memory Poisoning: Manipulation of agent short-term working context and contamination of long-term vector memory stores.

## Project Structure

```
agentlock/
├── src/
│   ├── app/                      # Next.js 14 App Router routes and metadata
│   │   ├── agents/               # /agents target agent inventory route
│   │   ├── scans/                # /scans scan runner and /scans/[id] result route
│   │   ├── reports/              # /reports audit reports route
│   │   ├── faq/                  # /faq methodology route
│   │   ├── login/                # /login authentication route
│   │   ├── not-found.tsx         # Custom 404 error page
│   │   ├── sitemap.ts            # Dynamic sitemap generator
│   │   ├── robots.ts             # Dynamic robots.txt generator
│   │   └── page.tsx              # Home landing page and overview
│   ├── components/
│   │   ├── actions/              # Scan history table
│   │   ├── agents/               # Agent registration and inventory
│   │   ├── analytics/            # Threat analytics and exposure heatmap
│   │   ├── dashboard/            # Metric cards and Recharts visualisations
│   │   ├── faq/                  # Technical FAQ accordion
│   │   ├── hero/                 # Scanner hero and pipeline overview
│   │   ├── layout/               # Site footer
│   │   ├── navigation/           # TopBar, breadcrumbs, and hamburger drawer
│   │   ├── reports/              # Audit reports and PDF export
│   │   ├── results/              # Categorized vulnerability findings
│   │   ├── scan/                 # Interactive scan configuration and execution
│   │   └── threats/              # Finding detail drawer and threat viewer
│   ├── lib/
│   │   ├── api-client.ts         # Native fetch client with in-memory caching
│   │   └── utils.ts              # Utility helpers
│   ├── mocks/
│   │   └── index.ts              # Isolated mock data for offline development
│   └── types/
│       └── api.ts                # TypeScript interfaces for API contracts
├── docs/
│   ├── auth-contract.md          # REST authentication specification and cookie contract
│   ├── backend-data-requests.md  # Requested backend telemetry schema additions
│   └── backend-index-recommendations.md  # Recommended SQL indexes
└── public/                       # Static assets, icons, and llms.txt
```

## Technology Stack

- Web app: Next.js 16 App Router and React 19
- Backend API: FastAPI with SQLAlchemy and SQLite
- Language: TypeScript 5 and Python 3.12+
- Styling: Tailwind CSS 3
- 3D Visuals: Three.js (WaveGridBackground persistent canvas)
- Charts: Recharts (dynamically imported with ssr: false)
- PDF Generation: jsPDF (client-side vector fallback)
- Icons: Lucide React
- HTTP Client: Native fetch wrapper with in-memory SWR cache and abort timeout

## Design System

The interface adheres to an intentional flat navy design system:
- Background: Deep Navy (#060D1F base background, #0A1633 surface cards)
- Typography: Display font Syne, Body font Plus Jakarta Sans, Monospace font JetBrains Mono
- Accent: Coral (#FF6F59) used strictly for primary focus and key interactive states
- Severity Palette: Critical (#E11D48), High (#F59E0B), Medium (#FACC15), Low (#34D399), Info (#94A3B8)
- Accessible contrast ratios meeting WCAG AA or AAA
- Full keyboard focus outlines and prefers-reduced-motion support

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm 9+
- Python 3.12+ for the FastAPI backend

### Installation

```bash
npm install
```

### Secure Environment Configuration

Copy both example files, then fill in real secrets before starting the app:

~~~powershell
Copy-Item .env.example .env.local
Copy-Item backend/.env.example backend/.env
py -c "import secrets; print(secrets.token_urlsafe(48))"
~~~

Generate separate random values for AGENTLOCK_API_KEY and AGENTLOCK_SESSION_SECRET. Put the same API key in the frontend .env.local and backend/.env. Set a unique administrator email and a password with at least 16 characters. Never commit real environment files or put secrets in NEXT_PUBLIC_* variables.

For local development, keep BACKEND_URL=http://127.0.0.1:8000 and set AGENTLOCK_FRONTEND_ORIGIN=http://localhost:5173. For production, use an HTTPS BACKEND_URL and the exact HTTPS site origin.

Start the backend in one PowerShell window:

~~~powershell
Set-Location backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
~~~

Then start the frontend from the project root using the Development Server steps below. The app uses one administrator login configured in environment variables. See [Security hardening and remaining risks](docs/SECURITY_HARDENING.md) before using real agent or customer data.

### Development Server

Run the development server on port 5173:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Create an optimized production build and start the server on port 5173:

```bash
npm run build
npm start
```

## Connecting a Custom Domain

To deploy AgentLock with your custom domain:

1. Set the canonical domain variable in your deployment environment:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
2. DNS Configuration:
   - For apex domain (e.g. `yourdomain.com`), configure an A record pointing to your host IP.
   - For subdomain (e.g. `app.yourdomain.com`), configure a CNAME record pointing to your deployment alias.
3. SSL and TLS:
   - Ensure automatic TLS/SSL certificates are enabled on your hosting provider.
   - All internal metadata, canonical tags, sitemaps, and Open Graph URLs automatically read `NEXT_PUBLIC_SITE_URL`.

## API Integration Contract

The frontend proxies requests to the backend service configured via `BACKEND_URL`:

- `GET /api/health`: Diagnostic health check and latency telemetry
- `POST /api/auth/login`: Issue session cookie upon credentials validation
- `POST /api/auth/logout`: Clear the browser session cookie
- `GET /api/auth/me`: Return authenticated user profile and permissions
- `GET /api/dashboard/stats`: Total scans, registered agents, confirmed vulnerabilities, and critical count
- `GET /api/agents`: Registered agent inventory
- `POST /api/agents`: Register a new agent target (name, target URL, description)
- `POST /api/scans`: Launch an adversarial security evaluation
- `GET /api/scans`: List all historical scans
- `GET /api/scans/{id}`: Poll status, progress, and test progress for a scan
- `GET /api/scans/{id}/results`: Retrieve confirmed findings, attack prompts, raw evidence, and remediation
- `GET /api/scans/{id}/report/pdf`: Download binary PDF audit dossier

## Repository Guidelines

- Security work is developed on `security/framework-security-hardening`
- Push feature branches before merging them into `main`
- Keep backend and frontend changes documented together when they share an API boundary
