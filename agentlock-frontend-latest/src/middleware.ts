import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeNextUrl } from './lib/auth-utils';

// Protected route prefixes that require an authenticated session cookie.
// Change or empty this array if all routes should remain public.
export const PROTECTED_ROUTES: string[] = [
  '/agents',
  '/scans',
  '/reports',
];

export { sanitizeNextUrl };

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionToken =
    request.cookies.get('agentlock_session')?.value ||
    request.cookies.get('session')?.value;
  const isAuthenticated = Boolean(sessionToken);

  // If already authenticated and visiting /login, redirect to / or sanitized next
  if (pathname === '/login') {
    if (isAuthenticated) {
      const nextParam = request.nextUrl.searchParams.get('next');
      const targetUrl = sanitizeNextUrl(nextParam);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const originalPath = `${pathname}${search}`;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', originalPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with extensions (.png, .jpg, .svg, .ico, .txt, .xml, .webmanifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|txt|xml|webmanifest)$).*)',
  ],
};
