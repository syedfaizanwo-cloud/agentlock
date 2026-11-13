import { Shield } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'var(--color-base)' }}
      role="status"
      aria-label="Loading AgentLock"
    >
      <div className="animate-scan-pulse">
        <Shield size={48} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
      </div>
      <span
        className="text-sm font-medium tracking-wide uppercase"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Loading
      </span>
    </div>
  );
}
