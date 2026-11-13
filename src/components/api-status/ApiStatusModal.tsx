'use client';

import React, { useState } from 'react';
import { Server, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { api } from '../../lib/api-client';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  latencyMs: number;
  onRefresh?: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  latencyMs,
  onRefresh,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [localConnected, setLocalConnected] = useState(isConnected);
  const [localLatency, setLocalLatency] = useState(latencyMs);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      const res = await api.checkConnection();
      setLocalConnected(res.ok);
      setLocalLatency(res.latencyMs);
      onRefresh?.();
    } finally {
      setIsChecking(false);
    }
  };

  const endpoints = [
    { method: 'GET', path: '/api/dashboard/stats', desc: 'Summary metrics & health check' },
    { method: 'GET', path: '/api/agents', desc: 'Registered agent inventory' },
    { method: 'POST', path: '/api/agents', desc: 'Register target agent endpoint' },
    { method: 'POST', path: '/api/scans', desc: 'Initiate red teaming evaluation scan' },
    { method: 'GET', path: '/api/scans/{id}', desc: 'Real-time scan progress polling' },
    { method: 'GET', path: '/api/scans/{id}/results', desc: 'Vulnerability findings & evidence' },
    { method: 'GET', path: '/api/reports/{id}/pdf', desc: 'Download cryptographic PDF report' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#030714]/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[8px_8px_24px_#030714] overflow-hidden space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#FF6F59]" />
            <h3 className="text-sm font-bold font-sans text-[#F5EDDC]">
              Backend Connection Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#C8C0AC] hover:text-[#F5EDDC] hover:bg-[#12234A]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="p-4 rounded-xl bg-[#060D1F] border border-[#12234A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {localConnected ? (
              <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#E11D48]/15 border border-[#E11D48]/40 text-[#E11D48] flex items-center justify-center">
                <WifiOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-mono font-bold text-[#F5EDDC]">
                {localConnected ? 'FASTAPI BACKEND ONLINE' : 'DISCONNECTED / STANDALONE'}
              </div>
              <div className="text-[11px] font-mono text-[#C8C0AC]/70">
                {localConnected ? `Round-trip latency: ${localLatency}ms` : 'Target: http://localhost:8000'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isChecking}
            className="px-3 py-1.5 rounded-lg bg-[#0A1633] border border-[#12234A] text-xs font-mono text-[#F5EDDC] hover:border-[#FF6F59] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Test</span>
          </button>
        </div>

        {/* Endpoints Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#C8C0AC] uppercase tracking-wider">
            Active Endpoint Proxy Mapping
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-[#12234A] bg-[#060D1F] divide-y divide-[#12234A]/50">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-xs font-mono gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'GET' ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#FF6F59]/15 text-[#FF6F59]'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-[#F5EDDC]">{ep.path}</span>
                </div>
                <span className="text-[10px] text-[#C8C0AC]/60 truncate max-w-[180px]">
                  {ep.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-[11px] font-mono text-[#C8C0AC]/60 text-center">
          Proxied securely via Next.js server rewrite to avoid cross-origin restrictions.
        </div>
      </div>
    </div>
  );
};
