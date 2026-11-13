import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || '';
const DEFAULT_DESCRIPTION = 'AgentLock scans AI agents for security vulnerabilities, prompt injection, data leakage, and more.';

/**
 * SEO head component. Sets title, meta description, canonical, OG, Twitter, and noindex.
 * @param {{ title?: string, description?: string, canonical?: string, ogImage?: string, noIndex?: boolean }} props
 */
export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | AgentLock` : 'AgentLock';
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
