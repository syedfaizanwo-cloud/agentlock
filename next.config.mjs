/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_NAME: "AgentLock 2.0",
    NEXT_PUBLIC_VERSION: "2.0.4",
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@hugeicons/react',
      '@hugeicons/core-free-icons',
      'recharts',
      'three',
      'clsx',
      'tailwind-merge'
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png|webp|avif|woff2|ico)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
