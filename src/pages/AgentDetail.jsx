import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, Wifi, WifiOff, ScanLine, ExternalLink } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import SeverityPill from '@/components/ui/SeverityPill';
import { SkeletonCard, SkeletonTable } from '@/components/ui/SkeletonLoader';
import { agentApi } from '@/services/api';
import { MOCKS_ENABLED, mockAgents } from '@/mocks/data';
import { formatDate, truncate } from '@/utils/helpers';

export default function AgentDetail() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetchAgent = useCallback(async () => {
    try {
      setError(null);
      if (MOCKS_ENABLED) {
        const found = mockAgents.find((a) => a.id === agentId) || mockAgents[0];
        setAgent(found);
        setLoading(false);
        setRetrying(false);
        return;
      }
      const res = await agentApi.get(agentId);
      setAgent(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load agent details.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchAgent();
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Agent" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents', to: '/agents' }, { label: 'Loading...' }]} />
        <div className="flex flex-col gap-6">
          <SkeletonCard lines={4} />
          <SkeletonTable rows={3} columns={4} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead title="Agent" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents', to: '/agents' }, { label: 'Error' }]} />
        <ErrorState title="Failed to load agent" message={error} onRetry={handleRetry} retrying={retrying} />
      </>
    );
  }

  if (!agent) {
    return (
      <>
        <SEOHead title="Agent Not Found" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents', to: '/agents' }, { label: 'Not Found' }]} />
        <EmptyState title="Agent not found" message="This agent does not exist or has been removed." actionLabel="Back to Agents" actionTo="/agents" icon={Bot} />
      </>
    );
  }

  return (
    <>
      <SEOHead title={agent.name} noIndex />
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents', to: '/agents' }, { label: agent.name }]} />
      <PageHeader title={agent.name} description={`${agent.type} agent`}>
        <Link
          to={`/scans/new?agent=${agent.id}`}
          className="neu-btn neu-btn-primary inline-flex items-center gap-2 min-h-[40px] no-underline"
        >
          <ScanLine size={18} aria-hidden="true" />
          Start Scan
        </Link>
      </PageHeader>

      {/* Agent info card */}
      <div className="neu-card shadow-raised-md p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</span>
            <span className="flex items-center gap-2 text-sm">
              {agent.status === 'active' ? (
                <Wifi size={16} style={{ color: 'var(--color-severity-low)' }} aria-hidden="true" />
              ) : (
                <WifiOff size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              )}
              <span style={{ color: 'var(--color-text-primary)' }}>{agent.status}</span>
            </span>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Endpoint</span>
            <span className="flex items-center gap-2 text-sm break-all" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
              {truncate(agent.endpoint, 60)}
              <ExternalLink size={14} aria-hidden="true" className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </span>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Type</span>
            <span className="neu-pill text-xs">{agent.type}</span>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Created</span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(agent.created_at)}</span>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Last Scan</span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(agent.last_scan)}</span>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Vulnerabilities Found</span>
            <span className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{agent.vulnerabilities_found ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Scan history */}
      <div className="neu-card shadow-raised-md p-0">
        <div className="shadow-inset-sm rounded-t-[14px] px-6 py-3">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Scan History</span>
        </div>
        {agent.total_scans === 0 ? (
          <div className="px-6 py-10">
            <EmptyState
              title="No scans yet"
              message="Start a scan to test this agent for vulnerabilities."
              actionLabel="Start Scan"
              actionTo={`/scans/new?agent=${agent.id}`}
              icon={ScanLine}
            />
          </div>
        ) : (
          <div className="px-6 py-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {agent.total_scans} scan{agent.total_scans !== 1 ? 's' : ''} completed.
              View detailed results from the <Link to="/reports" className="underline" style={{ color: 'var(--color-accent)' }}>Reports</Link> page.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
