import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bot, Wifi, WifiOff, X } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { agentApi } from '@/services/api';
import { MOCKS_ENABLED, mockAgents } from '@/mocks/data';
import { normaliseUrl, parseLooseJson, truncate, formatDate } from '@/utils/helpers';

const AGENT_TYPES = [
  { value: 'conversational', label: 'Conversational' },
  { value: 'tool-augmented', label: 'Tool-augmented' },
  { value: 'autonomous', label: 'Autonomous' },
];

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setError(null);
      if (MOCKS_ENABLED) {
        setAgents(mockAgents);
        setLoading(false);
        setRetrying(false);
        return;
      }
      const res = await agentApi.list();
      setAgents(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load agents.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchAgents();
  };

  return (
    <>
      <SEOHead title="Agents" noIndex />
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents' }]} />
      <PageHeader title="Agents" description="Manage your registered AI agents">
        <button
          type="button"
          className="neu-btn neu-btn-primary inline-flex items-center gap-2 min-h-[40px]"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} aria-hidden="true" />
          Register Agent
        </button>
      </PageHeader>

      {error && (
        <ErrorState title="Failed to load agents" message={error} onRetry={handleRetry} retrying={retrying} />
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <EmptyState
          title="No agents registered"
          message="Register your first AI agent to start scanning for vulnerabilities."
          actionLabel="Register Agent"
          icon={Bot}
        />
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              to={`/agents/${agent.id}`}
              className="neu-card shadow-raised-md p-6 block no-underline transition-shadow duration-[var(--duration-normal)] hover:shadow-raised-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="shadow-inset-sm rounded-[var(--radius-control)] p-2">
                    <Bot size={20} className="text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{agent.name}</p>
                    <span className="neu-pill text-xs mt-1">{agent.type}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  {agent.status === 'active' ? (
                    <Wifi size={14} className="text-severity-low" aria-hidden="true" />
                  ) : (
                    <WifiOff size={14} className="text-text-muted" aria-hidden="true" />
                  )}
                  {agent.status}
                </span>
              </div>

              <p
                className="text-sm text-text-secondary mb-3 break-all"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {truncate(agent.endpoint, 48)}
              </p>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Last scan: {formatDate(agent.last_scan)}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {agent.vulnerabilities_found} vulns
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <RegisterModal
          onClose={() => setModalOpen(false)}
          onCreated={(newAgent) => {
            setAgents((prev) => [...prev, newAgent]);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ── Registration Modal ── */
function RegisterModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [agentType, setAgentType] = useState('conversational');
  const [headers, setHeaders] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanEndpoint = normaliseUrl(endpoint);
    const parsedHeaders = headers.trim() ? parseLooseJson(headers) : null;

    if (!cleanName) {
      setFormError('Agent name is required.');
      return;
    }
    if (!cleanEndpoint) {
      setFormError('Endpoint URL is required.');
      return;
    }
    if (headers.trim() && parsedHeaders === null) {
      setFormError('Headers must be valid JSON (e.g. {"Authorization": "Bearer token"}).');
      return;
    }

    const payload = {
      name: cleanName,
      endpoint: cleanEndpoint,
      type: agentType,
      headers: parsedHeaders,
    };

    try {
      setSubmitting(true);
      if (MOCKS_ENABLED) {
        onCreated({
          id: `agent-${Date.now()}`,
          ...payload,
          status: 'active',
          created_at: new Date().toISOString(),
          last_scan: null,
          total_scans: 0,
          vulnerabilities_found: 0,
        });
        return;
      }
      const res = await agentApi.create(payload);
      onCreated(res.data);
    } catch (err) {
      setFormError(err.userMessage || 'Failed to register agent.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(4, 7, 14, 0.85)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Register a new agent"
    >
      <div className="neu-card shadow-raised-lg w-full max-w-lg p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Register Agent
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="agent-name" className="block text-sm text-text-secondary mb-2">Name</label>
            <input
              id="agent-name"
              type="text"
              className="neu-input w-full px-4 py-3 min-h-[40px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Support Bot"
              required
            />
          </div>

          <div>
            <label htmlFor="agent-endpoint" className="block text-sm text-text-secondary mb-2">Endpoint URL</label>
            <input
              id="agent-endpoint"
              type="text"
              className="neu-input w-full px-4 py-3 min-h-[40px]"
              style={{ fontFamily: 'var(--font-mono)' }}
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="e.g. api.example.com/agent"
              required
            />
            {endpoint.trim() && (
              <p className="text-xs text-text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Will be saved as: {normaliseUrl(endpoint)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="agent-type" className="block text-sm text-text-secondary mb-2">Agent Type</label>
            <select
              id="agent-type"
              className="neu-input w-full px-4 py-3 min-h-[40px] appearance-none"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
            >
              {AGENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="agent-headers" className="block text-sm text-text-secondary mb-2">
              Headers <span className="text-text-muted">(optional, JSON)</span>
            </label>
            <textarea
              id="agent-headers"
              className="neu-input w-full px-4 py-3 min-h-[80px] resize-y"
              style={{ fontFamily: 'var(--font-mono)' }}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer ..."}'
              rows={3}
            />
            {headers.trim() && parseLooseJson(headers) && (
              <p className="text-xs text-text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Parsed: {JSON.stringify(parseLooseJson(headers))}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-sm" style={{ color: 'var(--color-severity-critical)' }} role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="neu-btn neu-btn-primary w-full py-3 min-h-[40px] mt-2"
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Register Agent'}
          </button>
        </form>
      </div>
    </div>
  );
}
