import axios, { AxiosInstance } from 'axios';
import {
  Agent,
  RegisterAgentPayload,
  Scan,
  CreateScanPayload,
  Finding,
  DashboardStats,
} from '../types/api';

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
    const res = await apiClient.get<Agent[]>('/agents');
    return Array.isArray(res.data) ? res.data : [];
  },

  async registerAgent(payload: RegisterAgentPayload): Promise<Agent> {
    const res = await apiClient.post<Agent>('/agents', payload);
    return res.data;
  },

  // Scans
  async getScans(): Promise<Scan[]> {
    const res = await apiClient.get<Scan[]>('/scans');
    return Array.isArray(res.data) ? res.data : [];
  },

  async startScan(payload: CreateScanPayload): Promise<Scan> {
    const res = await apiClient.post<Scan>('/scans', payload);
    return res.data;
  },

  async getScan(scanId: string): Promise<Scan> {
    const res = await apiClient.get<Scan>(`/scans/${encodeURIComponent(scanId)}`);
    return res.data;
  },

  async getScanResults(scanId: string): Promise<Finding[]> {
    const res = await apiClient.get<Finding[]>(
      `/scans/${encodeURIComponent(scanId)}/results`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  // PDF Download
  async downloadReportPdf(reportId: string): Promise<Blob> {
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
