import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScanLine, Check, X, Clock, Loader2 } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ErrorState from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { scanApi } from '@/services/api';
import { MOCKS_ENABLED, mockScanProgress } from '@/mocks/data';

const CATEGORY_LABELS = {
  prompt_injection: 'Prompt Injection',
  data_leakage: 'Data Leakage',
  tool_abuse: 'Tool Abuse',
  memory_poisoning: 'Memory Poisoning',
  jailbreak: 'Jailbreak',
  data_exfiltration: 'Data Exfiltration',
  api_manipulation: 'API Manipulation',
};

const STATUS_ICONS = {
  completed: Check,
  running: Loader2,
  failed: X,
  pending: Clock,
};

export default function ScanProgress() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef(null);
  const [mockProgress, setMockProgress] = useState(0);

  const fetchScan = useCallback(async () => {
    try {
      setError(null);
      if (MOCKS_ENABLED) {
        // Simulate progress
        setMockProgress((prev) => {
          const next = Math.min(prev + Math.random() * 15, 100);
          const mockData = {
            ...mockScanProgress,
            id: scanId,
            progress: Math.round(next),
            status: next >= 100 ? 'completed' : 'running',
            categories: mockScanProgress.categories.map((cat, i) => ({
              ...cat,
              progress: Math.min(Math.round(next + (i * -20)), 100),
              status: next + (i * -20) >= 100 ? 'completed' : next + (i * -20) > 0 ? 'running' : 'pending',
            })),
          };
          setScan(mockData);
          return next;
        });
        setLoading(false);
        setRetrying(false);
        return;
      }
      const res = await scanApi.get(scanId);
      setScan(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load scan status.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [scanId]);

  useEffect(() => {
    fetchScan();
    pollRef.current = setInterval(fetchScan, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchScan]);

  // Navigate to results on completion
  useEffect(() => {
    if (scan?.status === 'completed') {
      clearInterval(pollRef.current);
      const timer = setTimeout(() => {
        navigate(`/scans/${scanId}/results`);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (scan?.status === 'failed') {
      clearInterval(pollRef.current);
    }
  }, [scan?.status, scanId, navigate]);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchScan();
  };

  if (loading && !scan) {
    return (
      <>
        <SEOHead title="Scan in Progress" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Scans' }, { label: 'Loading...' }]} />
        <SkeletonCard lines={5} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead title="Scan Error" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Scans' }, { label: scanId }]} />
        <ErrorState title="Failed to load scan" message={error} onRetry={handleRetry} retrying={retrying} />
      </>
    );
  }

  const isRunning = scan?.status === 'running';
  const isCompleted = scan?.status === 'completed';
  const isFailed = scan?.status === 'failed';

  return (
    <>
      <SEOHead title={isCompleted ? 'Scan Complete' : 'Scan in Progress'} noIndex />
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Scans' }, { label: scanId }]} />
      <PageHeader
        title={isCompleted ? 'Scan Complete' : isFailed ? 'Scan Failed' : 'Scan in Progress'}
        description={scan?.agent_name ? `Scanning ${scan.agent_name}` : undefined}
      />

      <div className="max-w-2xl">
        {/* Scan status card */}
        <div className="neu-card shadow-raised-md p-8 mb-8 relative overflow-hidden">
          {/* Radar sweep animation for running state */}
          {isRunning && (
            <div className="absolute top-4 right-4" aria-hidden="true">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full shadow-inset-sm" />
                <div
                  className="absolute inset-0 rounded-full animate-scan-sweep"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, var(--color-accent-soft) 60deg, transparent 120deg)`,
                  }}
                />
                <div className="absolute inset-2 rounded-full" style={{ backgroundColor: 'var(--color-base)' }} />
              </div>
            </div>
          )}

          {/* Completion ring animation */}
          {isCompleted && (
            <div className="absolute top-4 right-4" aria-hidden="true">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="animate-ring-expand absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--color-accent)' }} />
                <Check size={24} style={{ color: 'var(--color-accent)' }} />
              </div>
            </div>
          )}

          {/* Scan ID */}
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Scan ID</span>
            <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{scan?.id}</p>
          </div>

          {/* Overall progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Overall Progress</span>
              <span className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                {scan?.progress ?? 0}%
              </span>
            </div>
            <div className="shadow-inset-sm rounded-[var(--radius-pill)] h-3 overflow-hidden">
              <div
                className={`h-full rounded-[var(--radius-pill)] transition-all ${
                  isCompleted ? 'animate-progress-overshoot' : ''
                }`}
                style={{
                  width: `${scan?.progress ?? 0}%`,
                  backgroundColor: isFailed ? 'var(--color-severity-critical)' : 'var(--color-accent)',
                  boxShadow: isRunning ? '0 0 8px var(--color-accent-soft)' : 'var(--shadow-raised-sm)',
                  transition: 'width 300ms var(--ease-out-expo)',
                }}
                role="progressbar"
                aria-valuenow={scan?.progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Scan progress"
              />
            </div>
          </div>

          {/* Category progress */}
          {scan?.categories && (
            <div className="flex flex-col gap-4">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Categories</span>
              {scan.categories.map((cat) => {
                const StatusIcon = STATUS_ICONS[cat.status] || Clock;
                return (
                  <div key={cat.name} className="flex items-center gap-4">
                    <StatusIcon
                      size={16}
                      aria-hidden="true"
                      className={cat.status === 'running' ? 'animate-scan-sweep' : ''}
                      style={{
                        color:
                          cat.status === 'completed' ? 'var(--color-severity-low)' :
                          cat.status === 'running' ? 'var(--color-accent)' :
                          cat.status === 'failed' ? 'var(--color-severity-critical)' :
                          'var(--color-text-muted)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {CATEGORY_LABELS[cat.name] || cat.name}
                        </span>
                        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                          {Math.max(0, cat.progress)}%
                        </span>
                      </div>
                      <div className="shadow-inset-sm rounded-[var(--radius-pill)] h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-[var(--radius-pill)]"
                          style={{
                            width: `${Math.max(0, cat.progress)}%`,
                            backgroundColor:
                              cat.status === 'completed' ? 'var(--color-severity-low)' :
                              cat.status === 'failed' ? 'var(--color-severity-critical)' :
                              'var(--color-accent)',
                            transition: 'width 300ms var(--ease-out-expo)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isRunning && (
            <p className="text-xs mt-6" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Auto-refreshing every 3 seconds
            </p>
          )}

          {isCompleted && (
            <p className="text-sm mt-6" style={{ color: 'var(--color-accent)' }}>
              Scan complete. Redirecting to results...
            </p>
          )}

          {isFailed && (
            <div className="mt-6">
              <p className="text-sm mb-3" style={{ color: 'var(--color-severity-critical)' }}>
                Scan failed. Check agent connectivity and try again.
              </p>
              <button onClick={handleRetry} className="neu-btn neu-btn-primary min-h-[40px]">
                Retry Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
