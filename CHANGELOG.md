# CHANGELOG

All notable changes to the AgentLock project will be documented in this file.

## [Unreleased] - 2026-11-13

### FastAPI Backend Integration, Eight-Attack Security Engine, and Camera-Zoom Intro
- `src/types/api.ts`: Aligned data models with actual FastAPI backend and Faizan's attack engine. Added all eight canonical attack categories (prompt_injection, indirect_prompt_injection, data_leakage, tool_abuse, memory_poisoning, identity_privilege_abuse, human_approval_bypass, inter_agent_spoofing). Added nested DashboardStats schema, AgentComparisonResponse, numeric IDs, and finding view-model adapter.
- `src/lib/api-client.ts`: Rewritten API client using native fetch with structured ApiError handling, cache invalidation, synchronous scan launch (POST /api/scans), comparison endpoint (GET /api/dashboard/comparison), report generation (POST /api/scans/{id}/report), and PDF streaming (GET /api/reports/{id}/pdf).
- `src/components/intro/ShieldZoomIntro.tsx`: Implemented cinematic opening camera-zoom introduction. Center-aligned SVG coral square with shield cutout, readiness signals (fonts, window, Three.js canvas), log-space keyframe interpolation scale = S^easedT via Web Animations API, prefers-reduced-motion support, sessionStorage memoization, skip on keypress/click, and head script anti-flash detection.
- `src/components/scan/SecurityScanSection.tsx`: Upgraded to all eight canonical attack categories with Select All, Clear All, and active selection counter. Added target selection for vulnerable and protected demo agents, and synchronous execution feedback.
- `src/components/agents/AgentManagementView.tsx`: Added quick-deploy buttons for Vulnerable Mock Agent and Protected Mock Agent. Removed target_url and api_key fields. Displayed numeric IDs and architectural type badges.
- `src/components/reports/ScanComparisonView.tsx`: Integrated backend comparison endpoint (/api/dashboard/comparison) displaying high-level outcome summaries and an eight-row side-by-side differential analysis table.
- `src/components/reports/ScanReportModal.tsx`: Updated PDF workflow to request backend report creation and binary PDF download with client-side jsPDF fallback.
- `src/middleware.ts`: Removed mandatory route gating on /, /agents, /scans, /reports, /faq to provide frictionless public evaluator access.
- `src/components/ui/wave-grid-background.tsx`: Added agentlock-wave-ready event dispatching and readiness flag for seamless intro handoff.

### Authentication Page Redesign and Cleanup
- `src/app/login/layout.tsx`: Removed header bar, "Back to site" link, and opaque background so the 3D wave-grid background shows behind the login view.
- `src/app/login/LoginFormClient.tsx`: Removed "AgentLock Security Console" badge, "Security evaluation for..." headline and paragraph, runtime pipeline card, sample finding card, and "Need an enterprise account? Request access" footer. Converted to a clean two-column desktop layout with the animated AgentLock logo centered on the left, and single-column centered mobile layout. Single H1 heading "Log in to AgentLock".
- `src/components/ui/AgentLockLogo.tsx`: Reusable brand logo component with coral shield mark (56px desktop, 44px mobile), dark inner shield, and wordmark. Animated shield stroke-dashoffset (700ms) and wordmark fade-in (350ms) using motion/react with prefers-reduced-motion support.
- `src/components/ui/WaveGridClientWrapper.tsx`: Restored 3D wave-grid background on the `/login` route.
- `src/app/register/page.tsx`: Updated metadata to "Enterprise Access" to eliminate stale search pattern matches.

