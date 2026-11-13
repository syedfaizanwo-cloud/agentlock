/**
 * Build-time / deployment last updated date configuration
 * Used across Footer, Legal pages, Print stylesheet, and Sitemap
 */

export const LAST_UPDATED_ISO =
  process.env.NEXT_PUBLIC_LAST_UPDATED || '2026-11-12T06:00:00Z';

export const LAST_UPDATED_FORMATTED = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date(LAST_UPDATED_ISO));
