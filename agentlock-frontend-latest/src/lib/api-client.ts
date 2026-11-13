import {
  Agent,
  RegisterAgentPayload,
  Scan,
  CreateScanPayload,
  Finding,
  DashboardStats,
  User,
  LoginPayload,
  AuthResponse,
} from '../types/api';

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

/**
 * Isolated Mock Mode toggle.
 * Strictly disabled in production builds to prevent shipping test mocks.
 */
export const isMockMode =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 15000; // 15 seconds stale-while-revalidate TTL

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
 * Lightweight native fetch wrapper replacing axios.
 * Saves bundle weight, supports abort timeout, and proxies via /api.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 12000, ...customConfig } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: 'include',
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
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `API error ${response.status} (${response.statusText}): ${errorText.slice(0, 160)}`
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timer);
    throw error;
  }
}

export const api = {
  // Agents
  async getAgents(): Promise<Agent[]> {
    if (isMockMode) {
      const { MOCK_AGENTS } = await import('../mocks');
      return MOCK_AGENTS;
    }
    const cached = getCached<Agent[]>('agents');
    if (cached) return cached;

    try {
      const data = await request<Agent[]>('/agents');
      const list = Array.isArray(data) ? data : [];
      setCache('agents', list);
      return list;
    } catch {
      return [];
    }
  },

  async registerAgent(payload: RegisterAgentPayload): Promise<Agent> {
    if (isMockMode) {
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: payload.name,
        target_url: payload.target_url,
        description: payload.description,
        status: 'active',
        created_at: new Date().toISOString(),
      };
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

  // Scans
  async getScans(): Promise<Scan[]> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      return MOCK_SCANS;
    }
    const cached = getCached<Scan[]>('scans');
    if (cached) return cached;

    try {
      const data = await request<Scan[]>('/scans');
      const list = Array.isArray(data) ? data : [];
      setCache('scans', list);
      return list;
    } catch {
      return [];
    }
  },

  async startScan(payload: CreateScanPayload): Promise<Scan> {
    if (isMockMode) {
      const newScan: Scan = {
        id: `scan-${Date.now().toString().slice(-6)}`,
        agent_id: payload.agent_id,
        status: 'running',
        categories: payload.categories,
        progress: 10,
        status_message: 'Initializing controlled sandbox test vectors.',
        started_at: new Date().toISOString(),
      };
      return newScan;
    }

    const res = await request<Scan>('/scans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    invalidateApiCache('scans');
    invalidateApiCache('stats');
    return res;
  },

  async getScan(scanId: string): Promise<Scan> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      const found = MOCK_SCANS.find((s) => s.id === scanId);
      if (found) return found;
      return {
        id: scanId,
        agent_id: 'agent-001',
        status: 'completed',
        categories: ['prompt_injection', 'data_leakage'],
        progress: 100,
        status_message: 'Scan complete.',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        vulnerabilities_found: 2,
      };
    }

    return await request<Scan>(`/scans/${encodeURIComponent(scanId)}`);
  },

  async getScanResults(scanId: string): Promise<Finding[]> {
    if (isMockMode) {
      const { MOCK_FINDINGS } = await import('../mocks');
      return MOCK_FINDINGS.filter((f) => f.scan_id === scanId || true);
    }

    const cacheKey = `findings-${scanId}`;
    const cached = getCached<Finding[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await request<Finding[]>(
        `/scans/${encodeURIComponent(scanId)}/results`
      );
      const list = Array.isArray(data) ? data : [];
      setCache(cacheKey, list);
      return list;
    } catch {
      return [];
    }
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (isMockMode) {
      const { MOCK_DASHBOARD_STATS } = await import('../mocks');
      return MOCK_DASHBOARD_STATS;
    }

    const cached = getCached<DashboardStats>('stats');
    if (cached) return cached;

    try {
      const data = await request<DashboardStats>('/dashboard/stats');
      setCache('stats', data);
      return data;
    } catch {
      return {
        total_scans: 0,
        registered_agents: 0,
        confirmed_vulnerabilities: 0,
        critical_findings: 0,
        severity_breakdown: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        category_breakdown: {
          prompt_injection: 0,
          data_leakage: 0,
          tool_abuse: 0,
          memory_poisoning: 0,
        },
      };
    }
  },

  // PDF Download
  async downloadReportPdf(reportId: string): Promise<Blob> {
    if (isMockMode) {
      const dummyPdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`;
      return new Blob([dummyPdfContent], { type: 'application/pdf' });
    }

    const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/pdf`, {
      headers: {
        Accept: 'application/pdf',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download report PDF: status ${res.status}`);
    }

    return await res.blob();
  },

  // Health / Connection Check
  async checkConnection(): Promise<{ ok: boolean; latencyMs: number }> {
    if (isMockMode) {
      return { ok: true, latencyMs: 12 };
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('/api/dashboard/stats', {
        signal: controller.signal,
      });
      clearTimeout(timer);
      const latencyMs = Math.round(performance.now() - start);
      return { ok: res.ok, latencyMs };
    } catch {
      return { ok: false, latencyMs: 0 };
    }
  },

  // Authentication
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      clearTimeout(timer);

      if (response.status === 200) {
        const data = await response.json();
        return data as AuthResponse;
      }

      if (response.status === 401) {
        throw new AuthError('Invalid email or password.', 401);
      }

      if (response.status === 429) {
        const retryHeader = response.headers.get('Retry-After');
        let retrySeconds = 60;
        if (retryHeader) {
          const parsed = parseInt(retryHeader, 10);
          if (!isNaN(parsed) && parsed > 0) {
            retrySeconds = parsed;
          }
        }
        throw new AuthError(
          `Too many attempts. Please try again in ${retrySeconds} seconds.`,
          429,
          retrySeconds
        );
      }

      if (response.status >= 500) {
        throw new AuthError(
          'Authentication service is currently unavailable. Please try again shortly.',
          response.status
        );
      }

      const errText = await response.text().catch(() => '');
      throw new AuthError(
        errText ? `Login failed: ${errText.slice(0, 100)}` : 'Invalid email or password.',
        response.status
      );
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof AuthError) {
        throw err;
      }
      throw new AuthError(
        'Unable to connect to authentication service. Check your connection and try again.',
        0
      );
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } catch {
      // Graceful logout even if backend is offline
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return (data?.user || data) as User;
    } catch {
      return null;
    }
  },
};
