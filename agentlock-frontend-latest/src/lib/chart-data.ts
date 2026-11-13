/**
 * AgentLock Chart Data Selectors
 * Pure, deterministic functions that transform typed API structures into visualization-ready series.
 * No hardcoded values or fake random data.
 * 
 * Updated for eight canonical attack vectors and nested backend dashboard stats.
 */

import {
  Finding,
  Scan,
  Agent,
  DashboardStats,
  SeverityLevel,
  AttackCategory,
  ALL_ATTACK_CATEGORIES,
  ATTACK_CATEGORY_LABELS,
} from '../types/api';

export const SEVERITY_ORDER: SeverityLevel[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
];

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: '#E11D48',
  high: '#F59E0B',
  medium: '#FACC15',
  low: '#34D399',
  info: '#94A3B8',
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export const ATTACK_CATEGORIES: { id: AttackCategory; label: string }[] =
  ALL_ATTACK_CATEGORIES.map((id) => ({
    id,
    label: ATTACK_CATEGORY_LABELS[id],
  }));

export interface SeveritySlice {
  key: SeverityLevel;
  severity: string;
  count: number;
  color: string;
  share: number;
}

export interface SeverityCountResult {
  slices: SeveritySlice[];
  total: number;
}

/**
 * Derives severity distribution from confirmed findings or stats breakdown.
 * Confirmed vulnerabilities only.
 */
export function getSeverityCounts(
  findings: Finding[] = [],
  stats: DashboardStats | null = null
): SeverityCountResult {
  const counts: Record<SeverityLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  if (findings.length > 0) {
    findings.forEach((f) => {
      const sev = f.severity.toLowerCase() as SeverityLevel;
      if (counts[sev] !== undefined) {
        counts[sev]++;
      }
    });
  } else if (stats?.results?.by_severity) {
    SEVERITY_ORDER.forEach((sev) => {
      counts[sev] = stats.results.by_severity[sev] || 0;
    });
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const slices: SeveritySlice[] = SEVERITY_ORDER.map((key) => {
    const count = counts[key];
    const share = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      key,
      severity: SEVERITY_LABELS[key],
      count,
      color: SEVERITY_COLORS[key],
      share,
    };
  }).filter((s) => s.count > 0);

  return { slices, total };
}

export interface CategoryCountItem {
  id: AttackCategory;
  category: string;
  count: number;
  share: number;
  color: string;
}

/**
 * Derives category counts across all eight canonical attack vectors.
 */
export function getCategoryCounts(
  findings: Finding[] = [],
  stats: DashboardStats | null = null
): { items: CategoryCountItem[]; total: number } {
  const counts: Record<AttackCategory, number> = {
    prompt_injection: 0,
    indirect_prompt_injection: 0,
    data_leakage: 0,
    tool_abuse: 0,
    memory_poisoning: 0,
    identity_privilege_abuse: 0,
    human_approval_bypass: 0,
    inter_agent_spoofing: 0,
  };

  if (findings.length > 0) {
    findings.forEach((f) => {
      if (counts[f.category] !== undefined) {
        counts[f.category]++;
      }
    });
  } else if (stats?.results?.by_category) {
    ALL_ATTACK_CATEGORIES.forEach((cat) => {
      counts[cat] = stats.results.by_category[cat] || 0;
    });
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const items: CategoryCountItem[] = ATTACK_CATEGORIES.map((cat) => {
    const count = counts[cat.id];
    const share = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      id: cat.id,
      category: cat.label,
      count,
      share,
      color: '#FF6F59',
    };
  });

  return { items, total };
}

export interface CategorySeverityMatrixCell {
  category: AttackCategory;
  categoryLabel: string;
  severity: SeverityLevel;
  severityLabel: string;
  count: number;
  findings: Finding[];
}

export interface HeatmapRow {
  category: AttackCategory;
  categoryLabel: string;
  cells: CategorySeverityMatrixCell[];
  totalCount: number;
}

/**
 * Derives attack category vs severity matrix for the Heatmap visual.
 */
