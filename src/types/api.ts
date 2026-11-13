/**
 * AgentLock API Data Types
 * AI Agent Vulnerability Scanner & Automated Red Teaming Platform
 * 
 * Source of truth: Actual FastAPI backend schema
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Eight canonical attack categories supported by Faizan's attack engine and backend
export type AttackCategory =
  | 'prompt_injection'
  | 'indirect_prompt_injection'
  | 'data_leakage'
  | 'tool_abuse'
  | 'memory_poisoning'
  | 'identity_privilege_abuse'
  | 'human_approval_bypass'
  | 'inter_agent_spoofing';

export const ATTACK_CATEGORY_LABELS: Record<AttackCategory, string> = {
  prompt_injection: 'Prompt Injection',
  indirect_prompt_injection: 'Indirect Prompt Injection',
  data_leakage: 'Data Leakage',
  tool_abuse: 'Tool Abuse',
  memory_poisoning: 'Memory Poisoning',
  identity_privilege_abuse: 'Identity & Privilege Abuse',
  human_approval_bypass: 'Human Approval Bypass',
  inter_agent_spoofing: 'Inter-Agent Spoofing',
};

export const ALL_ATTACK_CATEGORIES: AttackCategory[] = [
  'prompt_injection',
  'indirect_prompt_injection',
  'data_leakage',
  'tool_abuse',
  'memory_poisoning',
  'identity_privilege_abuse',
  'human_approval_bypass',
  'inter_agent_spoofing',
];

export type ScanStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'completed_with_errors'
  | 'failed';

// Actual backend AgentRead schema
export interface Agent {
  id: number;
  name: string;
  description: string | null;
  agent_type: string; // 'vulnerable_mock' | 'protected_mock'
  status: string; // 'active'
  created_at: string;
  updated_at: string;
}

// Actual backend AgentCreate schema
export interface RegisterAgentPayload {
  name: string;
  description?: string;
  agent_type: 'vulnerable_mock' | 'protected_mock';
}

// Actual backend ScanRead schema
export interface Scan {
  id: number;
  agent_id: number | null;
  status: ScanStatus;
  attack_categories: AttackCategory[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// Actual backend ScanCreate schema
export interface CreateScanPayload {
  agent_id: number;
  attack_categories: AttackCategory[];
}

// Actual backend EvidenceRead schema
export interface EvidenceRecord {
  id: number;
  evidence_type: string;
  content: string;
  source: string | null;
  is_redacted: boolean;
  created_at: string;
}

// Actual backend AttackResultRead schema
export interface AttackResult {
  id: number;
  scan_id: number;
  category: AttackCategory;
  vulnerability_status: string; // 'vulnerable' | 'blocked' | 'inconclusive'
  severity: string;
  risk_score: number | null;
  risk_rationale: string | null;
  attack_input: string | null;
  impact: string | null;
  remediation: string | null;
  retest_status: string;
  verified: boolean;
  verification_summary: string | null;
  created_at: string;
  evidence: EvidenceRecord[];
}

export const isConfirmedVulnerability = (result: AttackResult): boolean =>
  result.verified && result.vulnerability_status === 'vulnerable';

export const isVerifiedBlockedAttack = (result: AttackResult): boolean =>
  result.verified && result.vulnerability_status === 'blocked';

// Actual backend ReportRead schema
export interface Report {
  id: number;
  scan_id: number;
  status: string;
  file_name: string | null;
  created_at: string;
  generated_at: string | null;
}

// Actual backend DashboardStats schema (nested response)
export interface DashboardStats {
  agents: {
    total: number;
    active: number;
    vulnerable: number;
    protected: number;
    by_type: Record<string, number>;
  };

  scans: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    completed_with_errors: number;
    failed: number;
  };

  results: {
    total: number;
    verified_results: number;
    verified_findings: number;
    confirmed_vulnerabilities: number;
    blocked_attacks: number;
    inconclusive: number;
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
  };

  risk: {
    confirmed_findings_score_sum: number;
    highest_confirmed_finding_score: number | null;
    score_scale: string;
  };

  evidence_records: number;
}

// Actual backend Comparison schemas
export interface ComparisonScanMetadata {
  scan_id: number;
  agent_id: number;
  agent_name: string;
  agent_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface ComparisonScanSummary {
  total_attack_results: number;
  verified_results: number;
  confirmed_vulnerabilities: number;
  blocked_attacks: number;
  inconclusive: number;
  by_severity: Record<string, number>;
  risk_score_sum: number;
  highest_finding_risk_score: number | null;
  evidence_records: number;
}

export interface ComparisonResult {
  category: AttackCategory;
  status: string | null;
  severity: string;
  verified: boolean;
  risk_score: number | null;
  verification_summary: string | null;
  remediation: string | null;
  evidence_count: number;
}

export interface AttackComparison {
  category: AttackCategory;
  vulnerable_agent: ComparisonResult | null;
  protected_agent: ComparisonResult | null;
  outcome: string; // 'vulnerability_blocked_in_protected' | 'vulnerable_in_both' | 'blocked_in_both' | 'vulnerability_only_in_protected' | 'inconclusive_or_mixed' | 'missing_result'
  risk_score_delta: number | null;
}

export interface AgentComparisonResponse {
  scans: {
    vulnerable: ComparisonScanMetadata;
    protected: ComparisonScanMetadata;
  };

  summaries: {
    vulnerable: ComparisonScanSummary;
    protected: ComparisonScanSummary;
  };

  comparison_summary: {
    categories_compared: number;
    vulnerability_blocked_in_protected: number;
    vulnerable_in_both: number;
    blocked_in_both: number;
    vulnerability_only_in_protected: number;
    inconclusive_or_mixed: number;
    missing_result: number;
  };

  attack_comparisons: AttackComparison[];

  risk_score_scale: string;
}

/**
 * Dedicated UI Finding View Model Adapter
 * Adapts actual AttackResult into UI friendly fields for step diagrams and cards
 */
export interface FindingViewModel {
  id: number;
  scan_id: number;
  category: AttackCategory;
  severity: string;
  title: string;
  description: string;
  attack_prompt: string;
  evidence: string;
  evidenceRecords: EvidenceRecord[];
  impact: string;
  remediation: string;
  verified: boolean;
  vulnerability_status: string;
  risk_score: number | null;
  verification_summary: string | null;
  created_at: string;
}

export function adaptAttackResultToFinding(result: AttackResult): FindingViewModel {
  const label = ATTACK_CATEGORY_LABELS[result.category] || result.category;
  const rawEvidence =
    Array.isArray(result.evidence) && result.evidence.length > 0
      ? result.evidence.map((e) => `[${e.evidence_type}] ${e.content}`).join('\n')
      : 'No raw evidence records attached.';

  return {
    id: result.id,
    scan_id: result.scan_id,
    category: result.category,
    severity: result.severity,
    title: `${label} Exploit`,
    description: result.verification_summary || `Adversarial evaluation testing ${label}`,
    attack_prompt: result.attack_input || 'Standard adversarial simulation payload',
    evidence: rawEvidence,
    evidenceRecords: result.evidence || [],
    impact: result.impact || 'Potential unauthorized agent action or data disclosure.',
    remediation: result.remediation || 'Implement strict input sanitization and parameter boundaries.',
    verified: result.verified,
    vulnerability_status: result.vulnerability_status,
    risk_score: result.risk_score,
    verification_summary: result.verification_summary,
    created_at: result.created_at,
  };
}

export type Finding = FindingViewModel;

// User & Auth types (mock/informational)
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
