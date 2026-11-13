import { NextResponse } from 'next/server';
import { INITIAL_SECURITY_SUMMARY } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(INITIAL_SECURITY_SUMMARY, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
