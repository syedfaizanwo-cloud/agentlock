import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Password reset instructions for AgentLock enterprise accounts.',
  alternates: {
    canonical: '/forgot-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-coral/10 border border-coral/30 text-coral mx-auto flex items-center justify-center">
        <KeyRound className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold font-display text-cream">
          Password Reset
        </h1>
        <p className="text-xs text-cream-muted font-sans leading-relaxed">
          AgentLock access is managed through enterprise identity systems. Contact your internal security administrator to reissue your access credentials.
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
