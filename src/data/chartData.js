// ==============================================================================
// src/data/chartData.js
// Shared data series for AgentLock 2.0 section charts and MagicBento metrics.
// Data matches existing mock figures: 13,196 total operations, 183-190 blocked threats,
// 3 pending approvals, 6 fleet agents (3 active, 1 supervised, 1 quarantined, 1 suspended).
// MOCK: replace with API when backend dynamic streaming endpoints are connected.
// ==============================================================================

// Palette tokens
export const CHART_PALETTE = {
  gold: '#E6CBA8',
  white: '#FFFFFF',
  grey1: '#BDBDBD',
  grey2: '#8A8A8A',
  grey3: '#5C5C5C',
  grey4: '#3D3D3D',
  surface: '#151515',
  success: '#6FAF8A',
  danger: '#C0504D',
};

// ------------------------------------------------------------------------------
// 1. TELEMETRY
// ------------------------------------------------------------------------------
export const TELEMETRY_CHARTS = {
  // Blocked vs Allowed ratio ring (13,006 allowed, 190 blocked = 13,196 total)
  ratioRing: [
    { name: 'Allowed Operations', value: 13006, color: '#BDBDBD' },
    { name: 'Blocked / Quarantined', value: 190, color: '#E6CBA8' },
  ],
  // 24h hourly volume (peaks between 09:00 - 12:00)
  hourlyVolume: [
    { hour: '00:00', ops: 120, blocked: 1 },
    { hour: '02:00', ops: 90, blocked: 0 },
    { hour: '04:00', ops: 140, blocked: 2 },
    { hour: '06:00', ops: 640, blocked: 4 },
    { hour: '07:00', ops: 890, blocked: 8 },
    { hour: '08:00', ops: 1450, blocked: 19 },
    { hour: '09:00', ops: 2100, blocked: 32 },
    { hour: '10:00', ops: 2840, blocked: 48 },
    { hour: '11:00', ops: 3120, blocked: 52 },
    { hour: '12:00', ops: 2156, blocked: 27 },
    { hour: '14:00', ops: 1840, blocked: 22 },
    { hour: '16:00', ops: 1420, blocked: 15 },
    { hour: '18:00', ops: 980, blocked: 9 },
    { hour: '20:00', ops: 650, blocked: 5 },
    { hour: '22:00', ops: 380, blocked: 3 },
  ],
  // Top threat vectors
  topThreatVectors: [
    { vector: 'Prompt Injection', count: 74, pct: 40.4 },
    { vector: 'Unauthorized RCE', count: 46, pct: 25.1 },
    { vector: 'Data Exfiltration', count: 38, pct: 20.8 },
    { vector: 'Privilege Escalation', count: 21, pct: 11.5 },
    { vector: 'Tool Overuse', count: 11, pct: 6.0 },
  ],
  // Sparklines for KPI cards
  sparklines: {
    totalOps: [8200, 9400, 10200, 11500, 12400, 12900, 13196],
    blockedThreats: [45, 68, 92, 124, 156, 172, 183],
    avgLatency: [28, 24, 21, 19, 18, 17, 16.4],
    interceptRate: [99.1, 99.4, 99.7, 99.8, 99.9, 100.0, 100.0],
  },
};

