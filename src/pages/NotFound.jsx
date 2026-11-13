import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-base)' }}
    >
      <SEOHead title="Page Not Found" noIndex />

      <div className="neu-card shadow-raised-lg p-10 max-w-md w-full text-center">
        <ShieldX
          size={56}
          aria-hidden="true"
          className="mx-auto mb-6"
          style={{ color: 'var(--color-severity-critical)' }}
        />

        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
        >
          Page Not Found
        </h1>

        <p
          className="text-sm mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This page does not exist. It may have been moved or the URL may be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="neu-btn neu-btn-primary inline-flex items-center justify-center min-h-[40px] px-6 no-underline"
          >
            Go to Home
          </Link>
          <Link
            to="/dashboard"
            className="neu-btn inline-flex items-center justify-center min-h-[40px] px-6 no-underline"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
