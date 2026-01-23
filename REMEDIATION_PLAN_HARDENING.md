# Remediation Plan: Security Hardening & CSP Implementation
**Project:** Morning Brew Collective
**Date:** January 23, 2026
**Priority:** High (Pre-Production Hardening)
**Status:** Planned

---

## 1. Executive Summary

This remediation plan addresses the critical security findings from the **January 23, 2026 Security Audit**. The primary objective is to mitigate the **XSS risk** inherent in `localStorage` token storage by implementing a strict **Content Security Policy (CSP)** and reinforcing **HTTPS** usage.

**Success Criteria:**
1.  ✅ Frontend applies a strict CSP header that blocks unauthorized scripts/connections.
2.  ✅ Backend requests are strictly allowed only to the defined `NEXT_PUBLIC_API_URL`.
3.  ✅ HTTPS is enforced in production configurations.
4.  ✅ No functionality (Stripe, Fonts, API) is broken by the new security headers.

---

## 2. Implementation Plan

### Phase 9A: Content Security Policy (CSP) Implementation (Critical)

**Context:** Next.js 15 config (`frontend/next.config.ts`) currently has basic headers. We will inject a robust CSP.

**Policy Definition:**
```text
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://*.stripe.com https://*.amazonaws.com https://morningbrew.sg;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://api.stripe.com https://maps.googleapis.com ${NEXT_PUBLIC_API_URL};
frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
```
*Note: `'unsafe-inline'` and `'unsafe-eval'` are necessary for Next.js/React hydration and Tailwind in the current architecture without a strict Nonce-based setup, which is out of scope for this immediate fix. They still provide significant protection against external script injection.*

**Action Items:**
- [ ] **9A-1**: Update `frontend/next.config.ts`.
    -   Define `cspHeader` string using the policy above.
    -   Dynamically include `process.env.NEXT_PUBLIC_API_URL` in `connect-src`.
    -   Add `Content-Security-Policy` to the `headers()` function.
- [ ] **9A-2**: Add complementary security headers.
    -   `Strict-Transport-Security` (HSTS): `max-age=63072000; includeSubDomains; preload`
    -   `Permissions-Policy`: `camera=(), microphone=(), geolocation=()` (unless map features need geo).

### Phase 9B: HTTPS & Transport Security

**Context:** `backend/.env.example` shows `http://`. Production must be `https://`.

**Action Items:**
- [ ] **9B-1**: Update `backend/app/Providers/AppServiceProvider.php` (Verification).
    -   Ensure `URL::forceScheme('https')` is active in production environments.
- [ ] **9B-2**: Verify Frontend API Client.
    -   Review `frontend/src/lib/api/api-fetch.ts` to ensure it doesn't downgrade to HTTP if the env var is HTTPS. (Already verified: it respects the env var).

### Phase 9C: Authentication Hardening (Roadmap)

**Context:** Moving away from `localStorage` to `HttpOnly` cookies is the gold standard but requires significant architectural changes to `sanctum` config and frontend fetchers.

**Action Items:**
- [ ] **9C-1**: Create `docs/RFC_AUTH_MIGRATION.md`.
    -   Document the strategy for migrating to `credentials: 'include'` and Sanctum SPA mode for Phase 10.

---

## 3. Validation Checklist (Pre-Merge)

### Automated Checks
- [ ] `npm run build` in `frontend/` succeeds with new headers.
- [ ] `make test-frontend` passes.

### Manual Verification
- [ ] **Browser Console**: No "Refused to load..." CSP errors in DevTools during:
    -   Login/Register flow.
    -   Checkout (Stripe Elements loading).
    -   Browsing (Images loading).
- [ ] **API Connectivity**: `apiFetch` successfully calls the backend.
- [ ] **Stripe**: Payment form renders (iframe loads).

---

## 4. Rollback Strategy

If the CSP breaks critical functionality (e.g., Stripe payments fail to load):
1.  **Revert**: Comment out the `Content-Security-Policy` key in `frontend/next.config.ts`.
2.  **Redeploy**: Push the config change immediately.
3.  **Diagnose**: Check browser console for the specific blocked resource and add it to the allowlist.

---

**Plan Approved By:** Gemini CLI Auditor
**Date:** Jan 23, 2026
