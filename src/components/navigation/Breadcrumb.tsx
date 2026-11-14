import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentlock.dev';

  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="py-2.5">
        <ol className="flex items-center space-x-2 text-xs font-mono text-cream-muted">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-coral transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={`${item.label}-${idx}`} className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-cream-muted/50" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-coral transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-cream font-medium" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
