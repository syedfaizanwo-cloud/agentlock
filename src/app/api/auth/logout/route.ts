import { NextResponse } from 'next/server';

import {
  isTrustedOrigin,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from '../../../../lib/server-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { detail: 'Request origin not allowed.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
