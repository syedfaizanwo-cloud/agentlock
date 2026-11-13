import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeNextUrl } from './lib/auth-utils';

// Public routes for hackathon demonstration. Authentication is not enforced by the backend.
export const PROTECTED_ROUTES: string[] = [];

export { sanitizeNextUrl };

export function middleware(_request: NextRequest) {
  // All demo routes (/, /agents, /scans, /reports, /faq) are accessible without session cookies
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with extensions (.png, .jpg, .jpeg, .svg, .ico, .txt, .xml, .webmanifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|txt|xml|webmanifest)$).*)',
  ],
};
