import {
  getBackendApiKey,
  isTrustedOrigin,
  readSessionCookie,
  verifySessionToken,
} from '../../../lib/server-auth';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const ALLOWED_METHODS = new Set(['GET', 'POST', 'DELETE']);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const RESPONSE_HEADERS = [
  'accept-ranges',
  'content-disposition',
  'content-range',
  'content-type',
  'retry-after',
];

function jsonError(status: number, detail: string): Response {
  return Response.json(
    { detail },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function readLimitedBody(request: Request): Promise<Uint8Array | null> {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return null;
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

async function proxyToBackend(request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!path?.length || path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) {
    return jsonError(400, 'Invalid API path.');
  }

  const method = request.method.toUpperCase();
  if (!ALLOWED_METHODS.has(method)) {
    return jsonError(405, 'Method not allowed.');
  }

  const isHealthCheck = method === 'GET' && path.length === 1 && path[0] === 'health';
  if (!isHealthCheck) {
    const token = readSessionCookie(request.headers.get('cookie'));
    if (!verifySessionToken(token)) {
      return jsonError(401, 'Authentication required.');
    }
    if (method !== 'GET' && !isTrustedOrigin(request)) {
      return jsonError(403, 'Request origin not allowed.');
    }
  }

  const backendApiKey = getBackendApiKey();
  if (!isHealthCheck && !backendApiKey) {
    return jsonError(503, 'Backend access is not configured.');
  }

  const rawBackendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  let backendUrl: URL;
  try {
    backendUrl = new URL(rawBackendUrl);
  } catch {
    return jsonError(503, 'Backend URL is not configured correctly.');
  }

  if (
    backendUrl.username ||
    backendUrl.password ||
    backendUrl.pathname !== '/' ||
    backendUrl.search ||
    backendUrl.hash ||
    !['http:', 'https:'].includes(backendUrl.protocol) ||
    (process.env.NODE_ENV === 'production' && backendUrl.protocol !== 'https:')
  ) {
    return jsonError(503, 'Backend URL is not configured securely.');
  }

  const incomingUrl = new URL(request.url);
  const encodedPath = path.map((part) => encodeURIComponent(part)).join('/');
  const target = new URL(`/api/${encodedPath}${incomingUrl.search}`, backendUrl.origin);
  const headers = new Headers();
  const accept = request.headers.get('accept');
  const contentType = request.headers.get('content-type');
  if (accept) headers.set('accept', accept);
  if (contentType) headers.set('content-type', contentType);
  if (backendApiKey) headers.set('X-AgentLock-API-Key', backendApiKey);

  let body: Uint8Array | undefined;
  if (method !== 'GET') {
    const limitedBody = await readLimitedBody(request);
    if (limitedBody === null) return jsonError(413, 'Request body is too large.');
    body = limitedBody;
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
      signal: request.signal,
    });
    const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return jsonError(502, 'AgentLock backend is unavailable.');
  }
}

export function GET(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}
