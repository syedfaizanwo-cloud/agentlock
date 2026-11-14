'use client';

import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  unit?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  unit = '',
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="p-2.5 rounded-[10px] text-xs font-mono shadow-[4px_4px_12px_#030714] pointer-events-none select-none z-50 border border-[#12234A]"
      style={{
        backgroundColor: '#0A1633',
        color: '#F5EDDC',
      }}
    >
      {label && <div className="text-[11px] text-[#C8C0AC] font-semibold mb-1">{label}</div>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || '#FF6F59' }}
              />
              <span className="text-[#C8C0AC]">{entry.name || 'Value'}:</span>
            </div>
            <span className="font-bold text-[#F5EDDC]">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}{' '}
              {entry.unit || unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