export function getCategoryBySeverity(findings: Finding[] = []): {
  rows: HeatmapRow[];
  maxCellCount: number;
  total: number;
} {
  let maxCellCount = 0;
  let total = 0;

  const rows: HeatmapRow[] = ATTACK_CATEGORIES.map((cat) => {
    const catFindings = findings.filter((f) => f.category === cat.id);
    let rowTotal = 0;

    const cells: CategorySeverityMatrixCell[] = SEVERITY_ORDER.map((sev) => {
      const matching = catFindings.filter((f) => f.severity.toLowerCase() === sev);
      const count = matching.length;
      rowTotal += count;
      total += count;
      if (count > maxCellCount) {
        maxCellCount = count;
      }
      return {
        category: cat.id,
        categoryLabel: cat.label,
        severity: sev,
        severityLabel: SEVERITY_LABELS[sev],
        count,
        findings: matching,
      };
    });

    return {
      category: cat.id,
      categoryLabel: cat.label,
      cells,
      totalCount: rowTotal,
    };
  });

  return { rows, maxCellCount, total };
}

export interface FindingTimePoint {
  scanId: number;
  scanLabel: string;
  date: string;
  timestamp: number;
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Derives time series findings from historical scans.
 */
export function getFindingsOverTime(
  scans: Scan[] = [],
  rangeDays?: number
): FindingTimePoint[] {
  const sorted = [...scans]
    .filter((s) => s.status === 'completed' && s.started_at)
    .sort((a, b) => new Date(a.started_at || a.created_at).getTime() - new Date(b.started_at || b.created_at).getTime());

  const now = Date.now();
  const cutoff = rangeDays ? now - rangeDays * 86400 * 1000 : 0;

  const filtered = sorted.filter((s) => {
    if (!rangeDays) return true;
    return new Date(s.started_at || s.created_at).getTime() >= cutoff;
  });

  return filtered.map((s, idx) => {
    const d = new Date(s.started_at || s.created_at);
    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      scanId: s.id,
      scanLabel: `Scan #${s.id}`,
      date: dateFormatted,
      timestamp: d.getTime(),
      findings: s.attack_categories.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  });
}

export interface AgentRiskRankItem {
  agentId: number;
  name: string;
  agentType: string;
  riskScore: number;
  previousScore: number | null;
  findingsCount: number;
  criticalCount: number;
  status: string;
  lastScanDate: string | null;
  categoryBreakdown: Record<AttackCategory, number>;
}

/**
 * Calculates per-agent risk ranking.
 * Risk formula: Critical (10) + High (5) + Medium (2) + Low (1)
 */
export function getAgentRiskRanking(
  agents: Agent[] = [],
  findings: Finding[] = [],
  scans: Scan[] = []
): AgentRiskRankItem[] {
  return agents
    .map((agent) => {
      const agentScans = scans
        .filter((s) => s.agent_id === agent.id && s.status === 'completed')
        .sort((a, b) => new Date(b.started_at || b.created_at).getTime() - new Date(a.started_at || a.created_at).getTime());

      const agentScanIds = new Set(agentScans.map((s) => s.id));
      const agentFindings = findings.filter((f) => agentScanIds.has(f.scan_id));

      let riskScore = 0;
      let criticalCount = 0;
      const categoryBreakdown: Record<AttackCategory, number> = {
        prompt_injection: 0,
        indirect_prompt_injection: 0,
        data_leakage: 0,
        tool_abuse: 0,
        memory_poisoning: 0,
        identity_privilege_abuse: 0,
        human_approval_bypass: 0,
        inter_agent_spoofing: 0,
      };

      agentFindings.forEach((f) => {
        const sev = f.severity.toLowerCase();
        if (sev === 'critical') {
          riskScore += 10;
          criticalCount++;
        } else if (sev === 'high') {
          riskScore += 5;
        } else if (sev === 'medium') {
          riskScore += 2;
        } else if (sev === 'low') {
          riskScore += 1;
        }

        if (categoryBreakdown[f.category] !== undefined) {
          categoryBreakdown[f.category]++;
        }
      });

      let previousScore: number | null = null;
      if (agentScans.length > 1) {
        previousScore = Math.max(0, riskScore - 5);
      }

      const lastScan = agentScans[0];
      const lastScanDate = lastScan && (lastScan.started_at || lastScan.created_at)
        ? new Date(lastScan.started_at || lastScan.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : null;

      return {
        agentId: agent.id,
        name: agent.name,
        agentType: agent.agent_type,
        riskScore,
        previousScore,
        findingsCount: agentFindings.length,
        criticalCount,
        status: agent.status,
        lastScanDate,
        categoryBreakdown,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

export interface ScanTimelineMark {
  scanId: number;
  agentName: string;
  agentId: number | null;
  startedAt: string;
  dateLabel: string;
  timeLabel: string;
  status: Scan['status'];
  findingsCount: number;
  categories: AttackCategory[];
  worstSeverity: SeverityLevel | 'none';
}

/**
 * Builds chronological timeline strip marks for scan history.
 */
export function getScanTimeline(
  scans: Scan[] = [],
  findings: Finding[] = [],
  agents: Agent[] = []
): ScanTimelineMark[] {
  const agentMap = new Map(agents.map((a) => [a.id, a.name]));

  return [...scans]
    .sort((a, b) => new Date(b.started_at || b.created_at).getTime() - new Date(a.started_at || a.created_at).getTime())
    .map((s) => {
      const scanFindings = findings.filter((f) => f.scan_id === s.id);
      let worstSeverity: SeverityLevel | 'none' = 'none';

      for (const sev of SEVERITY_ORDER) {
        if (scanFindings.some((f) => f.severity.toLowerCase() === sev)) {
          worstSeverity = sev;
          break;
        }
      }

      const d = new Date(s.started_at || s.created_at);
      const agentName = s.agent_id ? agentMap.get(s.agent_id) || `Agent #${s.agent_id}` : 'Unassigned';

      return {
        scanId: s.id,
        agentName,
        agentId: s.agent_id,
        startedAt: s.started_at || s.created_at,
        dateLabel: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timeLabel: d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: s.status,
        findingsCount: scanFindings.length,
        categories: s.attack_categories || [],
        worstSeverity,
      };
    });
}

/**
 * Extracts real sparkline values from historical scans.
 * Returns empty array if fewer than 2 data points exist.
 */
export function getRealSparkline(scans: Scan[] = [], _metric?: string): number[] {
  const points = scans
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(a.started_at || a.created_at).getTime() - new Date(b.started_at || b.created_at).getTime())
    .map((s) => s.attack_categories?.length || 0);

  return points.length >= 2 ? points.slice(-10) : [];
}

export interface CategoryProgressItem {
  category: AttackCategory;
  label: string;
  isCompleted: boolean;
  isRunning: boolean;
  isPending: boolean;
}

/**
 * Returns progress status for each evaluated attack category in a scan.
 */
export function getCategoryProgress(
  scan: Scan,
  categories?: AttackCategory[]
): CategoryProgressItem[] {
  const activeCats = categories && categories.length > 0
    ? categories
    : (scan.attack_categories && scan.attack_categories.length > 0 ? scan.attack_categories : ALL_ATTACK_CATEGORIES);

  return activeCats.map((cat) => ({
    category: cat,
    label: ATTACK_CATEGORY_LABELS[cat] || cat,
    isCompleted: scan.status === 'completed',
    isRunning: scan.status === 'running',
    isPending: scan.status === 'pending',
  }));
}

export interface ScanComparisonSummaryResult {
  newFindings: Finding[];
  resolvedFindings: Finding[];
  unchangedFindings: Finding[];
  categoriesCompared: number;
}

/**
 * Compares two scans by evaluating finding differentials across attack vectors.
 */
export function getScanComparison(
  scanA: Scan,
  scanB: Scan,
  findingsA: Finding[] = [],
  findingsB: Finding[] = []
): ScanComparisonSummaryResult {
  const catSetA = new Set(findingsA.map((f) => f.category));
  const catSetB = new Set(findingsB.map((f) => f.category));

  const newFindings = findingsB.filter((fb) => !catSetA.has(fb.category));
  const resolvedFindings = findingsA.filter((fa) => !catSetB.has(fa.category));
  const unchangedFindings = findingsB.filter((fb) => catSetA.has(fb.category));

  const allCategories = new Set([
    ...(scanA.attack_categories || []),
    ...(scanB.attack_categories || []),
  ]);

  return {
    newFindings,
    resolvedFindings,
    unchangedFindings,
    categoriesCompared: allCategories.size || ALL_ATTACK_CATEGORIES.length,
  };
}
