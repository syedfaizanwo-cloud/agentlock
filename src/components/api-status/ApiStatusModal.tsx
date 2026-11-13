'use client';

import React, { useState } from 'react';
import { ApiStatusState } from '../../types/api';
import {
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  Save,
  Key,
} from 'lucide-react';
import { PasswordToggle, usePasswordVisibility } from '../ui/PasswordToggle';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatusState;
  onSaveBaseUrl: (newUrl: string) => Promise<void>;
  onTestConnection: () => Promise<void>;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onSaveBaseUrl,
  onTestConnection,
}) => {
  const [urlInput, setUrlInput] = useState(apiStatus.baseUrl);
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const passwordVisibility = usePasswordVisibility(20000);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTestConnection();
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    await onSaveBaseUrl(urlInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    handleTest();
  };

  const endpoints = [
    { method: 'GET', path: '/api/v1/dashboard/summary', desc: 'Aggregated KPI metrics & timeline telemetry' },
    { method: 'GET', path: '/api/v1/agents', desc: 'Active registered agent fleet' },
    { method: 'GET', path: '/api/v1/actions', desc: 'Real-time telemetry event stream' },
    { method: 'POST', path: '/api/v1/actions/evaluate', desc: 'Interception gateway policy evaluation' },
    { method: 'GET', path: '/api/v1/approvals', desc: 'Pending human-in-the-loop authorization queue' },
    { method: 'POST', path: '/api/v1/approvals/{id}/approve', desc: 'Sign-off and issue single-use token' },
    { method: 'POST', path: '/api/v1/approvals/{id}/reject', desc: 'Halt execution and log rejection' },
    { method: 'GET', path: '/api/v1/audit', desc: 'Cryptographically sealed SHA-256 ledger' },
    { method: 'POST', path: '/api/v1/simulations/run', desc: 'Adversarial attack scenario execution' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-white">
                API Connection & Gateway State
              </h3>
              <p className="text-xs text-[#8A8A8A]">
                Backend endpoint configuration and connectivity status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A8A8A] hover:text-white text-lg font-mono"
          >
            &times;
          </button>
        </div>

        {/* Current State Card */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 font-mono text-xs ${
            apiStatus.isConnected
              ? 'bg-[#6FAF8A]/10 border-[#6FAF8A]/40 text-[#6FAF8A]'
              : 'bg-[#151515] border-[#B89B72]/40 text-[#E6CBA8]'
          }`}
        >
          <div className="flex items-center gap-3">
            {apiStatus.isConnected ? (
              <Wifi className="w-5 h-5 text-[#6FAF8A]" />
            ) : (
              <WifiOff className="w-5 h-5 text-[#E6CBA8]" />
            )}
            <div>
              <div className="font-bold">
                {apiStatus.isConnected ? 'CONNECTED TO LIVE BACKEND' : 'OFFLINE / DEMO MODE ACTIVE'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5 text-[#BDBDBD]">
                {apiStatus.isConnected
                  ? `Response latency: ${apiStatus.latencyMs}ms | Base URL: ${apiStatus.baseUrl}`
                  : `Backend unreachable at ${apiStatus.baseUrl}. Safe mock telemetry loaded.`}
              </div>
            </div>
          </div>

          <button
            disabled={testing}
            onClick={handleTest}
            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-white hover:border-[#E6CBA8] transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Pinging...' : 'Ping Test'}
          </button>
        </div>

        {/* Base URL Configuration */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#BDBDBD] uppercase block">
            Backend API Base URL (NEXT_PUBLIC_API_BASE_URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 p-2.5 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-white focus:outline-none focus:border-[#E6CBA8]"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(230,203,168,0.2)]"
            >
              <Save className="w-3.5 h-3.5" />
              {savedSuccess ? 'Saved!' : 'Save & Connect'}
            </button>
          </div>
          <p className="text-[11px] text-[#8A8A8A] font-mono">
            Default: <code className="text-[#BDBDBD]">http://localhost:8000</code>. Point this to your FastAPI, Flask, or Node backend gateway.
          </p>
        </div>

        {/* Admin API Key with PasswordToggle & Auto-Hide */}
        <div className="space-y-2">
          <label
            htmlFor="admin-api-key"
            className="text-xs font-mono text-[#BDBDBD] uppercase block flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Admin Gateway Bearer Token / API Key
            </span>
            <span className="text-[10px] text-[#8A8A8A] normal-case">
              Auto-hides on blur or after 20s
            </span>
          </label>
          <div className="relative flex items-center">
            <input
              id="admin-api-key"
              type={passwordVisibility.inputType}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={passwordVisibility.onBlur}
              autoComplete="off"
              placeholder="e.g. sec_live_bearer_984f1a2..."
              className="w-full p-2.5 pr-10 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-white placeholder-[#5C5C5C] focus:outline-none focus:border-[#E6CBA8]"
            />
            <div className="absolute right-2">
              <PasswordToggle
                isVisible={passwordVisibility.isVisible}
                onToggle={passwordVisibility.toggle}
                label={passwordVisibility.isVisible ? 'Hide API key' : 'Show API key'}
              />
            </div>
          </div>
        </div>

        {/* Agreed API Contract Endpoints */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] uppercase">
            <span>Agreed Backend API Contract:</span>
            <span className="text-[10px] text-[#E6CBA8]">9 Standardized Endpoints</span>
          </div>
          <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] space-y-1.5 font-mono text-xs max-h-56 overflow-y-auto">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded hover:bg-[#1E1E1E]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'GET'
                        ? 'bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]'
                        : 'bg-[#1E1E1E] text-white border border-[#3D3D3D]'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-white text-[11px]">{ep.path}</span>
                </div>
                <span className="text-[10px] text-[#8A8A8A] truncate max-w-[200px]">
                  {ep.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Startup Instructions */}
        <div className="p-3.5 rounded-xl bg-[#050505] border border-[#2A2A2A] space-y-1.5 font-mono text-xs text-[#8A8A8A]">
          <div className="text-white font-bold flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[#E6CBA8]" />
            Backend Launch Command (FastAPI/Python):
          </div>
          <div className="text-white bg-[#151515] p-2 rounded border border-[#2A2A2A]">
            uvicorn main:app --host 0.0.0.0 --port 8000 --reload
          </div>
          <p className="text-[11px] text-[#8A8A8A]">
            Ensure CORS allows origin <code className="text-[#BDBDBD]">http://localhost:3000</code>.
          </p>
        </div>

        <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] text-xs font-mono hover:text-white hover:border-[#E6CBA8]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