// ------------------------------------------------------------------------------
// 2. FLEET GOVERNANCE
// ------------------------------------------------------------------------------
export const FLEET_CHARTS = {
  // Stacked bar of agents by privilege tier
  privilegeTiers: [
    { tier: 'L1 ReadOnly', count: 2, share: '33.3%' },
    { tier: 'L2 Exec', count: 2, share: '33.3%' },
    { tier: 'L3 DB Write', count: 1, share: '16.7%' },
    { tier: 'L4 Admin Root', count: 1, share: '16.7%' },
  ],
  // Per-agent risk scores (sorted high to low)
  agentRiskScores: [
    { name: 'Web-Research-Crawler', score: 92, status: 'quarantined', tier: 'L1' },
    { name: 'Financial-Analytics', score: 64, status: 'supervised', tier: 'L2' },
    { name: 'Shadow-Code-Synth', score: 58, status: 'suspended', tier: 'L1' },
    { name: 'Auto-DevOps-Exec', score: 22, status: 'active', tier: 'L3' },
    { name: 'Customer-DB-Assist', score: 11, status: 'active', tier: 'L2' },
    { name: 'Cloud-Sentinel', score: 3, status: 'active', tier: 'L4' },
  ],
  // Status breakdown
  statusBreakdown: [
    { name: 'Active', value: 3, color: '#FFFFFF' },
    { name: 'Supervised', value: 1, color: '#BDBDBD' },
    { name: 'Quarantined', value: 1, color: '#E6CBA8' },
    { name: 'Suspended', value: 1, color: '#5C5C5C' },
  ],
  avgFleetRisk: 18.4, // out of 100
};

// ------------------------------------------------------------------------------
// 3. ACTION MONITORING
// ------------------------------------------------------------------------------
export const ACTION_CHARTS = {
  // Base 12-minute throughput (for live ticking area chart)
  baseTimeline: [
    { time: '11:02', rate: 184, allowed: 180, blocked: 4 },
    { time: '11:03', rate: 210, allowed: 206, blocked: 4 },
    { time: '11:04', rate: 195, allowed: 191, blocked: 4 },
    { time: '11:05', rate: 245, allowed: 236, blocked: 9 },
    { time: '11:06', rate: 220, allowed: 215, blocked: 5 },
    { time: '11:07', rate: 260, allowed: 251, blocked: 9 },
    { time: '11:08', rate: 215, allowed: 211, blocked: 4 },
    { time: '11:09', rate: 230, allowed: 224, blocked: 6 },
    { time: '11:10', rate: 280, allowed: 268, blocked: 12 },
    { time: '11:11', rate: 240, allowed: 232, blocked: 8 },
    { time: '11:12', rate: 295, allowed: 280, blocked: 15 },
    { time: '11:13', rate: 310, allowed: 292, blocked: 18 },
  ],
  // Verdicts breakdown
  verdictDistribution: [
    { verdict: 'Allowed', count: 13006, color: '#FFFFFF' },
    { verdict: 'Blocked', count: 183, color: '#E6CBA8' },
    { verdict: 'Escalated to HITL', count: 7, color: '#8A8A8A' },
  ],
  // Top 5 tools called
  topTools: [
    { tool: 'sql_read / pg_explain', calls: 5410, share: '41.0%' },
    { tool: 'bash_sandboxed', calls: 3840, share: '29.1%' },
    { tool: 'http_fetch', calls: 1920, share: '14.5%' },
    { tool: 'aws_iam_revoke', calls: 1204, share: '9.1%' },
    { tool: 's3_upload', calls: 822, share: '6.2%' },
  ],
  sparklines: {
    throughput: [180, 210, 195, 245, 220, 260, 310],
    p95Latency: [22, 21, 19, 18, 17, 18, 16.8],
  },
};

