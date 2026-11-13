import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timed out. Check your connection and try again.';
    } else if (!error.response) {
      error.userMessage = 'Cannot reach the server. Make sure the backend is running.';
    } else {
      const status = error.response.status;
      if (status === 404) {
        error.userMessage = 'Resource not found.';
      } else if (status === 422) {
        error.userMessage = error.response.data?.detail || 'Invalid input.';
      } else if (status >= 500) {
        error.userMessage = 'Server error. Try again later.';
      }
    }
    return Promise.reject(error);
  }
);

// ── Agent endpoints ──
export const agentApi = {
  list: () => api.get('/api/agents'),
  get: (id) => api.get(`/api/agents/${id}`),
  create: (data) => api.post('/api/agents', data),
};

// ── Scan endpoints ──
export const scanApi = {
  create: (data) => api.post('/api/scans', data),
  get: (id) => api.get(`/api/scans/${id}`),
  getResults: (id) => api.get(`/api/scans/${id}/results`),
};

// ── Dashboard endpoints ──
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// ── Report endpoints ──
export const reportApi = {
  downloadPdf: (id) =>
    api.get(`/api/reports/${id}/pdf`, {
      responseType: 'blob',
      timeout: 30000,
    }),
};

export default api;
