# RFC: Migration to HttpOnly Cookie Authentication
**Status:** Draft
**Target Phase:** Phase 10 (Hardening)
**Priority:** High

---

## 1. Problem Statement
Currently, the application stores JWT tokens in `localStorage` (`auth-store.ts`). While convenient, this exposes the application to **XSS (Cross-Site Scripting)** attacks. If an attacker can execute JavaScript on the page, they can read `localStorage` and exfiltrate the token.

Although we have implemented a strict **Content Security Policy (CSP)** to mitigate XSS, relying solely on CSP is a single layer of defense.

## 2. Proposed Solution
Migrate to **Laravel Sanctum's SPA mode**, which uses `HttpOnly` cookies for session management.

### Key Benefits
1.  **XSS Protection:** JavaScript cannot read `HttpOnly` cookies. Even if an XSS vulnerability exists, the attacker cannot steal the session token.
2.  **CSRF Protection:** Laravel Sanctum automatically handles CSRF protection via the `X-XSRF-TOKEN` cookie.

## 3. Implementation Strategy

### 3.1 Backend Configuration
1.  **CORS:** Ensure `config/cors.php` allows credentials (`supports_credentials = true`) and specifies exact allowed origins (no wildcards).
2.  **Sanctum:** Ensure `SANCTUM_STATEFUL_DOMAINS` includes the frontend domain (e.g., `localhost:3000` or `morningbrew.sg`).
3.  **Session Domain:** Configure `SESSION_DOMAIN` in `.env` to allow cookie sharing if subdomains are used (e.g., `.morningbrew.sg`).

### 3.2 Frontend Refactor
1.  **API Client:** Update `apiFetch` to use `credentials: 'include'` instead of `credentials: 'omit'`.
2.  **Auth Store:** Remove `localStorage` logic. The store should only track `isAuthenticated` state, not the token itself.
3.  **CSRF Handshake:** Before making a request, the frontend must call `/sanctum/csrf-cookie` to set the initial CSRF token.

## 4. Migration Steps

### Step 1: CSRF Endpoint
Add a call to `GET /sanctum/csrf-cookie` in the app initialization (e.g., `AuthProvider`).

### Step 2: Update `apiFetch`
```typescript
// Current
credentials: 'omit',
headers: { Authorization: `Bearer ${token}` }

// Proposed
credentials: 'include',
// No Authorization header needed (cookie handles it)
```

### Step 3: Backend Validation
Verify that `EnsureFrontendRequestsAreStateful` middleware is active for API routes.

## 5. Risks & Mitigation
*   **CORS Complexity:** Misconfigured CORS will block all requests. **Mitigation:** Strict testing of `Access-Control-Allow-Origin` headers.
*   **Local Development:** `localhost` vs `127.0.0.1` mismatches can break cookie setting. **Mitigation:** Standardize on `localhost` in `.env`.

---

## 6. Decision Record
*   **Accepted:** TBD
*   **Date:** TBD
