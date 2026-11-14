'use client';

import React, { useState } from 'react';
import { Finding, AttackCategory, SeverityLevel } from '../../types/api';
import {
  getCategoryBySeverity,
  SEVERITY_ORDER,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  ATTACK_CATEGORIES,
} from '../../lib/chart-data';
import { Table, Grid, ShieldAlert } from 'lucide-react';

interface CategorySeverityHeatmapProps {
  findings?: Finding[];
  onSelectCell?: (category: AttackCategory, severity: SeverityLevel) => void;
  selectedCategory?: AttackCategory | 'ALL' | null;
  selectedSeverity?: SeverityLevel | 'ALL' | null;
}

export const CategorySeverityHeatmap: React.FC<CategorySeverityHeatmapProps> = ({
  findings = [],
  onSelectCell,
  selectedCategory,
  selectedSeverity,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    category: AttackCategory;
    severity: SeverityLevel;
  } | null>(null);

  const { rows, maxCellCount, total } = getCategoryBySeverity(findings);

  if (total === 0 || findings.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col justify-between min-h-[280px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-sans font-bold text-cream">
              Attack category vs severity matrix
            </h3>
            <span className="text-xs font-mono text-cream-muted px-2 py-0.5 rounded bg-navy-850 border border-[#1A2E5A]">
              0 findings
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-1 font-sans">
            Cross-tabulation of vulnerability frequency across risk levels
          </p>
        </div>
        <div className="py-8 text-center text-xs font-mono text-cream-muted space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-cream-muted/40" />
          <div>Run a scan to view category versus severity density.</div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('scan');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-coral hover:bg-coral-hover text-navy-950 transition-colors"
          >
            Launch security scan
          </button>
        </div>
      </div>
    );
  }

  const getCellIntensityStyle = (
    count: number,
    severity: SeverityLevel,
    isSelected: boolean
  ) => {
    if (count === 0) {
      return 'bg-navy-950/60 text-cream-muted/40 border-[#1A2E5A]/40 hover:border-[#1A2E5A]';
    }

    const intensity = maxCellCount > 0 ? count / maxCellCount : 0;
    const baseColor = SEVERITY_COLORS[severity];

    const borderStyle = isSelected ? 'border-cream ring-1 ring-cream' : 'border-transparent';

    if (intensity > 0.6) {
      return `text-cream font-bold ${borderStyle}`;
    }
    return `text-cream font-semibold ${borderStyle}`;
  };

  const getCellBg = (count: number, severity: SeverityLevel) => {
    if (count === 0) return 'rgba(10, 22, 51, 0.4)';
    const intensity = Math.max(0.18, maxCellCount > 0 ? count / maxCellCount : 0.2);
    const color = SEVERITY_COLORS[severity];
    return `${color}${Math.round(intensity * 255)
      .toString(16)
      .padStart(2, '0')}`;
  };

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-4">
      {/* Header and Toggle */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1A2E5A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Attack category vs severity matrix
            </h3>
            <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
              {total} findings
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Click any cell to filter findings by attack vector and severity tier
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral transition-colors"
          title={showTable ? 'View as heatmap' : 'View as table'}
          aria-label={showTable ? 'View as heatmap' : 'View as table'}
        >
          {showTable ? <Grid className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                {SEVERITY_ORDER.map((sev) => (
                  <th key={sev} className="py-2.5 px-3 text-right">
                    {SEVERITY_LABELS[sev]}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right text-coral">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A] text-cream">
              {rows.map((row) => (
                <tr key={row.category} className="hover:bg-navy-850 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-cream">{row.categoryLabel}</td>
                  {row.cells.map((cell) => (
                    <td
                      key={cell.severity}
                      onClick={() => onSelectCell?.(cell.category, cell.severity)}
                      className={`py-2.5 px-3 text-right cursor-pointer hover:underline ${
                        cell.count > 0 ? 'font-bold' : 'text-cream-muted/50'
                      }`}
                      style={{ color: cell.count > 0 ? SEVERITY_COLORS[cell.severity] : undefined }}
                    >
                      {cell.count}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-bold text-coral">{row.totalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            {/* Column Headers: Severity Levels */}
            <div className="grid grid-cols-6 gap-2 mb-2 text-xs font-mono">
              <div className="text-cream-muted font-medium py-1">Vector</div>
              {SEVERITY_ORDER.map((sev) => (
                <div
                  key={sev}
                  className="text-center py-1 font-bold rounded"
                  style={{ color: SEVERITY_COLORS[sev] }}
                >
                  {SEVERITY_LABELS[sev]}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.category} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-xs font-sans text-cream truncate pr-2" title={row.categoryLabel}>
                    {row.categoryLabel}
                  </div>

                  {row.cells.map((cell) => {
                    const isSelected =
                      selectedCategory === cell.category && selectedSeverity === cell.severity;
                    const isHovered =
                      hoveredCell?.category === cell.category &&
                      hoveredCell?.severity === cell.severity;

                    return (
                      <button
                        key={cell.severity}
                        type="button"
                        onClick={() => onSelectCell?.(cell.category, cell.severity)}
                        onMouseEnter={() =>
                          setHoveredCell({ category: cell.category, severity: cell.severity })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${getCellIntensityStyle(
                          cell.count,
                          cell.severity,
                          isSelected || isHovered
                        )}`}
                        style={{
                          backgroundColor: getCellBg(cell.count, cell.severity),
                        }}
                        title={`${row.categoryLabel} - ${cell.severityLabel}: ${cell.count} findings`}
                        aria-label={`${row.categoryLabel} - ${cell.severityLabel}: ${cell.count} findings`}
                      >
                        <span className="text-xs font-mono">{cell.count}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#1A2E5A] flex items-center justify-between text-xs font-mono text-cream-muted">
        <span>Click any cell to filter Results view</span>
        <span>4 attack categories mapped</span>
      </div>
    </div>
  );
};
