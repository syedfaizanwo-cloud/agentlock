/**
 * Input normalisation utilities.
 * Postel's Law: accept messy input, return clean output.
 */

/** Trim whitespace and normalise an endpoint URL */
export function normaliseUrl(input) {
  if (!input) return '';
  let url = input.trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Add https:// if no protocol
  if (url && !/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

/** Try to parse JSON, tolerating minor formatting issues */
export function parseLooseJson(input) {
  if (!input) return null;
  let cleaned = input.trim();
  // Try parsing as-is first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try fixing common issues: trailing commas, single quotes
    try {
      cleaned = cleaned
        .replace(/,\s*([}\]])/g, '$1') // trailing commas
        .replace(/'/g, '"'); // single quotes
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

/** Format a date string for display */
export function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format duration between two dates */
export function formatDuration(start, end) {
  if (!start || !end) return 'N/A';
  const ms = new Date(end) - new Date(start);
  if (ms < 0) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/** Get severity colour class */
export function severityClass(severity) {
  const map = {
    critical: 'severity-critical',
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
    info: 'severity-info',
  };
  return map[severity?.toLowerCase()] || 'severity-info';
}

/** Get severity sort weight (higher = more severe) */
export function severityWeight(severity) {
  const map = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  return map[severity?.toLowerCase()] ?? -1;
}

/** Truncate text with ellipsis */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

/** Generate a simple id for keys */
let counter = 0;
export function uid() {
  return `uid-${++counter}-${Date.now().toString(36)}`;
}

/** Copy text to clipboard */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
