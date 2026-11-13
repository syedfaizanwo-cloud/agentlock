import {
  DashboardSummary,
  Agent,
  ActionRecord,
  ApprovalRequest,
  AuditLogEntry,
  SimulationScenario,
  SimulationResult,
  EvaluateActionPayload,
  EvaluateActionResponse,
  ThreatDetails,
  ApiStatusState,
  Source,
  Destination,
  Heartbeat,
  SecurityControl,
  DlpFinding,
  EgressBlockedEvent,
  SecuritySummary,
  DestinationCheckRequest,
  DestinationCheckResponse,
} from '../types/api';
import {
  INITIAL_SUMMARY,
  INITIAL_AGENTS,
  INITIAL_ACTIONS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  SIMULATION_SCENARIOS,
  INITIAL_THREAT_DETAILS,
  INITIAL_SOURCES,
  INITIAL_DESTINATIONS,
  INITIAL_HEARTBEATS,
  INITIAL_SECURITY_CONTROLS,
  INITIAL_DLP_FINDINGS,
  INITIAL_EGRESS_BLOCKED,
  INITIAL_SECURITY_SUMMARY,
} from './mock-data';

// Storage keys for demo mode mutations
const STORAGE_AGENTS_KEY = 'agentlock_demo_agents';
const STORAGE_ACTIONS_KEY = 'agentlock_demo_actions';
const STORAGE_APPROVALS_KEY = 'agentlock_demo_approvals';
const STORAGE_AUDIT_KEY = 'agentlock_demo_audit';
const STORAGE_SOURCES_KEY = 'agentlock_demo_sources';
const STORAGE_DESTINATIONS_KEY = 'agentlock_demo_destinations';
const STORAGE_HEARTBEATS_KEY = 'agentlock_demo_heartbeats';
const STORAGE_KILL_SWITCH_KEY = 'agentlock_demo_kill_switch';

class AgentLockApiClient {
  private defaultBaseUrl: string;
  private isOnlineCache: boolean | null = null;
  private lastHealthCheckTime = 0;

