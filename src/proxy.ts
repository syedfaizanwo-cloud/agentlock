import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/server-auth';
import { sanitizeNextUrl } from './lib/auth-utils';

export const PROTECTED_ROUTES = ['/agents', '/scans', '/reports'];

export { sanitizeNextUrl };

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    const loginUrl = new URL('/login', request.url);
    const next = sanitizeNextUrl(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (next !== '/') loginUrl.searchParams.set('next', next);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'Cookie');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes (each API route checks its own session)
     * - _next/static and _next/image
     * - public static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|ico|txt|xml|webmanifest)$).*)',
  ],
};
