import { NextResponse } from 'next/server';
import { INITIAL_HEARTBEATS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(INITIAL_HEARTBEATS, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