  constructor() {
    this.defaultBaseUrl =
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)) ||
      'http://localhost:8000';
  }

  public getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agentlock_api_base_url');
      if (stored) return stored;
    }
    return this.defaultBaseUrl;
  }

  public setBaseUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentlock_api_base_url', url.trim().replace(/\/$/, ''));
      this.isOnlineCache = null;
      this.lastHealthCheckTime = 0;
    }
  }

  private isBackendKnownOffline(): boolean {
    return this.isOnlineCache === false && (Date.now() - this.lastHealthCheckTime < 30000);
  }

  /**
   * Health ping to check if real backend is accessible
   */
  public async checkBackendHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    const baseUrl = this.getBaseUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      // Try dashboard summary or /health
      const res = await fetch(`${baseUrl}/api/v1/dashboard/summary`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        this.isOnlineCache = true;
        this.lastHealthCheckTime = Date.now();
        return { isOnline: true, latencyMs };
      } else {
        this.isOnlineCache = false;
        this.lastHealthCheckTime = Date.now();
        return { isOnline: false, latencyMs, error: `HTTP ${res.status}: ${res.statusText}` };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      this.isOnlineCache = false;
      this.lastHealthCheckTime = Date.now();
      return { isOnline: false, latencyMs, error: err.name === 'AbortError' ? 'Connection timed out (1.2s)' : 'Backend unreachable / CORS error' };
    }
  }

  /**
   * GET /api/v1/dashboard/summary
   */
  public async getDashboardSummary(): Promise<{ data: DashboardSummary; isLive: boolean; error?: string }> {
    const baseUrl = this.getBaseUrl();
    if (!this.isBackendKnownOffline()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/dashboard/summary`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          this.isOnlineCache = true;
          return { data, isLive: true };
        }
      } catch {
        // Fallback
      }
    }

    // Demo Mode calculation
    const actions = this.getStoredActions();
    const agents = this.getStoredAgents();
    const approvals = this.getStoredApprovals();

    const blockedCount = actions.filter((a) => a.status === 'blocked').length;
    const pendingCount = approvals.filter((a) => a.status === 'pending').length;
    const activeAgents = agents.filter((a) => a.status === 'active').length;

    const summary: DashboardSummary = {
      ...INITIAL_SUMMARY,
      total_actions: 13000 + actions.length,
      blocked_threats: 180 + blockedCount,
      pending_approvals: pendingCount,
      active_agents: activeAgents,
      recent_activity: actions.slice(0, 10),
    };

    return { data: summary, isLive: false };
  }

  /**
   * GET /api/v1/agents
   */
  public async getAgents(): Promise<{ data: Agent[]; isLive: boolean; error?: string }> {
    const baseUrl = this.getBaseUrl();
    if (!this.isBackendKnownOffline()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/agents`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch {
        // Fallback
      }
    }
    return { data: this.getStoredAgents(), isLive: false };
  }

  /**
   * Quarantine / update agent status
   */
  public async updateAgentStatus(agentId: string, status: Agent['status']): Promise<{ success: boolean; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        return { success: true, isLive: true };
      }
    } catch {
      // Fallback
    }

    const agents = this.getStoredAgents();
    const updated = agents.map((a) => (a.id === agentId ? { ...a, status } : a));
    this.saveStoredAgents(updated);
    return { success: true, isLive: false };
  }

  /**
   * GET /api/v1/actions
   */
  public async getActions(filters?: {
    agentId?: string;
    status?: string;
    severity?: string;
    search?: string;
  }): Promise<{ data: ActionRecord[]; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    const query = new URLSearchParams();
    if (filters?.agentId && filters.agentId !== 'ALL') query.set('agent_id', filters.agentId);
    if (filters?.status && filters.status !== 'ALL') query.set('status', filters.status);
    if (filters?.severity && filters.severity !== 'ALL') query.set('severity', filters.severity);
    if (filters?.search) query.set('q', filters.search);

    if (!this.isBackendKnownOffline()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/actions?${query.toString()}`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch {
        // Fallback
      }
    }

    let actions = this.getStoredActions();
    if (filters?.agentId && filters.agentId !== 'ALL') {
      actions = actions.filter((a) => a.agent_id === filters.agentId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      actions = actions.filter((a) => a.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'ALL') {
      actions = actions.filter((a) => a.severity === filters.severity);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      actions = actions.filter(
        (a) =>
          a.agent_name.toLowerCase().includes(q) ||
          a.target.toLowerCase().includes(q) ||
          a.payload.toLowerCase().includes(q) ||
          a.explanation.toLowerCase().includes(q)
      );
    }

    return { data: actions, isLive: false };
  }

  /**
   * POST /api/v1/actions/evaluate
   */
  public async evaluateAction(payload: EvaluateActionPayload): Promise<{ data: EvaluateActionResponse; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/actions/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return { data, isLive: true };
      }
    } catch {
      // Fallback
    }

    // Heuristic fallback evaluator
    const text = `${payload.payload} ${payload.target}`.toLowerCase();
    let decision: EvaluateActionResponse['decision'] = 'allowed';
    let risk_score = 15;
    let severity: EvaluateActionResponse['severity'] = 'low';
    let explanation = 'Command validated against baseline security policy. No anomalous tokens detected.';
    let rule_triggered: string | undefined;
    let requires_human_approval = false;

    if (text.includes('curl') && (text.includes('| sh') || text.includes('| bash'))) {
      decision = 'blocked';
      risk_score = 98;
      severity = 'critical';
      rule_triggered = 'SEC-RCE-001: Piped network download execution';
      explanation = 'Dangerous shell pipeline detected. Untrusted remote payload execution blocked.';
    } else if (text.includes('assumerole') || text.includes('superadmin') || text.includes('root')) {
      decision = 'escalated';
      risk_score = 84;
      severity = 'high';
      rule_triggered = 'SEC-IAM-004: Privileged role escalation';
      explanation = 'Target resource requires human supervisor authorization.';
      requires_human_approval = true;
    } else if (text.includes('drop table') || text.includes('truncate') || text.includes('ssn')) {
      decision = 'blocked';
      risk_score = 92;
      severity = 'critical';
      rule_triggered = 'SEC-SQL-003: Destructive DDL / PII access';
      explanation = 'Unauthorized attempt to modify schema or exfiltrate plaintext sensitive records.';
    } else if (text.includes('ignore all previous') || text.includes('system_instruction')) {
      decision = 'blocked';
      risk_score = 95;
      severity = 'critical';
      rule_triggered = 'SEC-LLM-001: Adversarial Prompt Injection jailbreak';
      explanation = 'Prompt contains adversarial delimiters attempting system instruction override.';
    }

    const actionId = `act-${Math.floor(1000 + Math.random() * 9000)}`;

    // Add to recent action log in demo mode
    const newRecord: ActionRecord = {
      id: actionId,
      timestamp: new Date().toISOString(),
      agent_id: payload.agent_id,
      agent_name: this.getAgentName(payload.agent_id),
      action_type: payload.action_type,
      target: payload.target,
      payload: payload.payload,
      status: decision,
      severity,
      risk_score,
      rule_triggered,
      explanation,
    };
    const currentActions = this.getStoredActions();
    this.saveStoredActions([newRecord, ...currentActions]);

    return {
      data: {
        decision,
        risk_score,
        severity,
        explanation,
        rule_triggered,
        requires_human_approval,
        action_id: actionId,
      },
      isLive: false,
    };
  }

  /**
   * GET /api/v1/approvals
   */
  public async getApprovals(): Promise<{ data: ApprovalRequest[]; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    if (!this.isBackendKnownOffline()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/approvals`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch {
        // Fallback
      }
    }
    return { data: this.getStoredApprovals(), isLive: false };
  }

  /**
   * POST /api/v1/approvals/{id}/approve
   */
  public async approveRequest(id: string, note?: string): Promise<{ success: boolean; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note || 'Approved by Operator Vikas' }),
      });
      if (res.ok) {
        return { success: true, isLive: true };
      }
    } catch {
      // Fallback
    }

    const approvals = this.getStoredApprovals();
    const updated = approvals.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'approved' as const,
            reviewer: 'Vikas (SecOps Lead)',
            review_timestamp: new Date().toISOString(),
            notes: note || 'Approved with single-use credential token.',
          }
        : a
    );
    this.saveStoredApprovals(updated);

    // Record in audit log
    this.appendAuditLog(
      `APPROVED: Request ${id} authorized for execution by Vikas (Lead SecOps)`,
      'allowed',
      12
    );

    return { success: true, isLive: false };
  }

  /**
   * POST /api/v1/approvals/{id}/reject
   */
  public async rejectRequest(id: string, reason?: string): Promise<{ success: boolean; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Rejected by Operator Vikas' }),
      });
      if (res.ok) {
        return { success: true, isLive: true };
      }
    } catch {
      // Fallback
    }

    const approvals = this.getStoredApprovals();
    const updated = approvals.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'rejected' as const,
            reviewer: 'Vikas (SecOps Lead)',
            review_timestamp: new Date().toISOString(),
            notes: reason || 'Operation denied due to unverified risk posture.',
          }
        : a
    );
    this.saveStoredApprovals(updated);

    // Record in audit log
    this.appendAuditLog(
      `REJECTED: Request ${id} denied and execution halted by Vikas (Lead SecOps)`,
      'blocked',
      85
    );

    return { success: true, isLive: false };
  }

  /**
   * GET /api/v1/audit
   */
  public async getAuditLogs(): Promise<{ data: AuditLogEntry[]; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    if (!this.isBackendKnownOffline()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/audit`, {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch {
        // Fallback
      }
    }
    return { data: this.getStoredAuditLogs(), isLive: false };
  }

  /**
   * POST /api/v1/simulations/run
   */
  public async runSimulation(scenarioId: string): Promise<{ data: SimulationResult; isLive: boolean }> {
    const baseUrl = this.getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId }),
      });
      if (res.ok) {
        const data = await res.json();
        return { data, isLive: true };
      }
    } catch {
      // Fallback
    }

    const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId) || SIMULATION_SCENARIOS[0];
    const execMs = Math.floor(45 + Math.random() * 80);

    const result: SimulationResult = {
      simulation_id: `sim-run-${Date.now()}`,
      scenario_id: scenario.id,
      scenario_name: scenario.name,
      timestamp: new Date().toISOString(),
      execution_ms: execMs,
      verdict: scenario.expected_verdict,
      risk_score: scenario.expected_verdict === 'blocked' ? 96 : 82,
      rules_triggered: [
        scenario.expected_verdict === 'blocked'
          ? `SEC-DEFENSE-ALERT: Mitre Technique ${scenario.mitre_technique}`
          : 'SEC-IAM-004: Escalated to HITL Security Queue',
      ],
      explanation: `Attack simulation triggered AgentLock security telemetry. Payload parsed: matched high-confidence signature for ${scenario.category}. Defensive rule active; operation ${scenario.expected_verdict.toUpperCase()}.`,
      full_trace: [
        { step: 'Ingress Telemetry Interception', status: 'pass', detail: 'Packet captured at AgentLock gateway hook' },
        { step: 'Lexical Token Analysis', status: 'flagged', detail: `Detected suspicious tokens matching ${scenario.category}` },
        { step: 'Dynamic Policy Engine Evaluation', status: 'blocked', detail: `Rule policy returned strict ${scenario.expected_verdict.toUpperCase()}` },
        { step: 'Audit Ledger Hash Seal', status: 'pass', detail: 'Cryptographic SHA-256 block committed to tamper-proof chain' },
      ],
    };

    // Add to audit trail
    this.appendAuditLog(
      `SIMULATION: Ran scenario "${scenario.name}". Verdict: ${scenario.expected_verdict.toUpperCase()}`,
      scenario.expected_verdict,
      result.risk_score
    );

    return { data: result, isLive: false };
  }

  /**
   * Get Forensic Threat Details by ID
   */
  public async getThreatDetails(id: string): Promise<ThreatDetails | null> {
    if (INITIAL_THREAT_DETAILS[id]) {
      return INITIAL_THREAT_DETAILS[id];
    }
    // Generate forensic record for any action ID
    const actions = this.getStoredActions();
    const action = actions.find((a) => a.id === id);
    if (!action) return null;

    return {
      incident_id: `INC-${action.id.toUpperCase()}`,
      timestamp: action.timestamp,
      agent_id: action.agent_id,
      agent_name: action.agent_name,
      risk_score: action.risk_score,
      severity: action.severity,
      rule_triggered: action.rule_triggered || 'SEC-GENERIC-001: Risk threshold violation',
      detection_vector: action.detection_vector || 'Heuristic Risk Scoring',
      mitre_technique_id: 'T1059 (Command and Scripting Interpreter)',
      explanation: action.explanation,
      raw_prompt: `Automated Agent Trigger for ${action.agent_name}\nTarget: ${action.target}\nPayload: ${action.payload}`,
      payload_preview: action.payload,
      recommended_mitigation: action.status === 'blocked'
        ? 'Maintain active block rule. Inspect agent prompt history and evaluate container isolation.'
        : 'Monitor subsequent actions. Verify target destination integrity.',
      automated_policy_applied: action.status === 'blocked',
      status: action.status,
    };
  }

  // --- Helpers for Demo State Persistence ---
  private getStoredAgents(): Agent[] {
    if (typeof window === 'undefined') return INITIAL_AGENTS;
    const item = localStorage.getItem(STORAGE_AGENTS_KEY);
    return item ? JSON.parse(item) : INITIAL_AGENTS;
  }

  private saveStoredAgents(agents: Agent[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_AGENTS_KEY, JSON.stringify(agents));
    }
  }

  private getStoredActions(): ActionRecord[] {
    if (typeof window === 'undefined') return INITIAL_ACTIONS;
    const item = localStorage.getItem(STORAGE_ACTIONS_KEY);
    return item ? JSON.parse(item) : INITIAL_ACTIONS;
  }

  private saveStoredActions(actions: ActionRecord[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIONS_KEY, JSON.stringify(actions));
    }
  }

  private getStoredApprovals(): ApprovalRequest[] {
    if (typeof window === 'undefined') return INITIAL_APPROVALS;
    const item = localStorage.getItem(STORAGE_APPROVALS_KEY);
    return item ? JSON.parse(item) : INITIAL_APPROVALS;
  }

  private saveStoredApprovals(approvals: ApprovalRequest[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_APPROVALS_KEY, JSON.stringify(approvals));
    }
  }

  private getStoredAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    const item = localStorage.getItem(STORAGE_AUDIT_KEY);
    return item ? JSON.parse(item) : INITIAL_AUDIT_LOGS;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  private appendAuditLog(summary: string, verdict: ActionRecord['status'], risk_score: number): void {
    if (typeof window === 'undefined') return;
    const current = this.getStoredAuditLogs();
    const lastSeq = (current.length > 0 && current[0].sequence_id) ? current[0].sequence_id : 1000;
    const prevHash = (current.length > 0 && current[0].block_hash) ? current[0].block_hash : '00000000000000000000000000000000';
    const fakeHash = '0000' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const entry: AuditLogEntry = {
      sequence_id: lastSeq + 1,
      timestamp: new Date().toISOString(),
      block_hash: fakeHash,
      prev_hash: prevHash,
      agent_id: 'sys-agentlock-core',
      agent_name: 'AgentLock Policy Engine',
      action_summary: summary,
      verdict,
      risk_score,
      signed_by: 'Operator Vikas / KMS Hardware HSM',
      cryptographic_status: 'verified',
      payload_digest: 'sha256:' + fakeHash.slice(0, 32),
    };

    localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify([entry, ...current]));
  }

  // =====================================================
  // PART 2: SOURCE & DESTINATION SECURITY API CLIENT
  // =====================================================

  public async getSecuritySummary(): Promise<{ data: SecuritySummary; isDemo: boolean }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/summary`, {}, 1500);
      if (res.ok) {
        const json = await res.json();
        return { data: json, isDemo: false };
      }
    } catch {}

    const isKillSwitchActive = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KILL_SWITCH_KEY) === 'true'
      : false;

    return {
      data: {
        ...INITIAL_SECURITY_SUMMARY,
        kill_switch_active: isKillSwitchActive,
      },
      isDemo: true,
    };
  }

  public async getSources(): Promise<{ data: Source[]; isDemo: boolean }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/sources`, {}, 1500);
      if (res.ok) {
        const json = await res.json();
        return { data: json, isDemo: false };
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_SOURCES_KEY);
      if (stored) {
        try {
          return { data: JSON.parse(stored), isDemo: true };
        } catch {}
      }
    }
    return { data: INITIAL_SOURCES, isDemo: true };
  }

  public async createSource(newSource: Partial<Source>): Promise<{ data: Source; isDemo: boolean }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource),
      }, 2000);
      if (res.ok) {
        const json = await res.json();
        return { data: json, isDemo: false };
      }
    } catch {}

    const source: Source = {
      id: `src-${Date.now().toString(36)}`,
      name: newSource.name || 'Custom Inbound Channel',
      type: newSource.type || 'user_prompt',
      trust_level: newSource.trust_level || 'untrusted',
      allowlist: newSource.allowlist || ['*'],
      scanned: true,
      pii_masked: true,
      total_ingested: 0,
      blocked_attempts: 0,
      description: newSource.description || 'Configured via Operator Security Dashboard.',
    };

    if (typeof window !== 'undefined') {
      const existing = (await this.getSources()).data;
      localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify([source, ...existing]));
      this.appendAuditLog(`Registered new input source: ${source.name} [${source.trust_level.toUpperCase()}]`, 'allowed', 10
      );
    }
    return { data: source, isDemo: true };
  }

  public async getDestinations(): Promise<{ data: Destination[]; isDemo: boolean }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/destinations`, {}, 1500);
      if (res.ok) {
        const json = await res.json();
        return { data: json, isDemo: false };
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_DESTINATIONS_KEY);
      if (stored) {
        try {
          return { data: JSON.parse(stored), isDemo: true };
        } catch {}
      }
    }
    return { data: INITIAL_DESTINATIONS, isDemo: true };
  }

  public async createDestination(newDest: Partial<Destination>): Promise<{ data: Destination; isDemo: boolean }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDest),
      }, 2000);
      if (res.ok) {
        const json = await res.json();
        return { data: json, isDemo: false };
      }
    } catch {}

    const dest: Destination = {
      id: `dest-${Date.now().toString(36)}`,
      host_or_cidr: newDest.host_or_cidr || '10.0.0.0/8',
      scope: newDest.scope || 'external_api',
      risk: newDest.risk || 'low',
      allowed_agents: newDest.allowed_agents || ['*'],
      status: newDest.status || 'allowed',
      requires_tls: newDest.requires_tls ?? true,
      rate_limit_rpm: newDest.rate_limit_rpm || 100,
      description: newDest.description || 'Configured via Operator Security Dashboard.',
    };

    if (typeof window !== 'undefined') {
      const existing = (await this.getDestinations()).data;
      localStorage.setItem(STORAGE_DESTINATIONS_KEY, JSON.stringify([dest, ...existing]));
      this.appendAuditLog(`Configured egress destination allowlist: ${dest.host_or_cidr} (${dest.scope})`, 'allowed', 15
      );
    }
    return { data: dest, isDemo: true };
  }

  public async checkDestination(req: DestinationCheckRequest): Promise<DestinationCheckResponse> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/destinations/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }, 2000);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Deterministic client-side evaluation
    const urlLower = req.url.toLowerCase();
    const isSsrf =
      urlLower.includes('169.254.169.254') ||
      urlLower.includes('127.0.0.1') ||
      urlLower.includes('localhost') ||
      urlLower.includes('::1') ||
      urlLower.includes('10.') ||
      urlLower.includes('192.168.');

    let resolvedIp = '104.21.34.120';
    if (urlLower.includes('169.254.169.254')) resolvedIp = '169.254.169.254';
    else if (urlLower.includes('127.0.0.1') || urlLower.includes('localhost')) resolvedIp = '127.0.0.1';

    const findings: string[] = [];
    if (isSsrf) {
      findings.push('CRITICAL: Target resolves to protected loopback / cloud metadata range');
    }

    const destinations = (await this.getDestinations()).data;
    const isAllowlisted = destinations.some(
      (d) => d.status === 'allowed' && urlLower.includes(d.host_or_cidr.toLowerCase())
    );

    if (!isAllowlisted && !isSsrf) {
      findings.push('WARNING: Target is not in the active default-deny egress allowlist');
    }

    let dlpStatus: 'clean' | 'redacted' | 'violation' = 'clean';
    if (req.payload_sample) {
      if (/AKIA[0-9A-Z]{16}/.test(req.payload_sample) || /BEGIN RSA PRIVATE KEY/.test(req.payload_sample)) {
        dlpStatus = 'violation';
        findings.push('DLP VIOLATION: Unencrypted cryptographic secret detected in outbound buffer');
      } else if (/\b\d{3}-\d{2}-\d{4}\b/.test(req.payload_sample)) {
        dlpStatus = 'redacted';
        findings.push('DLP NOTICE: PII pattern (SSN) detected - redacted before transmission');
      }
    }

    const verdict = isSsrf || dlpStatus === 'violation'
      ? 'BLOCK'
      : isAllowlisted
      ? 'ALLOW'
      : 'ESCALATE';

    return {
      allowed: verdict === 'ALLOW',
      verdict,
      resolved_ip: resolvedIp,
      is_ssrf_risk: isSsrf,
      is_allowlisted: isAllowlisted,
      dlp_status: dlpStatus,
      findings,
    };
  }

  public async getSecurityControls(): Promise<SecurityControl[]> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/controls`, {}, 1500);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return INITIAL_SECURITY_CONTROLS;
  }

  public async triggerKillSwitch(token?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/kill-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || 'SEC-KILL-EXEC' }),
      }, 2000);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KILL_SWITCH_KEY, 'true');
      this.appendAuditLog('EMERGENCY FLEET KILL SWITCH TRIGGERED: All active agent leases invalidated and quarantined.', 'blocked', 99
      );
    }
    return {
      success: true,
      message: 'Emergency kill switch activated. All 6 agents isolated and runtime egress severed.',
    };
  }

  public async getOfflineAgents(): Promise<Heartbeat[]> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/offline`, {}, 1500);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_HEARTBEATS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return INITIAL_HEARTBEATS;
  }

  public async reattestAgent(agentId: string): Promise<{ success: boolean; message: string; heartbeat: Heartbeat }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/agents/${agentId}/reattest`, {
        method: 'POST',
      }, 2000);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const heartbeats = (await this.getOfflineAgents());
    const updated = heartbeats.map((hb) => {
      if (hb.agent_id === agentId) {
        return {
          ...hb,
          status: 'online' as const,
          missed_beats: 0,
          seconds_since_last_beat: 0,
          seconds_until_revocation: 900,
          timestamp: new Date().toISOString(),
        };
      }
      return hb;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HEARTBEATS_KEY, JSON.stringify(updated));
      this.appendAuditLog(`Cryptographic Re-attestation verified for agent: ${agentId}. Fresh 15-minute lease issued.`, 'allowed', 5
      );
    }

    const reattested = updated.find((h) => h.agent_id === agentId) || updated[0];
    return {
      success: true,
      message: `Agent ${agentId} re-attested successfully with fresh SHA-256 workload token.`,
      heartbeat: reattested,
    };
  }

  public async revokeAgent(agentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/agents/${agentId}/revoke`, {
        method: 'POST',
      }, 2000);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const heartbeats = (await this.getOfflineAgents());
    const updated = heartbeats.map((hb) => {
      if (hb.agent_id === agentId) {
        return {
          ...hb,
          status: 'quarantined' as const,
          seconds_until_revocation: 0,
        };
      }
      return hb;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HEARTBEATS_KEY, JSON.stringify(updated));
      this.appendAuditLog(`Manual lease revocation invoked for agent: ${agentId}. Egress access severed.`, 'blocked', 85
      );
    }

    return {
      success: true,
      message: `Credentials for agent ${agentId} revoked immediately.`,
    };
  }

  public async getDlpFindings(): Promise<DlpFinding[]> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/dlp/findings`, {}, 1500);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return INITIAL_DLP_FINDINGS;
  }

  public async getEgressBlocked(): Promise<EgressBlockedEvent[]> {
    try {
      const res = await this.fetchWithTimeout(`${this.getBaseUrl()}/api/security/egress/blocked`, {}, 1500);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return INITIAL_EGRESS_BLOCKED;
  }

  private getAgentName(id: string): string {
    const agent = INITIAL_AGENTS.find((a) => a.id === id);
    return agent ? agent.name : 'Unknown-Agent';
  }
}

export const apiClient = new AgentLockApiClient();
