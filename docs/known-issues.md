# Known Issues & Blockers (As of January 22, 2026)

## 🔴 CRITICAL (Deployment Blockers)

*None at this time. Frontend build passes successfully.*

---

## 🟡 HIGH (Quality & Reliability)

### 1. Frontend Test Coverage (Infrastructure Ready, Tests Missing)
**Status:** IMPLEMENTATION NEEDED
**ETA:** 8-12 hours to implement

**Current State:**
- ✅ Vitest & Playwright configured
- ✅ Directory structure exists
- ❌ Actual test files missing (unit/e2e/visual directories empty)

**Next Steps:**
1. Write unit tests for `retro-*` components
2. Implement E2E test suite for Checkout flow
3. Implement Visual Regression tests

---

## 🟢 MEDIUM (Polish & Warnings)

### 2. Next.js Metadata Deprecation Warnings
**Status:** WARNING (Non-Blocking)
**Impact:** Build log noise, future compatibility
**Log Output:**
```
⚠ Unsupported metadata viewport is configured in metadata export in /admin/orders. Please move it to viewport export instead.
⚠ Unsupported metadata themeColor is configured in metadata export...
```
**Affected Routes:** 13 pages (Admin, Checkout, Heritage, Locations, Menu)
**Fix:** Move `viewport` and `themeColor` from `metadata` export to separate `viewport` export (Next.js 15 standard).

### 3. Invoice Service Tests (Database Dependency)
**Status:** CONFIGURATION ISSUE
**Root Cause:** Tests require Docker containers running (Postgres/Redis)
**Impact:** Cannot run `php artisan test` in isolation
**Next Steps:** Update documentation to clarify `make up` requirement.

---

## 🦺 LOW (Technical Debt)

### 4. ESLint Disabled During Build
**Status:** TEMPORARY BYPASS
**Location:** `frontend/next.config.ts`
**Config:** `ignoreDuringBuilds: true`
**Next Steps:** Fix linting errors in `lib/payment-error-handler.ts` and re-enable.

### 5. Historical Backup Files
**Status:** CLEANUP NEEDED
**Location:** `backend/app/Services/backups/`, `backend/tests/Api/*.bak`
**Next Steps:** Move to `.git/backups/` or delete.

---

## Resolved Issues (Jan 22, 2026)
- ✅ **TypeScript Compilation (42 Errors)** - FIXED
- ✅ **Missing Loader-Icon** - FIXED (Component verified)
- ✅ **Frontend Test Infrastructure** - FIXED (Config verified)
- ✅ **README.md Accuracy** - FIXED

---

## Deployment Readiness Checklist

**Deployment is safe when:**
- [x] TypeScript compilation returns 0 errors
- [x] Frontend build succeeds
- [ ] Frontend tests implemented (Recommended)
- [ ] InvoiceService tests run successfully (Recommended)

---

**Document Version:** 1.1.0  
**Last Updated:** January 22, 2026  
**Next Review:** After Frontend Test Implementation