import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'agentlock_session';
const SESSION_AGE_SECONDS = 8 * 60 * 60;
const REMEMBERED_SESSION_AGE_SECONDS = 7 * 24 * 60 * 60;

type AuthConfig = {
  email: string;
  password: string;
  sessionSecret: string;
  apiKey: string;
  frontendOrigin: string;
};

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  iss: 'agentlock';
};

export type AgentLockSession = {
  email: string;
  expiresAt: number;
};

function getFrontendOrigin(): string | null {
  const configuredOrigin =
    process.env.AGENTLOCK_FRONTEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  if (!configuredOrigin) return null;

  try {
    const parsedOrigin = new URL(configuredOrigin);
    if (
      parsedOrigin.origin !== configuredOrigin.replace(/\/$/, '') ||
      (process.env.NODE_ENV === 'production' && parsedOrigin.protocol !== 'https:')
    ) {
      return null;
    }
    return parsedOrigin.origin;
  } catch {
    return null;
  }
}

export function getAuthConfig(): AuthConfig | null {
  const email = process.env.AGENTLOCK_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.AGENTLOCK_ADMIN_PASSWORD;
  const sessionSecret = process.env.AGENTLOCK_SESSION_SECRET;
  const apiKey = process.env.AGENTLOCK_API_KEY;
  const frontendOrigin = getFrontendOrigin();

  if (
    !email ||
    !password ||
    password.length < 16 ||
    password.length > 1024 ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret) < 32 ||
    !apiKey ||
    Buffer.byteLength(apiKey) < 32 ||
    !frontendOrigin
  ) {
    return null;
  }

  return { email, password, sessionSecret, apiKey, frontendOrigin };
}

export function getBackendApiKey(): string | null {
  const key = process.env.AGENTLOCK_API_KEY;
  return key && Buffer.byteLength(key) >= 32 ? key : null;
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, 'utf8');
  const rightBytes = Buffer.from(right, 'utf8');
  const length = Math.max(leftBytes.length, rightBytes.length, 1);
  if (length > 4096) return false;

  const paddedLeft = Buffer.alloc(length);
  const paddedRight = Buffer.alloc(length);
  leftBytes.copy(paddedLeft);
  rightBytes.copy(paddedRight);

  const equal = timingSafeEqual(paddedLeft, paddedRight);
  return equal && leftBytes.length === rightBytes.length;
}

export function loginCredentialsMatch(email: string, password: string): boolean {
  const config = getAuthConfig();
  if (!config) return false;

  const emailMatches = constantTimeEqual(email.trim().toLowerCase(), config.email);
  const passwordMatches = constantTimeEqual(password, config.password);
  return emailMatches && passwordMatches;
}

function signature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken(
  email: string,
  remember: boolean,
): { token: string; maxAge: number } | null {
  const config = getAuthConfig();
  if (!config || !constantTimeEqual(email.trim().toLowerCase(), config.email)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAge = remember
    ? REMEMBERED_SESSION_AGE_SECONDS
    : SESSION_AGE_SECONDS;
  const payload: SessionPayload = {
    sub: config.email,
    iat: now,
    exp: now + maxAge,
    jti: randomBytes(16).toString('base64url'),
    iss: 'agentlock',
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const token = `${encodedPayload}.${signature(encodedPayload, config.sessionSecret)}`;
  return { token, maxAge };
}

export function verifySessionToken(token: string | undefined): AgentLockSession | null {
  const config = getAuthConfig();
  if (!config || !token || token.length > 4096) return null;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const expected = Buffer.from(signature(parts[0], config.sessionSecret));
  const presented = Buffer.from(parts[1]);
  if (
    expected.length !== presented.length ||
    !timingSafeEqual(expected, presented)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf8'),
    ) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.iss !== 'agentlock' ||
      payload.sub !== config.email ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      typeof payload.jti !== 'string' ||
      payload.iat > now + 30 ||
      payload.exp <= now ||
      payload.exp - payload.iat > REMEMBERED_SESSION_AGE_SECONDS
    ) {
      return null;
    }

    return { email: payload.sub, expiresAt: payload.exp };
  } catch {
    return null;
  }
}

export function readSessionCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === SESSION_COOKIE_NAME) {
      return item.slice(separator + 1).trim();
    }
  }
  return undefined;
}

export function isTrustedOrigin(request: Request): boolean {
  const frontendOrigin = getFrontendOrigin();
  return Boolean(
    frontendOrigin && request.headers.get('origin') === frontendOrigin,
  );
}

export function sessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}

export function toSessionUser(email: string) {
  return {
    id: 'agentlock-admin',
    email,
    name: email.split('@')[0] || 'AgentLock Administrator',
    role: 'admin',
  };
}
