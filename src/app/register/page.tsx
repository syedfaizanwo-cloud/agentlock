import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise Access',
  description: 'Enterprise access to AgentLock AI agent vulnerability evaluation platform.',
  alternates: {
    canonical: '/register',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-coral/10 border border-coral/30 text-coral mx-auto flex items-center justify-center">
        <UserPlus className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold font-display text-cream">
          Enterprise Account Access
        </h1>
        <p className="text-xs text-cream-muted font-sans leading-relaxed">
          AgentLock accounts are provisioned directly for security operations teams and verified AI developers. To onboard your team, contact your organization administrator.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-mono text-coral hover:underline focus:outline-none focus:ring-2 focus:ring-coral rounded px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Log in</span>
        </Link>
      </div>
    </div>
  );
}
