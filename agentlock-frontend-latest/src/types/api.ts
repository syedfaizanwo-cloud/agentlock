/**
 * AgentLock API Data Types
 * AI Agent Vulnerability Scanner & Automated Red Teaming Platform
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AttackCategory =
  | 'prompt_injection'
  | 'data_leakage'
  | 'tool_abuse'
  | 'memory_poisoning';

export type ScanStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  target_url: string;
  description?: string;
  role?: string; // UNCONFIRMED
  model?: string; // UNCONFIRMED
  privilege_tier?: string; // UNCONFIRMED
  action_count?: number; // UNCONFIRMED
  status: 'active' | 'inactive' | 'testing' | 'offline'; // UNCONFIRMED: exact status values
  created_at: string;
  last_scan_at?: string;
}

export interface RegisterAgentPayload {
  name: string;
  target_url: string;
  description?: string;
  api_key?: string; // sent securely over TLS, masked in UI, never stored in localStorage
}

export interface Scan {
  id: string;
  agent_id: string;
  agent_name?: string; // UNCONFIRMED: joined agent name
  status: ScanStatus;
  categories: AttackCategory[];
  progress?: number; // UNCONFIRMED: percentage (0-100) or null if indeterminate
  status_message?: string; // UNCONFIRMED: e.g. "Executing Prompt Injection test 3/12"
  total_tests?: number;
  completed_tests?: number;
  vulnerabilities_found?: number;
  started_at: string;
  completed_at?: string;
}

export interface CreateScanPayload {
  agent_id: string;
  categories: AttackCategory[];
}

export interface Finding {
  id: string;
  scan_id: string;
  agent_id: string;
  category: AttackCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  attack_prompt: string; // Attack payload text
  evidence: string; // Raw agent response evidence
  impact: string; // Consequence if exploited
  remediation: string; // Actionable fix steps
  status?: 'confirmed' | 'fixed' | 'unconfirmed'; // UNCONFIRMED
  created_at: string;
}

export interface DashboardStats {
  registered_agents: number;
  total_scans: number;
  confirmed_vulnerabilities: number;
  critical_findings: number;
  // UNCONFIRMED breakdown fields:
  severity_breakdown?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  category_breakdown?: {
    prompt_injection: number;
    data_leakage: number;
    tool_abuse: number;
    memory_poisoning: number;
  };
  recent_scans?: Scan[];
}

export interface ScanReport {
  id: string;
  scan_id: string;
  agent_id: string;
  agent_name?: string;
  generated_at: string;
  summary: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  pdf_url?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
}

// Compatibility aliases for components being refactored
export type AgentStatus = 'active' | 'inactive' | 'testing' | 'offline';
export type PrivilegeTier = 'read' | 'write' | 'admin' | 'full';
export interface ThreatDetails extends Finding {
  incident_id?: string;
  recommended_mitigation?: string;
  explanation?: string;
  risk_score?: number;
  mitre_technique_id?: string;
  raw_prompt?: string;
  payload_preview?: string;
  detection_vector?: string;
  timestamp?: string;
  agent_name?: string;
  rule_triggered?: string;
}
export type ActionRecord = Scan;
export type ActionStatus = ScanStatus;
