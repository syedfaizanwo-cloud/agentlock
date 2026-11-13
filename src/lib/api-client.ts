import {
  Agent,
  RegisterAgentPayload,
  Scan,
  CreateScanPayload,
  AttackResult,
  DashboardStats,
  AgentComparisonResponse,
  Report,
  Finding,
  adaptAttackResultToFinding,
  User,
  LoginPayload,
} from '../types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retain AuthError for backwards compatibility with any remaining auth views
export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryAfterSeconds?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const isMockMode =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10000; // 10 seconds TTL

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  Array.from(memoryCache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  });
}

/**
 * Centralized fetch wrapper proxying requests via Next.js /api rewrite.
 * Preserves status codes, parses FastAPI error details, and supports timeouts.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 25000, ...customConfig } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const cleanPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `/api/${cleanPath}`;

  try {
    const response = await fetch(url, {
      ...customConfig,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...customConfig.headers,
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      let detail = '';
      try {
        const errorJson = await response.json();
        detail = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        detail = await response.text().catch(() => '');
      }
      throw new ApiError(
        detail || `API request failed with status ${response.status}`,
        response.status,
        detail
      );
    }

    // Handle empty 204 or empty response
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    if ((err as any)?.name === 'AbortError') {
      throw new ApiError('Request timed out while contacting backend server', 408);
    }
    throw new ApiError(
      (err as Error)?.message || 'Network error occurred while contacting backend',
      500
    );
  }
}

export const api = {
  // System Health
  async checkConnection(): Promise<{ ok: boolean; latencyMs: number; service?: string; version?: string }> {
    const start = performance.now();
    try {
      const data = await request<{ status: string; service?: string; version?: string }>('/health', {
        timeoutMs: 4000,
      });
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: data?.status === 'ok',
        latencyMs,
        service: data?.service,
        version: data?.version,
      };
    } catch {
      return { ok: false, latencyMs: 0 };
    }
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    if (isMockMode) {
      const { MOCK_AGENTS } = await import('../mocks');
      return MOCK_AGENTS;
    }
    const cached = getCached<Agent[]>('agents');
    if (cached) return cached;

    const data = await request<Agent[]>('/agents');
    setCache('agents', data);
    return data;
  },

  async getAgent(agentId: number): Promise<Agent> {
    if (isMockMode) {
      const { MOCK_AGENTS } = await import('../mocks');
      const found = MOCK_AGENTS.find((a) => a.id === agentId);
      if (found) return found;
      throw new ApiError(`Agent ${agentId} not found`, 404);
    }
    return await request<Agent>(`/agents/${agentId}`);
  },

  async registerAgent(payload: RegisterAgentPayload): Promise<Agent> {
    if (isMockMode) {
      const { MOCK_AGENTS } = await import('../mocks');
      const newAgent: Agent = {
        id: Date.now(),
        name: payload.name,
        description: payload.description || null,
        agent_type: payload.agent_type,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_AGENTS.push(newAgent);
      return newAgent;
    }

    const res = await request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    invalidateApiCache('agents');
    invalidateApiCache('stats');
    return res;
  },

  async deleteAgent(agentId: number): Promise<void> {
    await request<void>(`/agents/${agentId}`, {
      method: 'DELETE',
    });
    invalidateApiCache('agents');
    invalidateApiCache('stats');
  },

  // Scans (Synchronous Execution)
  async getScans(): Promise<Scan[]> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      return MOCK_SCANS;
    }
    const cached = getCached<Scan[]>('scans');
    if (cached) return cached;

    const data = await request<Scan[]>('/scans');
    setCache('scans', data);
    return data;
  },

  async getScan(scanId: number): Promise<Scan> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      const found = MOCK_SCANS.find((s) => s.id === scanId);
      if (found) return found;
      throw new ApiError(`Scan ${scanId} not found`, 404);
    }
    return await request<Scan>(`/scans/${scanId}`);
  },

  async startScan(payload: CreateScanPayload): Promise<Scan> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      const newScan: Scan = {
        id: Date.now(),
        agent_id: payload.agent_id,
        status: 'completed',
        attack_categories: payload.attack_categories,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      MOCK_SCANS.unshift(newScan);
      return newScan;
    }

    // Backend executes synchronously and returns completed scan
    const res = await request<Scan>('/scans', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 60000, // Allow up to 60s for 8-attack test execution
    });

    invalidateApiCache('scans');
    invalidateApiCache('stats');
    invalidateApiCache('comparison');
    return res;
  },

  async getScanResults(scanId: number): Promise<AttackResult[]> {
    if (isMockMode) {
      const { MOCK_RESULTS } = await import('../mocks');
      return MOCK_RESULTS.filter((r) => r.scan_id === scanId);
    }

    const cacheKey = `results-${scanId}`;
    const cached = getCached<AttackResult[]>(cacheKey);
    if (cached) return cached;

    const data = await request<AttackResult[]>(`/scans/${scanId}/results`);
    setCache(cacheKey, data);
    return data;
  },

  // Helper to get adapted findings for UI components
  async getScanFindings(scanId: number): Promise<Finding[]> {
    const results = await this.getScanResults(scanId);
    return results.map(adaptAttackResultToFinding);
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (isMockMode) {
      const { MOCK_DASHBOARD_STATS } = await import('../mocks');
      return MOCK_DASHBOARD_STATS;
    }

    const cached = getCached<DashboardStats>('stats');
    if (cached) return cached;

    const data = await request<DashboardStats>('/dashboard/stats');
    setCache('stats', data);
    return data;
  },

  // Two-Agent Comparison
  async getAgentComparison(params?: {
    vulnerable_scan_id?: number;
    protected_scan_id?: number;
  }): Promise<AgentComparisonResponse> {
    const query = new URLSearchParams();
    if (params?.vulnerable_scan_id) {
      query.set('vulnerable_scan_id', params.vulnerable_scan_id.toString());
    }
    if (params?.protected_scan_id) {
      query.set('protected_scan_id', params.protected_scan_id.toString());
    }
    const qStr = query.toString();
    const endpoint = qStr ? `/dashboard/comparison?${qStr}` : '/dashboard/comparison';
    return await request<AgentComparisonResponse>(endpoint);
  },

  // Reports
  async generateReport(scanId: number): Promise<Report> {
    const res = await request<Report>(`/scans/${scanId}/report`, {
      method: 'POST',
    });
    return res;
  },

  async downloadReportPdf(reportId: number): Promise<Blob> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new ApiError(`Failed to download report PDF (status ${response.status})`, response.status);
      }

      return await response.blob();
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof ApiError) throw err;
      throw new ApiError((err as Error)?.message || 'Failed to download report PDF', 500);
    }
  },

  // Auth Stubs (Public demo access: no auth barriers, typed contracts preserved)
  async login(payload: { email: string; password?: string; remember?: boolean }): Promise<{ user: User; token?: string }> {
    return {
      user: {
        id: 'demo-user-1',
        email: payload.email,
        name: payload.email.split('@')[0] || 'Security Evaluator',
        role: 'operator',
      },
      token: 'demo-session-token',
    };
  },

  async logout(): Promise<void> {
    // No-op for public demo
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<User | null> {
    // Public demo operator
    return {
      id: 'demo-user-1',
      email: 'evaluator@agentlock.dev',
      name: 'Security Evaluator',
      role: 'operator',
    };
  },
};
