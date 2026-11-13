import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, label: 'Critical' },
  high:     { icon: AlertCircle,   label: 'High' },
  medium:   { icon: AlertCircle,   label: 'Medium' },
  low:      { icon: Info,          label: 'Low' },
  info:     { icon: Info,          label: 'Info' },
};

/**
 * Severity pill. Never uses colour alone: always shows icon + text.
 * @param {{ severity: 'critical' | 'high' | 'medium' | 'low' | 'info' }} props
 */
export default function SeverityPill({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  return (
    <span className={`neu-pill severity-${severity}`} role="status">
      <Icon size={12} aria-hidden="true" className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
