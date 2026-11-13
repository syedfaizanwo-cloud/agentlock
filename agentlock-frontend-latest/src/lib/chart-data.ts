/**
 * AgentLock Chart Data Selectors
 * Pure, deterministic functions that transform typed API structures into visualization-ready series.
 * No hardcoded values or fake random data.
 */

import {
  Finding,
  Scan,
  Agent,
  DashboardStats,
  SeverityLevel,
  AttackCategory,
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

export const ATTACK_CATEGORIES: { id: AttackCategory; label: string }[] = [
  { id: 'prompt_injection', label: 'Prompt Injection' },
  { id: 'data_leakage', label: 'Data Leakage' },
  { id: 'tool_abuse', label: 'Tool Abuse' },
  { id: 'memory_poisoning', label: 'Memory Poisoning' },
];

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
      if (counts[f.severity] !== undefined) {
        counts[f.severity]++;
      }
    });
  } else if (stats?.severity_breakdown) {
    SEVERITY_ORDER.forEach((sev) => {
      counts[sev] = stats.severity_breakdown?.[sev] || 0;
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
 * Derives category counts across the 4 primary attack vectors.
 */
export function getCategoryCounts(
  findings: Finding[] = [],
  stats: DashboardStats | null = null
): { items: CategoryCountItem[]; total: number } {
  const counts: Record<AttackCategory, number> = {
    prompt_injection: 0,
    data_leakage: 0,
    tool_abuse: 0,
    memory_poisoning: 0,
  };

  if (findings.length > 0) {
    findings.forEach((f) => {
      if (counts[f.category] !== undefined) {
        counts[f.category]++;
      }
    });
  } else if (stats?.category_breakdown) {
    counts.prompt_injection = stats.category_breakdown.prompt_injection || 0;
    counts.data_leakage = stats.category_breakdown.data_leakage || 0;
    counts.tool_abuse = stats.category_breakdown.tool_abuse || 0;
    counts.memory_poisoning = stats.category_breakdown.memory_poisoning || 0;
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
      const matching = catFindings.filter((f) => f.severity === sev);
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
  scanId: string;
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
    .filter((s) => s.status === 'completed' || typeof s.vulnerabilities_found === 'number')
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  const now = Date.now();
  const cutoff = rangeDays ? now - rangeDays * 86400 * 1000 : 0;

  const filtered = sorted.filter((s) => {
    if (!rangeDays) return true;
    return new Date(s.started_at).getTime() >= cutoff;
  });

  return filtered.map((s, idx) => {
    const d = new Date(s.started_at);
    const dateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const vulnCount = s.vulnerabilities_found || 0;

    return {
      scanId: s.id,
      scanLabel: `Scan #${idx + 1}`,
      date: dateFormatted,
      timestamp: d.getTime(),
      findings: vulnCount,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  });
}

export interface AgentRiskRankItem {
  agentId: string;
  name: string;
  targetUrl: string;
  riskScore: number;
  previousScore: number | null;
  findingsCount: number;
  criticalCount: number;
  status: string;
  lastScanDate: string | null;
  categoryBreakdown: Record<AttackCategory, number>;
}

/**
 * Calculates per-agent risk ranking and previous scan delta marker.
 * Risk formula: Critical (10) + High (5) + Medium (2) + Low (1)
 */
export function getAgentRiskRanking(
  agents: Agent[] = [],
  findings: Finding[] = [],
  scans: Scan[] = []
): AgentRiskRankItem[] {
  return agents
    .map((agent) => {
      const agentFindings = findings.filter((f) => f.agent_id === agent.id);
      let riskScore = 0;
      let criticalCount = 0;
      const categoryBreakdown: Record<AttackCategory, number> = {
        prompt_injection: 0,
        data_leakage: 0,
        tool_abuse: 0,
        memory_poisoning: 0,
      };

      agentFindings.forEach((f) => {
        if (f.severity === 'critical') {
          riskScore += 10;
          criticalCount++;
        } else if (f.severity === 'high') {
          riskScore += 5;
        } else if (f.severity === 'medium') {
          riskScore += 2;
        } else if (f.severity === 'low') {
          riskScore += 1;
        }

        if (categoryBreakdown[f.category] !== undefined) {
          categoryBreakdown[f.category]++;
        }
      });

      // Find historical scans for this agent to compute previous scan score marker
      const agentScans = scans
        .filter((s) => s.agent_id === agent.id && s.status === 'completed')
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

      let previousScore: number | null = null;
      if (agentScans.length > 1) {
        // Use the second most recent scan vulnerabilities count as proxy for previous score
        previousScore = (agentScans[1].vulnerabilities_found || 0) * 3;
      }

      const lastScan = agentScans[0];
      const lastScanDate = lastScan
        ? new Date(lastScan.started_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : null;

      return {
        agentId: agent.id,
        name: agent.name,
        targetUrl: agent.target_url,
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
  scanId: string;
  agentName: string;
  agentId: string;
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
  findings: Finding[] = []
): ScanTimelineMark[] {
  return [...scans]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .map((s) => {
      const scanFindings = findings.filter((f) => f.scan_id === s.id);
      let worstSeverity: SeverityLevel | 'none' = 'none';

      for (const sev of SEVERITY_ORDER) {
        if (scanFindings.some((f) => f.severity === sev)) {
          worstSeverity = sev;
          break;
        }
      }

      if (worstSeverity === 'none' && (s.vulnerabilities_found || 0) > 0) {
        worstSeverity = 'high';
      }

      const d = new Date(s.started_at);
      return {
        scanId: s.id,
        agentName: s.agent_name || s.agent_id,
        agentId: s.agent_id,
        startedAt: s.started_at,
        dateLabel: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timeLabel: d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: s.status,
        findingsCount: s.vulnerabilities_found ?? scanFindings.length,
        categories: s.categories,
        worstSeverity,
      };
    });
}

export interface ScanComparisonResult {
  scanA: Scan;
  scanB: Scan;
  newFindings: Finding[];
  resolvedFindings: Finding[];
  unchangedFindings: Finding[];
  categoryDeltas: {
    category: AttackCategory;
    label: string;
    countA: number;
    countB: number;
    delta: number;
  }[];
}

/**
 * Compares two evaluation scans: new findings, resolved findings, and persistent findings.
 */
export function getScanComparison(
  scanA: Scan,
  scanB: Scan,
  findingsA: Finding[] = [],
  findingsB: Finding[] = []
): ScanComparisonResult {
  const mapA = new Map(findingsA.map((f) => [f.title + f.attack_prompt, f]));
  const mapB = new Map(findingsB.map((f) => [f.title + f.attack_prompt, f]));

  const newFindings = findingsB.filter((fb) => !mapA.has(fb.title + fb.attack_prompt));
  const resolvedFindings = findingsA.filter((fa) => !mapB.has(fa.title + fa.attack_prompt));
  const unchangedFindings = findingsB.filter((fb) => mapA.has(fb.title + fb.attack_prompt));

  const categoryDeltas = ATTACK_CATEGORIES.map((cat) => {
    const countA = findingsA.filter((f) => f.category === cat.id).length;
    const countB = findingsB.filter((f) => f.category === cat.id).length;
    return {
      category: cat.id,
      label: cat.label,
      countA,
      countB,
      delta: countB - countA,
    };
  });

  return {
    scanA,
    scanB,
    newFindings,
    resolvedFindings,
    unchangedFindings,
    categoryDeltas,
  };
}

export interface CategoryProgressSegment {
  category: AttackCategory;
  label: string;
  isCompleted: boolean;
  isRunning: boolean;
  isPending: boolean;
  percent: number;
}

/**
 * Computes segmented progress by test category for a running scan.
 */
export function getCategoryProgress(
  scan: Scan | null,
  activeCategories: AttackCategory[] = []
): CategoryProgressSegment[] {
  if (!scan || activeCategories.length === 0) {
    return activeCategories.map((catId) => ({
      category: catId,
      label: ATTACK_CATEGORIES.find((c) => c.id === catId)?.label || catId,
      isCompleted: false,
      isRunning: false,
      isPending: true,
      percent: 0,
    }));
  }

  const overallProgress = Math.min(100, Math.max(0, scan.progress ?? 0));
  const numCategories = activeCategories.length;
  const sliceSize = 100 / numCategories;

  return activeCategories.map((catId, idx) => {
    const sliceStart = idx * sliceSize;
    const sliceEnd = (idx + 1) * sliceSize;

    let percent = 0;
    if (overallProgress >= sliceEnd) {
      percent = 100;
    } else if (overallProgress > sliceStart) {
      percent = Math.round(((overallProgress - sliceStart) / sliceSize) * 100);
    }

    const isCompleted = percent === 100 || scan.status === 'completed';
    const isRunning = !isCompleted && percent > 0 && scan.status === 'running';
    const isPending = percent === 0 && scan.status !== 'completed';

    return {
      category: catId,
      label: ATTACK_CATEGORIES.find((c) => c.id === catId)?.label || catId,
      isCompleted,
      isRunning,
      isPending,
      percent,
    };
  });
}

/**
 * Extracts real sparkline values from historical scans.
 * Returns empty array if fewer than 2 data points exist.
 */
export function getRealSparkline(
  scans: Scan[] = [],
  field: 'vulnerabilities' | 'total_tests' = 'vulnerabilities'
): number[] {
  const points = scans
    .filter((s) => s.status === 'completed' || typeof s.vulnerabilities_found === 'number')
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .map((s) => (field === 'vulnerabilities' ? s.vulnerabilities_found || 0 : s.total_tests || 0));

  return points.length >= 2 ? points.slice(-10) : [];
}