// ------------------------------------------------------------------------------
// 4. THREAT FORENSICS
// ------------------------------------------------------------------------------
export const THREAT_CHARTS = {
  // Severity breakdown
  severityBreakdown: [
    { severity: 'Critical', count: 48, color: '#E6CBA8' },
    { severity: 'High', count: 74, color: '#FFFFFF' },
    { severity: 'Medium', count: 42, color: '#BDBDBD' },
    { severity: 'Low', count: 19, color: '#5C5C5C' },
  ],
  // 7-day trend
  sevenDayTrend: [
    { day: 'Mon', critical: 6, high: 9, medium: 5 },
    { day: 'Tue', critical: 8, high: 11, medium: 7 },
    { day: 'Wed', critical: 5, high: 8, medium: 6 },
    { day: 'Thu', critical: 9, high: 12, medium: 8 },
    { day: 'Fri', critical: 11, high: 16, medium: 9 },
    { day: 'Sat', critical: 4, high: 8, medium: 4 },
    { day: 'Sun', critical: 5, high: 10, medium: 3 },
  ],
  // MITRE technique heatmap (tactics vs incidents)
  mitreTactics: [
    { tactic: 'Execution (T1059)', count: 48, intensity: 1.0 },
    { tactic: 'Privilege Escalation (T1078)', count: 34, intensity: 0.75 },
    { tactic: 'Exfiltration (T1048)', count: 28, intensity: 0.62 },
    { tactic: 'Defense Evasion (T1203)', count: 22, intensity: 0.5 },
    { tactic: 'Persistence (T1053)', count: 18, intensity: 0.4 },
    { tactic: 'Credential Access (T1552)', count: 14, intensity: 0.32 },
  ],
  // Mitigation coverage
  mitigations: [
    { name: 'Pipe-to-shell RCE Intercept', coverage: 100.0 },
    { name: 'Zero-Prompt Taint Sanitization', coverage: 99.4 },
    { name: 'SSN / Financial PII Masking', coverage: 98.8 },
    { name: 'IAM Cross-Account Root Guard', coverage: 100.0 },
  ],
};

// ------------------------------------------------------------------------------
// 5. APPROVAL CENTER
// ------------------------------------------------------------------------------
export const APPROVAL_CHARTS = {
  // Funnel: Submitted -> Reviewed -> Final Verdict
  funnel: [
    { stage: 'Action Requested', count: 142, pct: '100%' },
    { stage: 'Heuristically Flagged', count: 48, pct: '33.8%' },
    { stage: 'Routed to HITL Queue', count: 34, pct: '23.9%' },
    { stage: 'Approved / Resolved', count: 31, pct: '21.8%' },
    { stage: 'Pending Verification', count: 3, pct: '2.1%' },
  ],
  // Pending approvals by age (<1h, 1-4h, 4-24h, >24h) - exactly matches 3 pending
  pendingByAge: [
    { bucket: '< 1 hour', count: 2, color: '#E6CBA8' },
    { bucket: '1 - 4 hours', count: 1, color: '#FFFFFF' },
    { bucket: '4 - 24 hours', count: 0, color: '#8A8A8A' },
    { bucket: '> 24 hours', count: 0, color: '#5C5C5C' },
  ],
  // Ratio
  decisionRatio: [
    { name: 'Approved with Conditions', value: 27, color: '#FFFFFF' },
    { name: 'Rejected & Quarantined', value: 4, color: '#E6CBA8' },
    { name: 'Pending Operator Review', value: 3, color: '#8A8A8A' },
  ],
  avgReviewTimeMinutes: 4.2,
};

// ------------------------------------------------------------------------------
// 6. AUDIT EXPLORER
// ------------------------------------------------------------------------------
export const AUDIT_CHARTS = {
  // Merkle sealed blocks per hour
  blocksPerHour: [
    { hour: '06:00', blocks: 42 },
    { hour: '07:00', blocks: 68 },
    { hour: '08:00', blocks: 110 },
    { hour: '09:00', blocks: 165 },
    { hour: '10:00', blocks: 224 },
    { hour: '11:00', blocks: 248 },
    { hour: '12:00', blocks: 185 },
  ],
  // Event types
  eventTypes: [
    { name: 'Policy Intercepts', value: 68, color: '#E6CBA8' },
    { name: 'KMS Signature Seals', value: 18, color: '#FFFFFF' },
    { name: 'HITL Sign-offs', value: 9, color: '#BDBDBD' },
    { name: 'Agent Quarantines', value: 5, color: '#5C5C5C' },
  ],
  // Sequential hash chain verification
  hashChainNodes: [
    { seq: 1037, status: 'verified', hash: '0000e4..a1', time: '11:02:40' },
    { seq: 1038, status: 'verified', hash: '0000a2..b7', time: '11:05:14' },
    { seq: 1039, status: 'verified', hash: '00001a..0f', time: '11:10:55' },
    { seq: 1040, status: 'verified', hash: '00007b..9f', time: '11:12:10' },
    { seq: 1041, status: 'verified', hash: '0000f8..41', time: '11:13:45' },
    { seq: 1042, status: 'verified', hash: '0000a3..aa', time: '11:14:02' },
  ],
  lastVerifiedSecondsAgo: 2.4,
};

