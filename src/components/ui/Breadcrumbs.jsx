import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

/**
 * Breadcrumbs with Schema.org BreadcrumbList JSON-LD.
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 */
export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `${import.meta.env.VITE_SITE_URL || ''}${item.to}` } : {}),
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm list-none m-0 p-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    aria-hidden="true"
                    style={{ color: 'var(--color-text-muted)' }}
                    className="shrink-0"
                  />
                )}
                {isLast || !item.to ? (
                  <span
                    style={{ color: 'var(--color-text-primary)' }}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className="min-h-[40px] flex items-center transition-colors hover:underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
