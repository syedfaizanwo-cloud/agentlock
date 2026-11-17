import { NextResponse } from 'next/server';

import {
  readSessionCookie,
  toSessionUser,
  verifySessionToken,
} from '../../../../lib/server-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const token = readSessionCookie(request.headers.get('cookie'));
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = NextResponse.json({ user: toSessionUser(session.email) });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