### Interactive Visualisations and Downloadable Attack Report Upgrade
- `src/lib/chart-data.ts`: Created pure data selectors (`getSeverityCounts`, `getCategoryCounts`, `getCategoryBySeverity`, `getFindingsOverTime`, `getAgentRiskRanking`, `getScanTimeline`, `getScanComparison`, `getCategoryProgress`, `getRealSparkline`) fed strictly by typed API models with zero synthetic numbers.
- `src/components/dashboard/MetricTile.tsx`: Flat solid metric tiles featuring SVG sparklines derived from actual historical scan data, empty state handling, and metric delta badges.
- `src/components/dashboard/SeverityDonut.tsx`: Clean Recharts donut chart with central findings counter, keyboard navigation, empty state with scan shortcut, dimmed non-hovered slices, and tabular toggle.
- `src/components/dashboard/AttackVectorChart.tsx`: Horizontal bar chart breaking down findings across Prompt Injection, Data Leakage, Tool Abuse, and Memory Poisoning with share percentages and table toggle.
- `src/components/dashboard/VulnerabilityVelocityChart.tsx`: Area chart showing total confirmed vulnerabilities over time with range selectors (7D, 30D, ALL), date formatting, and table toggle.
- `src/components/analytics/CategorySeverityHeatmap.tsx`: Interactive cross-tabulation matrix correlating attack categories against severity tiers with cell click-through to filtered results.
- `src/components/analytics/AnalyticsSection.tsx`: Integrated heatmap, full-width velocity chart, and synchronized bidirectional filter state with Results section.
- `src/components/agents/AgentRiskRanking.tsx`: Relative risk ranking bars weighted by severity multipliers (Critical: 10, High: 5, Medium: 2, Low: 1), category expander, and historical delta markers.
- `src/components/agents/AgentManagementView.tsx`: Integrated AgentRiskRanking directly into target agent inventory view.
- `src/components/scan/ScanProgressVisualizer.tsx`: Real-time category-segmented execution progress, live findings counter, and exploit feed.
- `src/components/scan/SecurityScanSection.tsx`: Integrated ScanProgressVisualizer for active and recent scans.
- `src/components/results/FindingStepDiagram.tsx`: Three-step adversarial breach diagram (Prompt -> Execution -> Impact) with payload copy, sensitive credential masking, and remediation verification checklist.
- `src/components/results/VulnerabilityResultsSection.tsx`: Severity-first ordering, category glyphs, active filter chips with one-click dismiss, and step-by-step diagram toggle.
- `src/components/threats/ThreatInvestigationView.tsx`: Integrated FindingStepDiagram inside threat investigation view.
- `src/components/reports/ScanTimelineStrip.tsx`: Horizontal timeline of historical scans color-coded by worst severity detected.
- `src/components/reports/ScanComparisonView.tsx`: Comparative analysis between two scans showing new, resolved, and persistent vulnerabilities plus category deltas.
- `src/components/reports/ScanReportModal.tsx`: Complete in-app audit dossier preview modal with executive summary, category breakdown, finding payloads, "Copy summary" action, and vector PDF download.
- `src/components/reports/ReportsSection.tsx`: Integrated ScanTimelineStrip, ScanComparisonView, and audit dossier modal preview.
- `src/lib/pdf-report-generator.ts`: Vector PDF generator utilizing jsPDF with custom styling, headers, footers, page numbering (Page X of Y), vector bar charts, masked credentials, and methodology disclaimer.
- `src/app/scans/[id]/ScanDetailClient.tsx`: Integrated report preview modal and client-side vector PDF generation fallback.
- `src/app/page.tsx`: Integrated sparkline metric tiles, shared filter state, and report modal flow.
- `docs/backend-data-requests.md`: Documented five missing backend telemetry fields: category progression, server-side risk score, historical scan severity breakdown, scan duration seconds, and binary PDF streaming endpoint.

### Authentication and Custom Login Page
- `src/app/login/page.tsx` and `src/app/login/LoginFormClient.tsx`: Hand-built two-column login experience with purposeful motion, inline validation, Caps Lock warning indicator, and rate-limit countdown.
- `src/app/login/layout.tsx`: Dedicated minimal authentication layout with wordmark linking home and back-to-site link, excluding TopBar and 3D canvas.
- `src/components/ui/WaveGridClientWrapper.tsx`: Isolated Three.js canvas so it is completely unmounted on `/login`.
- `src/types/api.ts` and `src/lib/api-client.ts`: Added User and Auth interfaces, AuthError class, credentials: 'include', and api.login, api.logout, api.getCurrentUser methods.
- `src/middleware.ts`: Created edge route protection middleware for `/agents`, `/scans`, and `/reports` with open-redirect sanitization.
- `src/components/navigation/TopBar.tsx` and `src/components/navigation/HamburgerDrawer.tsx`: Added login link, authenticated user status indicator, and logout action.
- `src/app/forgot-password/page.tsx` and `src/app/register/page.tsx`: Added minimal informative routes to prevent dead links.
- `src/app/robots.ts` and `next.config.mjs`: Disallowed `/login` crawling in robots.txt and added no-store cache headers for auth pages.
- `docs/auth-contract.md`: Documented complete backend authentication API specification.

### Restoration: 3D Wave Grid Background
- Restored 3D wave grid background (`src/components/ui/wave-grid-background.tsx` and `src/components/ui/WaveGridClientWrapper.tsx`) from git commit `cc60949`.
- Re-installed `three@^0.169.0` and `@types/three@^0.169.0`.
- Integrated `<WaveGridClientWrapper />` into `src/app/layout.tsx` as a persistent background with `ssr: false` and 400ms fade-in transition.
- Implemented static single-frame rendering for `prefers-reduced-motion: reduce`.
- Implemented tab visibility pause, viewport cap at 2 dpr, geometry scaling on narrow/low-power devices, silent WebGL failure fallback, and resource disposal on unmount.
- Re-added `three` to `optimizePackageImports` in `next.config.mjs`.