// ------------------------------------------------------------------------------
// 7. ATTACK SIMULATION
// ------------------------------------------------------------------------------
export const SIMULATION_CHARTS = {
  // Radar chart of jailbreak categories (blocked %)
  radarCategories: [
    { category: 'Direct Prompt Injection', blocked: 100, fullMark: 100 },
    { category: 'Indirect Markdown Taint', blocked: 98, fullMark: 100 },
    { category: 'Cross-Agent Privilege Abuse', blocked: 96, fullMark: 100 },
    { category: 'Egress Data Exfiltration', blocked: 100, fullMark: 100 },
    { category: 'System Backdoor Injection', blocked: 100, fullMark: 100 },
    { category: 'Adversarial Jailbreaks', blocked: 94, fullMark: 100 },
  ],
  // Stacked bar: blocked vs bypassed per attack type
  scenariosComparison: [
    { scenario: 'OSINT Crawl RCE', blocked: 100, bypassed: 0 },
    { scenario: 'SQL Drop Table', blocked: 100, bypassed: 0 },
    { scenario: 'AWS STS Escalation', blocked: 100, bypassed: 0 },
    { scenario: 'DNS Tunnel Exfil', blocked: 100, bypassed: 0 },
    { scenario: 'PII Harvester', blocked: 100, bypassed: 0 },
  ],
  overallPassRatePct: 98.7,
  historySparkline: [96.2, 97.0, 97.8, 98.1, 98.4, 98.7, 98.7],
};

// ------------------------------------------------------------------------------
// 8. GATEWAY & API
// ------------------------------------------------------------------------------
export const GATEWAY_CHARTS = {
  // Latency percentiles line chart (ms)
  latencyTimeline: [
    { time: '00:00', p50: 12, p90: 22, p95: 36 },
    { time: '04:00', p50: 11, p90: 20, p95: 32 },
    { time: '08:00', p50: 15, p90: 27, p95: 41 },
    { time: '10:00', p50: 16, p90: 31, p95: 48 },
    { time: '11:00', p50: 14, p90: 28, p95: 42 },
    { time: '12:00', p50: 13, p90: 26, p95: 39 },
  ],
  // 30-day uptime bars (all 99.98% - 100%)
  uptimeDays: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    uptime: i === 14 ? 99.98 : i === 22 ? 99.99 : 100.0,
  })),
  // HTTP status code distribution
  httpStatusCodes: [
    { code: '200 OK', share: 96.4, color: '#FFFFFF' },
    { code: '403 Blocked', share: 2.8, color: '#E6CBA8' },
    { code: '422 Validation', share: 0.6, color: '#8A8A8A' },
    { code: '500 Server', share: 0.2, color: '#5C5C5C' },
  ],
  // Requests per second area
  rpsHistory: [
    { time: '06:00', rps: 18 },
    { hour: '07:00', rps: 28 },
    { hour: '08:00', rps: 52 },
    { hour: '09:00', rps: 84 },
    { hour: '10:00', rps: 112 },
    { hour: '11:00', rps: 124 },
    { hour: '12:00', rps: 96 },
  ],
  // Endpoint health list
  endpoints: [
    { path: '/v1/intercept/evaluate', status: 'operational', latencyMs: 14, method: 'POST' },
    { path: '/v1/telemetry/summary', status: 'operational', latencyMs: 8, method: 'GET' },
    { path: '/v1/audit/logs', status: 'operational', latencyMs: 19, method: 'GET' },
    { path: '/v1/agents/{id}/quarantine', status: 'operational', latencyMs: 6, method: 'POST' },
  ],
};
