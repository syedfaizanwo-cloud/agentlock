import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Error state with retry action.
 * @param {{ title?: string, message: string, onRetry?: () => void, retrying?: boolean }} props
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retrying = false,
}) {
  return (
    <div className="neu-well p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
      <AlertTriangle
        size={40}
        aria-hidden="true"
        style={{ color: 'var(--color-severity-critical)' }}
      />
      <div className="flex flex-col gap-1">
        <h3
          className="text-base font-semibold m-0"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>
        <p
          className="text-sm m-0"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="neu-btn neu-btn-primary inline-flex items-center justify-center gap-2 min-h-[40px] px-5 text-sm"
          aria-label={retrying ? 'Retrying' : 'Retry'}
        >
          {retrying && (
            <Loader2
              size={16}
              aria-hidden="true"
              className="animate-scan-sweep"
            />
          )}
          <span>{retrying ? 'Retrying' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
}