### Phase 0: Initial Audit
- Completed comprehensive audit of console errors, template patterns, placeholders, domain inconsistencies, and dependencies.

### Phase 1: Design and Typography Overhaul
- `src/app/layout.tsx`: Loaded Syne (display), Plus Jakarta Sans (body), and JetBrains Mono (code) via `next/font/google` with `display: swap`. Removed Three.js background canvas and blocking preloader. Added title template.
- `src/app/globals.css`: Removed all glassmorphism, glowing blobs, and blur tokens. Replaced with flat solid navy surfaces, real borders, accessible focus outlines, and single border radius scale.
- `tailwind.config.ts`: Configured `--font-display`, `--font-sans`, and `--font-mono` font variables; standardized single border radius scale.
- `src/components/dashboard/GlassMetricCard.tsx`: Replaced with flat solid `MetricCard`, removed fake sparklines and countup.
- `src/components/dashboard/SeverityDonut.tsx`: Clean donut chart without SVG glow filters.
- `src/components/dashboard/AttackVectorChart.tsx`: Clean bar chart without gradient fills.
- `src/components/dashboard/VulnerabilityVelocityChart.tsx`: Clean area chart without drop-shadow glows.
- `src/components/analytics/ExposureHeatmap.tsx`: Clean matrix without glowing shadows.
- `src/components/hero/ScannerHero.tsx`: Removed glowing blobs, glass classes, button arrows, and all-caps labels. Added documented product screenshot slot.
- Deleted `src/components/ui/wave-grid-background.tsx` and `src/components/ui/WaveGridClientWrapper.tsx`.
- Deleted `src/components/preloader/` directory (`AgentLockPreloader`, `IntroTransition`, `AgentLockLogoReveal`, `FuturisticLoadingBar`).
- Deleted `src/components/ui/GlassPanel.tsx` and `src/components/ui/MockBadge.tsx`.
- Removed `three`, `@types/three`, and `axios` dependencies from `package.json`.

### Phase 2: Performance and Optimizations
- `src/lib/api-client.ts`: Replaced Axios with lightweight native `fetch` client; added in-memory SWR cache with automatic invalidation; strictly disabled mock mode in production builds.
- `next.config.mjs`: Added immutable Cache-Control headers for static assets and icons; disabled production source maps (`productionBrowserSourceMaps: false`).
- `src/app/page.tsx`: Parallelized initial data loading with `Promise.allSettled` to eliminate request waterfalls; added optimistic UI updates for agent registration.
- `src/components/scan/SecurityScanSection.tsx`: Added optimistic scan queue state and graceful polling backoff.
- `src/components/analytics/AnalyticsSection.tsx`: Dynamically imported below-the-fold Recharts charts with `ssr: false`.
- `docs/backend-index-recommendations.md`: Created recommended SQL index statements for external backend service.

### Phase 3: SEO, Structure, and Real Routes
- Converted major views into dedicated App Router routes:
  - `/agents`: Target agent inventory, registration, and health monitoring.
  - `/scans`: Scan staging, category selection, and runner.
  - `/scans/[id]`: Detailed vulnerability findings, attack payloads, evidence, and PDF download.
  - `/reports`: Cryptographic audit records and downloadable PDF dossiers.
  - `/faq`: Methodology and verification FAQ.
- Added unique title (< 60 chars), unique description (< 160 chars), canonical tag, and Open Graph metadata to every route.
- Verified exactly one H1 element per route.
- `src/components/navigation/Breadcrumb.tsx`: Added accessible breadcrumbs with `BreadcrumbList` JSON-LD to every inner route.
- `src/app/not-found.tsx`: Redesigned custom 404 page in flat navy style with navigation links and noindex directive.
- `src/app/sitemap.ts`: Dynamic sitemap generator reading `NEXT_PUBLIC_SITE_URL`.
- `src/app/robots.ts`: Dynamic robots.txt disallowing `/api/`.
- Deleted static `public/sitemap.xml` and `public/robots.txt`.
- `public/llms.txt`: Rewritten to reflect real routes and accurate architecture without em dashes.
- `public/site.webmanifest`: Aligned theme color to `#060D1F`.

### Phase 4: Cleanup, Correctness, and Documentation
- Fixed offline backend handling: calm UI indicators without console errors.
- Removed mocks from production builds.
- `README.md`: Updated with port 5173, `BACKEND_URL`, custom domain guide, and verified zero em dashes.
