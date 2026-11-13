import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ScanLine, ShieldAlert, AlertTriangle } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import SeverityPill from '@/components/ui/SeverityPill';
import { SkeletonCard, SkeletonTable } from '@/components/ui/SkeletonLoader';
import { dashboardApi } from '@/services/api';
import { MOCKS_ENABLED, mockDashboardStats } from '@/mocks/data';
import { formatDate } from '@/utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      if (MOCKS_ENABLED) {
        setStats(mockDashboardStats);
        setLoading(false);
        setRetrying(false);
        return;
      }
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchStats();
  };

  if (error) {
    return (
      <>
        <SEOHead title="Dashboard" noIndex />
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />
        <PageHeader title="Dashboard" description="Overview of your agents and security posture" />
        <ErrorState title="Failed to load dashboard" message={error} onRetry={handleRetry} retrying={retrying} />
      </>
    );
  }

  return (
    <>
      <SEOHead title="Dashboard" noIndex />
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <PageHeader title="Dashboard" description="Overview of your agents and security posture" />

      {/* Stat tiles */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !stats ? (
        <EmptyState
          title="No data yet"
          message="Register your first agent to start scanning for vulnerabilities."
          actionLabel="Register Agent"
          actionTo="/agents"
          icon={Bot}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatTile label="Registered Agents" value={stats.total_agents} icon={Bot} />
            <StatTile label="Total Scans" value={stats.total_scans} icon={ScanLine} />
            <StatTile label="Vulnerabilities Found" value={stats.total_vulnerabilities} icon={ShieldAlert} />
            <StatTile label="Critical Findings" value={stats.critical_findings} icon={AlertTriangle} />
          </div>

          {/* Recent scans */}
          <div className="neu-card shadow-raised-md p-0">
            <div className="shadow-inset-sm rounded-t-[14px] px-6 py-3 flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium uppercase tracking-wider">Recent Scans</span>
            </div>

            {stats.recent_scans?.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  title="No scans yet"
                  message="Run your first scan to see results here."
                  actionLabel="New Scan"
                  actionTo="/scans/new"
                  icon={ScanLine}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left" role="table">
                  <thead>
                    <tr className="text-text-muted text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-medium">Scan ID</th>
                      <th className="px-6 py-3 font-medium">Agent</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Findings</th>
                      <th className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_scans?.map((scan) => {
                      const totalFindings = scan.findings
                        ? Object.values(scan.findings).reduce((a, b) => a + b, 0)
                        : 0;

                      return (
                        <tr
                          key={scan.id}
                          className="border-t transition-colors duration-[var(--duration-fast)]"
                          style={{ borderColor: 'var(--color-shadow-dark)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-inset-sm)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <td className="px-6 py-4 font-[var(--font-mono)] text-sm text-text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                            {scan.id}
                          </td>
                          <td className="px-6 py-4 text-sm">{scan.agent_name}</td>
                          <td className="px-6 py-4">
                            <span className={`neu-pill ${scan.status === 'completed' ? 'severity-low' : scan.status === 'running' ? 'severity-medium' : 'severity-info'}`}>
                              {scan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(scan.started_at)}</td>
                          <td className="px-6 py-4">
                            {totalFindings > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                {scan.findings.critical > 0 && <SeverityPill severity="critical" />}
                                {scan.findings.high > 0 && <SeverityPill severity="high" />}
                                {scan.findings.medium > 0 && <SeverityPill severity="medium" />}
                                {scan.findings.low > 0 && <SeverityPill severity="low" />}
                                <span className="text-text-muted text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{totalFindings}</span>
                              </div>
                            ) : (
                              <span className="text-text-muted text-sm">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/scans/${scan.id}/results`}
                              className="neu-btn text-sm px-4 py-2 min-h-[40px] inline-flex items-center no-underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
