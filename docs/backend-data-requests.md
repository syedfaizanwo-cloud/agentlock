# Backend Data Requests for Visualisations and Reports

This document tracks fields requested by the frontend visualization and reporting engine that are not yet available or explicitly returned in `src/types/api.ts`. In accordance with project policy, no data is faked; where a field is absent, client-side deterministic derivations are used or the visual element is safely omitted until the backend implements it.

## 1. Scan Progress Breakdown per Category
- **Endpoint**: `GET /api/scans/{id}`
- **Requested Field**: `category_progress?: Record<AttackCategory, { completed: number; total: number; status: 'pending' | 'running' | 'completed' | 'failed' }>`
- **Current Behavior**: The API returns `categories: AttackCategory[]`, `progress: number` (overall percentage), `total_tests: number`, and `completed_tests: number`.
- **Frontend Fallback**: The frontend calculates an apportioned progress per selected category based on `completed_tests` and total selected categories, but true per-category real-time status requires this backend field.

## 2. Server-Side Calculated Agent Risk Score
- **Endpoint**: `GET /api/agents` and `GET /api/agents/{id}`
- **Requested Field**: `risk_score?: number; previous_risk_score?: number;`
- **Current Behavior**: The `Agent` object has `status` and `last_scan_at`, but no numerical posture or composite risk rating.
- **Frontend Fallback**: The frontend derives an objective posture score using standard severity weights (Critical = 10, High = 5, Medium = 2, Low = 1) across the agent's confirmed findings.

## 3. Severity Breakdown on Historical Scan Summaries
- **Endpoint**: `GET /api/scans` (List Scans)
- **Requested Field**: `Scan.severity_breakdown?: { critical: number; high: number; medium: number; low: number; info: number }`
- **Current Behavior**: `Scan` objects in the list only provide `vulnerabilities_found: number`. Getting the severity breakdown requires a separate `GET /api/scans/{id}/results` call per scan.
- **Frontend Fallback**: The timeline strip displays the scan colored by total findings, and fetches detailed findings upon click or for the active scan.

## 4. Scan Execution Duration and Resource Telemetry
- **Endpoint**: `GET /api/scans/{id}`
- **Requested Field**: `duration_seconds?: number; total_tokens_evaluated?: number; avg_latency_ms?: number;`
- **Current Behavior**: `started_at` and `completed_at` timestamps are provided.
- **Frontend Fallback**: Duration is derived from `completed_at - started_at`. Token and model telemetry are omitted.

## 5. Binary PDF Audit Dossier Endpoint
- **Endpoint**: `GET /api/scans/{id}/report/pdf`
- **Requested Spec**: Server-side binary PDF streaming with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."`.
- **Current Behavior**: Frontend falls back to client-side vector PDF generation using `jspdf` when this endpoint returns 404 or fails.
