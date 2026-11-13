# AgentLock - AI Agent Vulnerability Scanner and Automated Red Teaming Platform

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
│   ├── app/                      # Next.js 14 App Router (single-scroll layout)
│   ├── components/
│   │   ├── actions/              # Flat scan history table
│   │   ├── agents/               # Agent registration and inventory
│   │   ├── analytics/            # Threat analytics and exposure heatmap
│   │   ├── dashboard/            # KPI cards and Recharts visualisations
│   │   ├── faq/                  # Technical FAQ accordion
│   │   ├── layout/               # Viewport wrapper and footer
│   │   ├── navigation/           # TopBar and HamburgerDrawer
│   │   ├── relay/                # Hero component and telemetry indicators
│   │   ├── reports/              # Audit reports and PDF export
│   │   ├── results/              # Categorized vulnerability findings
│   │   ├── scan/                 # Interactive scan configuration and execution
│   │   └── ui/                   # WaveGridBackground, TextRoll, MockBadge
│   ├── lib/
│   │   ├── api-client.ts         # Centralized Axios API client with error handling
│   │   └── utils.ts              # Class name merger helper
│   ├── mocks/
│   │   └── index.ts              # Isolated mock data for offline development
│   └── types/
│       └── api.ts                # TypeScript interfaces for API contracts
├── backend/                      # FastAPI REST service (Dayanand R)
├── attack-engine/                # Adversarial testing engine (Syed Faizan)
└── public/                       # Static assets, sitemap, manifest, and robots.txt
```

## Team

- Syed Faizan: Attack Engine and Adversarial Test Vectors
- Vikas C: Frontend Architecture, Design System, and UI/UX
- Dayanand R: FastAPI Backend and API Services
- Mansi: Security Research and Vulnerability Classification

## Technology Stack

- Framework: Next.js 14 (App Router)
- UI Library: React 18
- Language: TypeScript 5
- Styling: Tailwind CSS 3
- Charts: Recharts
- 3D Visuals: Three.js (WaveGridBackground)
- Animations: motion (motion/react)
- Icons: Lucide React
- HTTP Client: Axios

## Design System

The interface adheres to a dark neumorphic design system:
- Background: Deep Navy (#0A1633 surface, #060D1F recessed wells, #12234A light shadows)
- Typography: Cream (#F5EDDC primary text, #C8C0AC secondary text)
- Accent: Coral (#FF6F59 active states, key actions, and wave peaks)
- Severity Palette: Critical (#E11D48), High (#F59E0B), Medium (#FACC15), Low (#34D399), Info (#94A3B8)
- Accessible contrast ratios meeting WCAG AAA for primary text (>13.8:1) and WCAG AA for accents (>5.2:1)
- Accessible controls honoring prefers-reduced-motion for all canvas and motion components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
# Backend REST API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Set to "true" only for isolated offline development
NEXT_PUBLIC_USE_MOCKS=false
```

When `NEXT_PUBLIC_USE_MOCKS=true`, the application renders mock data and displays a persistent visual badge in the interface to indicate mock mode is active. In production and regular development, all telemetry and results originate from the live FastAPI backend.

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## API Integration Contract

The frontend proxies `/api/*` requests to the FastAPI backend service configured via `NEXT_PUBLIC_API_URL`:

- `GET /health` - Diagnostic health check and latency telemetry
- `GET /api/dashboard/stats` - Total scans, registered agents, confirmed vulnerabilities, and critical count
- `GET /api/agents` - Registered agent inventory
- `POST /api/agents` - Register a new agent target (name, target URL, description, optional auth token)
- `POST /api/scans` - Launch an adversarial security evaluation
- `GET /api/scans` - List all historical scans
- `GET /api/scans/{id}` - Poll status, progress, and test progress for a scan
- `GET /api/scans/{id}/results` - Retrieve confirmed findings, attack prompts, raw evidence, and remediation
- `GET /api/scans/{id}/report/pdf` - Download binary PDF audit dossier

## Repository Guidelines

- Active work branch: `frontend`
- Never push directly to `main`
- Backend and attack-engine directories remain isolated from frontend commits
