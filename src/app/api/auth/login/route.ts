import { NextResponse } from 'next/server';

import {
  createSessionToken,
  getAuthConfig,
  isTrustedOrigin,
  loginCredentialsMatch,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  toSessionUser,
} from '../../../../lib/server-auth';

export const runtime = 'nodejs';

const WINDOW_MS = 5 * 60 * 1000;
const MAX_FAILURES = 5;
const attempts = new Map<string, { count: number; windowStartedAt: number }>();

function jsonError(status: number, detail: string, headers?: HeadersInit) {
  return NextResponse.json(
    { detail },
    {
      status,
      headers: { 'Cache-Control': 'no-store', ...Object.fromEntries(new Headers(headers)) },
    },
  );
}

async function readLimitedText(request: Request, maxBytes: number): Promise<string | null> {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function rateLimitKeys(request: Request, email: string): string[] {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return [`ip:${realIp || forwarded || 'unknown'}`, `email:${email}`];
}

function blockedFor(keys: string[], now: number): number {
  let retryAfter = 0;
  for (const key of keys) {
    const entry = attempts.get(key);
    if (!entry) continue;
    if (now - entry.windowStartedAt >= WINDOW_MS) {
      attempts.delete(key);
      continue;
    }
    if (entry.count >= MAX_FAILURES) {
      retryAfter = Math.max(
        retryAfter,
        Math.ceil((entry.windowStartedAt + WINDOW_MS - now) / 1000),
      );
    }
  }
  return retryAfter;
}

function recordFailure(keys: string[], now: number): void {
  for (const key of keys) {
    const entry = attempts.get(key);
    if (!entry || now - entry.windowStartedAt >= WINDOW_MS) {
      attempts.set(key, { count: 1, windowStartedAt: now });
    } else {
      entry.count += 1;
    }
  }

  if (attempts.size > 5000) {
    for (const [key, entry] of attempts) {
      if (now - entry.windowStartedAt >= WINDOW_MS) attempts.delete(key);
    }
    while (attempts.size > 5000) {
      const oldestKey = attempts.keys().next().value;
      if (!oldestKey) break;
      attempts.delete(oldestKey);
    }
  }
}

export async function POST(request: Request) {
  const config = getAuthConfig();
  if (!config) {
    return jsonError(503, 'Authentication is not configured.');
  }
  if (!isTrustedOrigin(request)) {
    return jsonError(403, 'Request origin not allowed.');
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return jsonError(415, 'A JSON login request is required.');
  }

  let body: unknown;
  try {
    const raw = await readLimitedText(request, 4096);
    if (raw === null) return jsonError(413, 'Request body is too large.');
    body = JSON.parse(raw);
  } catch {
    return jsonError(400, 'Invalid login request.');
  }

  if (!body || typeof body !== 'object') {
    return jsonError(400, 'Invalid login request.');
  }

  const payload = body as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const remember = payload.remember === true;
  if (email.length > 254 || password.length > 1024) {
    return jsonError(401, 'Invalid email or password.');
  }

  const keys = rateLimitKeys(request, email || 'invalid');
  const now = Date.now();
  const retryAfter = blockedFor(keys, now);
  if (retryAfter > 0) {
    return jsonError(429, 'Too many failed attempts. Try again later.', {
      'Retry-After': String(retryAfter),
    });
  }

  if (!loginCredentialsMatch(email, password)) {
    recordFailure(keys, now);
    return jsonError(401, 'Invalid email or password.');
  }

  for (const key of keys) attempts.delete(key);
  const session = createSessionToken(email, remember);
  if (!session) {
    return jsonError(503, 'Authentication is not configured.');
  }

  const response = NextResponse.json({ user: toSessionUser(email) });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    session.token,
    sessionCookieOptions(session.maxAge),
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
