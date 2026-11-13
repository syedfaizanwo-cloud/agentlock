import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | AgentLock 2.0',
  description:
    'Thank you for contacting AgentLock 2.0. Our zero-trust security engineering team will review your fleet profile and respond within 1 business day.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
