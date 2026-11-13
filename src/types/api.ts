/**
 * AgentLock 2.0 - Core API Contract & Data Types
 * Aligned with backend policy engine and Python threat detector specifications
 */

export type ActionStatus = 'allowed' | 'blocked' | 'escalated' | 'pending';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type AgentStatus = 'active' | 'quarantined' | 'supervised' | 'suspended';
export type PrivilegeTier = 'L1_READONLY' | 'L2_EXEC' | 'L3_DB_WRITE' | 'L4_ADMIN_ROOT';
export type ActionType = 'bash' | 'sql' | 'file_write' | 'file_read' | 'api_call' | 'iam_assume' | 'llm_query';

export interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  status: AgentStatus;
  privilege_tier: PrivilegeTier;
  token_usage_rate: number; // tokens/min
  last_heartbeat: string;
  risk_level: 'safe' | 'elevated' | 'high' | 'critical';
  total_actions: number;
  blocked_count: number;
  description: string;
  allowed_tools: string[];
  owner: string;
}

export interface ActionRecord {
  id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  action_type: ActionType;
  target: string;
  payload: string;
  status: ActionStatus;
  severity: SeverityLevel;
  risk_score: number; // 0 - 100
  detection_vector?: string;
  rule_triggered?: string;
  explanation: string;
  mitigation_applied?: string;
  // Nullable provenance & source/destination columns (Part 2)
  source?: string | null;
  source_trust?: SourceTrustLevel | null;
  destination?: string | null;
  provenance_hash?: string | null;
}

export interface DashboardSummary {
  total_actions: number;
  blocked_threats: number;
  pending_approvals: number;
  active_agents: number;
  avg_risk_score: number;
  block_rate_percentage?: number;
  blocked_trend_percentage?: number;
  system_status?: 'nominal' | 'degraded' | 'critical';
  gateway_uptime?: string;
  eval_latency_p99?: number; // in ms
  timeline?: {
    time: string;
    total: number;
    blocked: number;
    escalated: number;
  }[];
  threat_categories?: {
    category: string;
    count: number;
    color: string;
  }[];
  agent_risk_rankings?: {
    agent_name: string;
    risk_score: number;
    threats_blocked: number;
    status: AgentStatus;
  }[];
  recent_activity?: ActionRecord[];
}

export interface ThreatDetails {
  id?: string;
  incident_id: string;
  agent_id: string;
  agent_name: string;
  threat_type?: string;
  severity: SeverityLevel;
  timestamp: string;
  description?: string;
  mitre_tactic?: string;
  mitre_id?: string;
  mitre_technique_id?: string;
  payload_sample?: string;
  payload_preview: string;
  raw_prompt?: string;
  recommended_action?: string;
  recommended_mitigation?: string;
  automated_policy_applied?: boolean;
  status: 'active' | 'mitigated' | 'investigating' | 'blocked' | 'escalated' | 'allowed' | 'pending';
  matched_rules?: string[];
  rule_triggered?: string;
  detection_vector?: string;
  risk_score?: number;
  explanation?: string;
  historical_occurrences?: number;
}

export interface ApprovalRequest {
  id: string;
  action_id?: string;
  agent_id: string;
  agent_name: string;
  action_type: ActionType;
  target: string;
  payload?: string;
  parameters?: Record<string, any>;
  risk_score: number;
  severity?: SeverityLevel;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  created_at?: string;
  requester_ip?: string;
  dual_authorization_required?: boolean;
  reviewer?: string;
  review_timestamp?: string;
  resolution_note?: string;
}

export interface AuditLogEntry {
  id?: string;
  sequence_id?: number;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  action_summary: string;
  sha256_hash?: string;
  block_hash: string;
  prev_hash: string;
  verdict: ActionStatus;
  risk_score?: number;
  signed_by: string;
  cryptographic_status: 'verified' | 'tampered';
  payload_digest: string;
  // Nullable provenance & source/destination columns (Part 2)
  source?: string | null;
  destination?: string | null;
  provenance_hash?: string | null;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: 'Prompt Injection' | 'Remote Code Execution' | 'Data Exfiltration' | 'Privilege Escalation' | 'Credential Harvesting';
  description: string;
  payload: string;
  target_agent_id: string;
  target_agent_name: string;
  action_type: ActionType;
  expected_verdict: ActionStatus;
  mitre_technique: string;
}

