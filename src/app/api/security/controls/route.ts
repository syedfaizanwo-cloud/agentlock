import { NextResponse } from 'next/server';
import { INITIAL_SECURITY_CONTROLS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(INITIAL_SECURITY_CONTROLS, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
