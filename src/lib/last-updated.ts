/**
 * Build-time / deployment last updated date configuration
 * Used across Footer, Legal pages, Print stylesheet, and Sitemap
 */

export const LAST_UPDATED_ISO =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LAST_UPDATED) ||
  '2026-11-13T12:00:00Z';

export const LAST_UPDATED_FORMATTED = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date(LAST_UPDATED_ISO));
