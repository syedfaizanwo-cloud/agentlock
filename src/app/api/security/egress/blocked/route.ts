import { NextResponse } from 'next/server';
import { INITIAL_EGRESS_BLOCKED } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(INITIAL_EGRESS_BLOCKED, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
