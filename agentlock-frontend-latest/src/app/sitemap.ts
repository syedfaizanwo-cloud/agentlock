import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentlock.dev';

  const routes = ['', '/agents', '/scans', '/reports', '/faq'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
