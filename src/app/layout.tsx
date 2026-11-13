import type { Metadata, Viewport } from 'next';
import { WaveGridClientWrapper } from '../components/ui/WaveGridClientWrapper';
import { AgentLockPreloader } from '../components/preloader/AgentLockPreloader';
import { IntroTransition } from '../components/preloader/IntroTransition';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentlock.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AgentLock | AI Agent Vulnerability Scanner & Red Teaming Platform',
  description:
    'Controlled adversarial vulnerability scanning and automated red teaming for AI agents. Detect prompt injection, data leakage, tool abuse, and memory poisoning.',
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
    siteName: 'AgentLock',
    title: 'AgentLock | AI Agent Vulnerability Scanner & Red Teaming Platform',
    description:
      'Controlled adversarial vulnerability scanning and automated red teaming for AI agents. Detect prompt injection, data leakage, tool abuse, and memory poisoning.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AgentLock AI Agent Vulnerability Scanner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentLock | AI Agent Vulnerability Scanner & Red Teaming Platform',
    description:
      'Controlled adversarial vulnerability scanning and automated red teaming for AI agents.',
    images: ['/og-image.png'],
  },
  other: {
    'theme-color': '#060D1F',
  },
};

export const viewport: Viewport = {
  themeColor: '#060D1F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'AgentLock',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any',
      description:
        'AI Agent Vulnerability Scanner and Automated Red Teaming Platform for evaluating autonomous AI agents against prompt injection, data leakage, tool abuse, and memory poisoning.',
      url: SITE_URL,
    },
    {
      '@type': 'Organization',
      name: 'AgentLock',
      url: SITE_URL,
      logo: `${SITE_URL}/android-chrome-512x512.png`,
      description: 'AI Agent Vulnerability Scanner and Automated Red Teaming Platform',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      style={{ colorScheme: 'dark', backgroundColor: '#060D1F' }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-transparent font-sans text-[#F5EDDC] antialiased selection:bg-[#FF6F59] selection:text-[#060D1F] overscroll-y-none relative">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {/* Full-screen Opening Preloader Experience */}
        <AgentLockPreloader />
        {/* Single persistent background canvas */}
        <WaveGridClientWrapper />
        {/* Page content sits above background at z-10 with smooth emergence transition */}
        <IntroTransition>
          {children}
        </IntroTransition>
      </body>
    </html>
  );
}
