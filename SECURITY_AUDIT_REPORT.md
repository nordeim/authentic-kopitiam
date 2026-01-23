# Critical Security Audit & Code Review Report
**Date:** January 23, 2026
**Scope:** "No Next Routes" Resolution, Authentication, Authorization, Compliance
**Auditor:** Gemini CLI Agent

---

## 1. Executive Summary

This audit validates the **Direct-to-Backend** architectural decision ("No Next routes") and reviews the security posture of the Morning Brew Collective platform. The implementation adheres to modern Single Page Application (SPA) standards and effectively mitigates the "missing proxy" blocker.

**Overall Security Rating:** 🟠 **Medium-High** (Sound architecture, but high reliance on client-side security hygiene due to `localStorage` usage).

**Compliance Status:**
- **MAS TRM (Technology Risk Management):** Mostly Compliant (Direct logging, distinct auth). Gap: Token storage mechanism (localStorage vs. HttpOnly cookies).
- **PDPA:** Compliant (Consent endpoints exist, data minimization in API).
- **PCI-DSS:** Out of Scope (Stripe handles PAN).

---

## 2. "No Next Routes" Resolution Audit

### Architecture: Direct-to-Backend
The decision to bypass Next.js API routes (`src/app/api/*`) and call Laravel directly (`NEXT_PUBLIC_API_URL`) is **architecturally sound** and standard for "BFF" (Backend for Frontend) patterns where the frontend is a standalone static artifact.

**Validated Implementation:**
- **File:** `frontend/src/lib/api/api-fetch.ts`
- **Mechanism:**
    - Normalizes `NEXT_PUBLIC_API_URL`.
    - Appends `/v1` automatically.
    - **Security Control:** Sets `credentials: 'omit'` (prevents unintentional cookie transmission, mitigating CSRF).
    - **Auth Injection:** Manually injects `Authorization: Bearer` header.

**Security Implications:**
- ✅ **Reduced Attack Surface:** Eliminates the Next.js Node.js server as a potential proxy vulnerability or point of failure.
- ✅ **Audit Accuracy:** Backend logs receive the client's actual IP address directly, essential for forensic investigations (MAS TRM requirement).
- ⚠️ **Exposure:** `NEXT_PUBLIC_API_URL` is exposed to the client. This is acceptable for public APIs but requires the backend to be hardened (DDoS protection, Rate Limiting).

---

## 3. Authentication & Authorization Review

### Token Storage (Critical Risk)
- **Current State:** Tokens stored in `localStorage` (`auth-store.ts`).
- **Risk:** **XSS (Cross-Site Scripting)**. If an attacker injects malicious scripts, they can read `localStorage` and exfiltrate the session token.
- **Mitigation Status:** ❌ No Content Security Policy (CSP) detected in `next.config.ts`.
- **Recommendation:** Implement a strict CSP immediately. Ideally, migrate to `HttpOnly` Secure Cookies (Sanctum SPA mode) in Phase 9 (Hardening), though `localStorage` is acceptable for MVP if CSP is strict.

### Zero-Trust Middleware (`VerifyOrderOwnership.php`)
- **Logic:**
    1.  **Auth User:** Checks `order.user_id === user.id`.
    2.  **Guest:** Requires `customer_email` AND `invoice_number`.
- **Findings:**
    - ✅ **Logic is Sound:** Prevents IDOR (Insecure Direct Object Reference) by requiring dual-factor knowledge for guests (Invoice # is sequential/guessable, but Email is private).
    - ⚠️ **Timing Attack:** The string comparison `$order->invoice_number !== $request->invoice_number` is not constant-time.
        - *Severity:* Low (Network latency masks timing differences).
        - *Fix:* Use `hash_equals()` for credential comparison.
    - ✅ **Rate Limiting:** Protected by global `throttle:api` middleware in `routes/api.php`.

### Permissions
- **Admin Access:** Enforced by `EnsureUserIsAdmin` middleware on the backend. Frontend `ProtectedRoute` is UX-only (as it should be).
- **Separation:** Admin routes are isolated under `/api/v1/admin/*`.

---

## 4. Compliance Check (Singapore Context)

### MAS TRM Guidelines (Technology Risk Management)
- **Cryptography:**
    - ✅ **Transmission:** All traffic must be HTTPS (Production requirement).
    - ✅ **At Rest:** Stripe/PayNow secrets are server-side.
- **Access Control:**
    - ✅ **MFA:** Not currently implemented (Future requirement for Admin accounts).
    - ✅ **Session:** Sanctum tokens have expiration (configured in `sanctum.php`).

### PDPA (Personal Data Protection Act)
- **Data Minimization:** API returns only necessary user fields.
- **Consent:** Explicit `PdpaConsentController` handles tracking.

---

## 5. Vulnerability Assessment

| Vulnerability | Status | Mitigation |
| :--- | :--- | :--- |
| **CSRF** | ✅ Low Risk | `credentials: 'omit'` + Bearer tokens usage effectively mitigates CSRF. |
| **XSS** | 🔴 High Risk | `localStorage` token storage is vulnerable. **Action Required: Add CSP.** |
| **IDOR** | ✅ Secure | `VerifyOrderOwnership` middleware enforces ownership checks. |
| **Injection** | ✅ Secure | Eloquent ORM prevents SQL Injection. |
| **Brute Force** | ⚠️ Medium | Guest order lookup relies on Email+Invoice. If Invoice is sequential (`INV-001`, `INV-002`), an attacker only needs the email. **Mitigation:** Rate limiting is active. |

---

## 6. Recommendations & Action Plan

1.  **Immediate (Critical):** Implement **Content Security Policy (CSP)** in `next.config.ts` to mitigate XSS risks associated with `localStorage`.
    ```javascript
    // Example Header
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.morningbrew.sg; ..."
    }
    ```
2.  **Short Term:** Hardcode `NEXT_PUBLIC_API_URL` to HTTPS in production environment variables to prevent downgrade attacks.
3.  **Long Term:** Consider migrating to `HttpOnly` cookies for token storage to provide defense-in-depth against XSS.

---

**Auditor Sign-off:**
The current "No Next routes" implementation is **approved for development/pre-production**, provided the CSP recommendation is implemented before public launch.
