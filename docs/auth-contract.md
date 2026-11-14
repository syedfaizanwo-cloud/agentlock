# AgentLock Authentication API Contract

This document specifies the exact REST API contract for authentication endpoints required by the frontend.

## Overview

- Authentication is session-cookie based.
- The session cookie must be `httpOnly`, `Secure` (in production), and `SameSite=Lax`.
- The frontend never stores access tokens or credentials in `localStorage` or `sessionStorage`.

## Endpoints

### 1. User Login

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecretPassword123!",
    "remember": true
  }
  ```
- **Responses**:
  - **`200 OK`**:
    Sets the session cookie header:
    ```http
    Set-Cookie: agentlock_session=<session_token>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
    ```
    Response payload:
    ```json
    {
      "user": {
        "id": "usr_99812",
        "email": "user@example.com",
        "name": "Security Lead"
      }
    }
    ```
  - **`401 Unauthorized`**:
    When credentials are invalid. Response payload:
    ```json
    {
      "detail": "Invalid email or password"
    }
    ```
    *Note: Do not disclose whether email or password was the incorrect field.*
  - **`429 Too Many Requests`**:
    When rate limits are exceeded (e.g. 5 failed attempts within 5 minutes).
    Header:
    ```http
    Retry-After: 60
    ```
    Response payload:
    ```json
    {
      "detail": "Too many failed attempts. Please try again later."
    }
    ```
  - **`500 Internal Server Error`**:
    When the database or auth service is temporarily unavailable.

### 2. User Logout

- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Request**: Empty body with session cookie.
- **Responses**:
  - **`200 OK`**:
    Clears the cookie:
    ```http
    Set-Cookie: agentlock_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0
    ```
    Response payload:
    ```json
    {
      "ok": true
    }
    ```

### 3. Current User Verification

- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Request**: Cookie credentials included.
- **Responses**:
  - **`200 OK`**:
    ```json
    {
      "user": {
        "id": "usr_99812",
        "email": "user@example.com",
        "name": "Security Lead"
      }
    }
    ```
  - **`401 Unauthorized`**:
    When cookie is missing, expired, or invalid.

## Security and CSRF Protection

- Because sessions rely on cookies, the backend must enforce CSRF defenses:
  - Option A (Recommended): Validate the `Origin` and `Referer` headers on all state-changing methods (`POST`, `PUT`, `DELETE`). Reject requests whose origin does not match the configured frontend domain.
  - Option B: Use double-submit CSRF tokens.