export interface SimulationResult {
  simulation_id: string;
  scenario_id: string;
  scenario_name: string;
  timestamp: string;
  execution_ms: number;
  verdict: ActionStatus;
  risk_score: number;
  rules_triggered: string[];
  explanation: string;
  full_trace: {
    step: string;
    status: 'pass' | 'flagged' | 'blocked';
    detail: string;
  }[];
}

export interface EvaluateActionPayload {
  agent_id: string;
  action_type: ActionType;
  target: string;
  payload: string;
  context?: Record<string, any>;
  source?: string;
  destination?: string;
  hmac_signature?: string;
  timestamp?: number;
  nonce?: string;
}

export interface EvaluateActionResponse {
  decision: ActionStatus;
  risk_score: number;
  severity: SeverityLevel;
  explanation: string;
  rule_triggered?: string;
  requires_human_approval: boolean;
  action_id: string;
}

export interface ApiStatusState {
  isConnected: boolean;
  isDemoMode: boolean;
  baseUrl: string;
  latencyMs: number | null;
  lastChecked: string | null;
  errorMessage?: string;
}

// =====================================================
// PART 2: SOURCE & DESTINATION SECURITY DATA MODELS
// =====================================================

export type SourceTrustLevel = 'trusted' | 'verified' | 'untrusted';
export type SourceType =
  | 'user_prompt'
  | 'uploaded_file'
  | 'web_rag'
  | 'email'
  | 'tool_output'
  | 'api'
  | 'agent_mesh';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  trust_level: SourceTrustLevel;
  allowlist: string[];
  scanned: boolean;
  pii_masked: boolean;
  total_ingested: number;
  blocked_attempts: number;
  description: string;
}

export type DestinationScope =
  | 'external_api'
  | 's3_bucket'
  | 'database'
  | 'email_relay'
  | 'internal_service';

export interface Destination {
  id: string;
  host_or_cidr: string;
  scope: DestinationScope;
  risk: 'low' | 'medium' | 'high' | 'critical';
  allowed_agents: string[]; // agent IDs or ['*']
  status: 'allowed' | 'blocked' | 'quarantined';
  requires_tls: boolean;
  rate_limit_rpm: number;
  description: string;
}

export interface AgentCredential {
  id: string;
  agent_id: string;
  token_id: string;
  expires_at: string;
  revoked_at: string | null;
  scope: string;
  is_valid: boolean;
  ttl_remaining_seconds: number;
}

export interface Heartbeat {
  agent_id: string;
  agent_name: string;
  timestamp: string;
  version_hash: string;
  policy_version: string;
  missed_beats: number;
  status: 'online' | 'offline' | 'stale' | 'quarantined';
  seconds_since_last_beat: number;
  seconds_until_revocation: number;
}

export interface SecurityControl {
  key: string;
  title: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  category:
    | 'Sandboxing'
    | 'Segmentation'
    | 'Vault'
    | 'Privilege'
    | 'Audit'
    | 'Supply Chain'
    | 'Kill Switch'
    | 'Monitoring';
  faq_id?: string;
}

export interface DlpFinding {
  id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  data_type: 'secret_key' | 'pii' | 'private_key' | 'classified_doc';
  severity: SeverityLevel;
  destination: string;
  redacted: boolean;
  snippet: string;
}

export interface EgressBlockedEvent {
  id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  destination: string;
  reason: 'unlisted_domain' | 'ssrf_attempt' | 'tls_violation' | 'quota_exceeded' | 'dlp_violation';
  ip_resolved?: string;
}

export interface DestinationCheckRequest {
  url: string;
  agent_id?: string;
  payload_sample?: string;
}

export interface DestinationCheckResponse {
  allowed: boolean;
  verdict: 'ALLOW' | 'BLOCK' | 'ESCALATE';
  resolved_ip: string;
  is_ssrf_risk: boolean;
  is_allowlisted: boolean;
  dlp_status: 'clean' | 'redacted' | 'violation';
  findings: string[];
}

export interface SecuritySummary {
  hardening_score: number; // 0 - 100 (e.g. 96)
  active_sources: number;
  trusted_sources: number;
  untrusted_sources: number;
  allowed_destinations: number;
  blocked_destinations: number;
  ssrf_blocks_24h: number;
  dlp_violations_24h: number;
  offline_agents_count: number;
  kill_switch_active: boolean;
}
