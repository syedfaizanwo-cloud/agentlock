# AgentLock authentication and API security

## Login model

This release supports one administrator account configured by the deployment environment. It does not include public registration or a user database.

POST /api/auth/login checks AGENTLOCK_ADMIN_EMAIL and AGENTLOCK_ADMIN_PASSWORD, then sets an HMAC-signed agentlock_session cookie. The cookie is HttpOnly, SameSite=Strict, Secure in production, and expires after 8 hours (7 days when Keep me signed in is selected). The browser does not store a bearer token in local or session storage.

GET /api/auth/me returns the configured administrator identity when the signed cookie is valid. POST /api/auth/logout clears the browser cookie. Rotating AGENTLOCK_SESSION_SECRET invalidates every issued session.

Login rejects requests from an unconfigured or mismatched Origin. The process-local login limiter permits five failed attempts per email/IP key in five minutes and returns 429 with Retry-After. This is a defense-in-depth measure; deployments with multiple instances must also use a shared or host-level rate limiter.

## Protecting agent data

The frontend protects /agents, /scans, and /reports. Every data API request also passes through a same-origin Next.js server route that validates the signed session and checks the Origin on state-changing requests. The server route forwards only the required request headers to the fixed backend URL.

The FastAPI data routers require X-AgentLock-API-Key. Configure the same random key, with at least 32 characters, as AGENTLOCK_API_KEY in the frontend and backend environments. Missing or invalid configuration fails closed: data routes return 503 when no key is configured and 401 when the key is absent or incorrect. /api/health remains public and returns service status only. FastAPI docs and the OpenAPI schema are disabled.

## Environment values

Frontend server environment:

- AGENTLOCK_ADMIN_EMAIL
- AGENTLOCK_ADMIN_PASSWORD (at least 16 characters)
- AGENTLOCK_SESSION_SECRET (at least 32 random bytes)
- AGENTLOCK_API_KEY (same value as the backend)
- AGENTLOCK_FRONTEND_ORIGIN (exact origin, including scheme and port)
- BACKEND_URL (HTTPS in production)

Backend environment:

- AGENTLOCK_API_KEY (same value as the frontend)

Never put secrets in variables prefixed with NEXT_PUBLIC_, commit real .env files, or expose the backend API key to browser JavaScript.

## Remaining safeguards before real customer data

This is a single-administrator security baseline, not a complete multi-customer product. It does not provide per-user accounts, MFA, tenant isolation, centralized session revocation, persistent/distributed rate limiting, or database encryption at rest. Logout clears the active browser cookie; if a session secret may have leaked, rotate it to revoke all sessions.

Agent records, scan prompts, findings, evidence, and generated PDF reports are stored in SQLite and on disk without application-level encryption. Use an encrypted host volume, restrict filesystem and backup access, and define retention/deletion rules. Keep the backend on a private network and use HTTPS, a firewall, and host-level rate limits in production. Do not expose the placeholder environment configuration or load real customer data until secrets and deployment controls are set.
