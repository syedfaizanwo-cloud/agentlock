import React from 'react';
import type { Metadata } from 'next';
import { LoginFormClient } from './LoginFormClient';

export const metadata: Metadata = {
  title: 'Log in',
  description:
    'Log in to your AgentLock security command center to manage agents, launch red teaming scans, and review vulnerability findings.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const nextParam =
    typeof searchParams?.next === 'string' ? searchParams.next : undefined;
  return <LoginFormClient initialNext={nextParam} />;
}
