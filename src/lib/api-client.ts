import axios, { AxiosInstance } from 'axios';
import {
  Agent,
  RegisterAgentPayload,
  Scan,
  CreateScanPayload,
  Finding,
  DashboardStats,
} from '../types/api';

export const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

/**
 * Central Axios instance pointing to relative /api routes
 * Proxied via next.config.mjs to ${BACKEND_URL}/api (default http://localhost:8000)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const api = {
  // Agents
  async getAgents(): Promise<Agent[]> {
    if (isMockMode) {
      const { MOCK_AGENTS } = await import('../mocks');
      return MOCK_AGENTS;
    }
    const res = await apiClient.get<Agent[]>('/agents');
    return Array.isArray(res.data) ? res.data : [];
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
    const res = await apiClient.post<Agent>('/agents', payload);
    return res.data;
  },

  // Scans
  async getScans(): Promise<Scan[]> {
    if (isMockMode) {
      const { MOCK_SCANS } = await import('../mocks');
      return MOCK_SCANS;
    }
    const res = await apiClient.get<Scan[]>('/scans');
    return Array.isArray(res.data) ? res.data : [];
  },

  async startScan(payload: CreateScanPayload): Promise<Scan> {
    if (isMockMode) {
      const newScan: Scan = {
        id: `scan-${Date.now().toString().slice(-6)}`,
        agent_id: payload.agent_id,
        status: 'running',
        categories: payload.categories,
        progress: 10,
        status_message: 'Initializing controlled sandbox test vectors...',
        started_at: new Date().toISOString(),
      };
      return newScan;
    }
    const res = await apiClient.post<Scan>('/scans', payload);
    return res.data;
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
    const res = await apiClient.get<Scan>(`/scans/${encodeURIComponent(scanId)}`);
    return res.data;
  },

  async getScanResults(scanId: string): Promise<Finding[]> {
    if (isMockMode) {
      const { MOCK_FINDINGS } = await import('../mocks');
      return MOCK_FINDINGS.filter((f) => f.scan_id === scanId || true);
    }
    const res = await apiClient.get<Finding[]>(
      `/scans/${encodeURIComponent(scanId)}/results`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (isMockMode) {
      const { MOCK_DASHBOARD_STATS } = await import('../mocks');
      return MOCK_DASHBOARD_STATS;
    }
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  // PDF Download
  async downloadReportPdf(reportId: string): Promise<Blob> {
    if (isMockMode) {
      // Generate a minimal valid dummy PDF blob
      const dummyPdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`;
      return new Blob([dummyPdfContent], { type: 'application/pdf' });
    }
    const res = await apiClient.get(
      `/reports/${encodeURIComponent(reportId)}/pdf`,
      {
        responseType: 'blob',
      }
    );
    return res.data;
  },

  // Health / Connection Check
  async checkConnection(): Promise<{ ok: boolean; latencyMs: number }> {
    if (isMockMode) {
      return { ok: true, latencyMs: 12 };
    }
    const start = performance.now();
    try {
      await apiClient.get('/dashboard/stats', { timeout: 4000 });
      const latencyMs = Math.round(performance.now() - start);
      return { ok: true, latencyMs };
    } catch {
      return { ok: false, latencyMs: 0 };
    }
  },
};
