# Backend Database Index Recommendations

This repository does not contain a backend directory or database migration files. The frontend communicates with an external API specified by `BACKEND_URL`.

Based on the access patterns in the frontend (`api.getScans`, `api.getAgents`, `api.getScanResults`, `api.getDashboardStats`), the following PostgreSQL indexes are recommended for optimal query performance when scanning at scale.

## Recommended SQL Indexes

```sql
-- Scans table: Fast filtering by status, sorting by creation date, and agent lookups
CREATE INDEX IF NOT EXISTS idx_scans_status_created_at 
  ON scans (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scans_agent_id_created_at 
  ON scans (agent_id, created_at DESC);

-- Agents table: Fast inventory listing and status verification
CREATE INDEX IF NOT EXISTS idx_agents_status_created_at 
  ON agents (status, created_at DESC);

-- Findings table: Fast retrieval of scan results by severity and category
CREATE INDEX IF NOT EXISTS idx_findings_scan_id_severity 
  ON findings (scan_id, severity);

CREATE INDEX IF NOT EXISTS idx_findings_category 
  ON findings (category);
```

## Query Optimization Notes

1. **Dashboard Velocity & Statistics**: The dashboard frequently queries the latest scan records. The composite index on `(status, created_at DESC)` avoids sequential table scans.
2. **Finding Detail Drawer**: Fetching findings filtered by `scan_id` with severity grouping benefits directly from `idx_findings_scan_id_severity`.
3. **No Database in Frontend Repository**: These statements are recommendations only. Apply them directly in the backend service database.
