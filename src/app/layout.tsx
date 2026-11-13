import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentlock.ai';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AgentLock 2.0 | Zero-Trust Runtime Gateway for AI Fleets',
  description:
    'Deterministic zero-trust runtime gateway for AI agent fleets. Real-time action monitoring, threat forensics, and human-in-the-loop approvals.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'AgentLock 2.0',
    title: 'AgentLock 2.0 | Zero-Trust Runtime Gateway for AI Fleets',
    description:
      'Deterministic zero-trust runtime gateway for AI agent fleets. Real-time action monitoring, threat forensics, and human-in-the-loop approvals.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AgentLock 2.0 Zero-Trust Gateway for AI Fleets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentLock 2.0 | Zero-Trust Runtime Gateway for AI Fleets',
    description:
      'Deterministic zero-trust runtime gateway for AI agent fleets. Real-time action monitoring, threat forensics, and human-in-the-loop approvals.',
    images: ['/og-image.png'],
  },
  other: {
    'theme-color': '#050505',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AgentLock 2.0',
  url: SITE_URL,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  description: 'Deterministic Zero-Trust Runtime Gateway for AI Fleets',
  email: 'security@agentlock.ai',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Security & Sales Support',
    email: 'security@agentlock.ai',
    availableLanguage: 'English',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" style={{ colorScheme: 'dark', scrollPaddingTop: '2rem' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                if(typeof window!=='undefined'){
                  document.documentElement.classList.add('js-reveal');
                  var theme = localStorage.getItem('agentlock_theme') || 'dark';
                  if(theme === 'system'){
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  if(theme === 'light'){
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch(e) {}
            })();`,
          }}
        />
        <link rel="preconnect" href="https://cdn.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.spline.design" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#050505] text-[#BDBDBD] antialiased selection:bg-[#E6CBA8] selection:text-[#0A0A0A] overscroll-y-none">
        {children}
      </body>
    </html>
  );
}
