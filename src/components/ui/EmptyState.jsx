import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

/**
 * Empty-state component. Clean, no decoration.
 * @param {{ title: string, message: string, actionLabel?: string, actionTo?: string, icon?: import('lucide-react').LucideIcon }} props
 */
export default function EmptyState({ title, message, actionLabel, actionTo, icon: Icon = Inbox }) {
  return (
    <div className="neu-well p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
      <Icon
        size={40}
        aria-hidden="true"
        style={{ color: 'var(--color-text-muted)' }}
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
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="neu-btn neu-btn-primary inline-flex items-center justify-center min-h-[40px] px-5 text-sm no-underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
