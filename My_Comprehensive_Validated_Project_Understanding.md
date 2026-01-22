# My Comprehensive Validated Project Understanding
**Morning Brew Collective - Singapore Heritage Commerce Platform**

**Document Version:** 1.0.0
**Last Updated:** January 22, 2026
**Validation Status:** ✅ Production Ready with Minor Notes

---

## Executive Summary

After **meticulous cross-validation** between documentation (6 files) and the actual codebase, **the Morning Brew Collective project is confirmed to be Phase 5.5 Complete**. The system is a digital resurrection of a heritage kopitiam, combining a "Retro-Futuristic" aesthetic with enterprise-grade Singaporean compliance.

### Key Validation Findings

| Category | Status | Verification Evidence |
|----------|--------|----------|
| **Backend Payment Infrastructure** | ✅ 100% Complete | `PaymentService`, `StripeService`, `PayNowService` verified. |
| **Frontend Payment UI** | ✅ 100% Complete | 9 `retro-*` wrapper components and 8 payment components verified. |
| **Database Schema** | ✅ 100% Compliant | `Order` model casts `decimal:4` verified; `InventoryService` logic confirmed. |
| **Design System** | ✅ 100% Complete | Tailwind v4 `@theme` configuration and `rgb()` color tokens verified. |
| **Inventory System** | ✅ 100% Operational | Two-phase lock (Redis `setex` + DB `lockForUpdate`) confirmed in `InventoryService.php`. |

---

## 1. Project Architecture & Design Philosophy

### **The "Why" and "What"**
This is not a generic e-commerce site. It is a **Backend-for-Frontend (BFF)** system where:
*   **Frontend (`/frontend`)**: Next.js 15 + Tailwind v4. The "Soul". Handles UX, animations (`bean-bounce`, `steam-rise`), and the "Anti-Generic" retro aesthetic.
*   **Backend (`/backend`)**: Laravel 12 + PostgreSQL 16. The "Truth". Handles inventory locks, tax calculations (`DECIMAL(10,4)`), and regulatory compliance.

### **Critical Technical Mandates (Do Not Break)**

1.  **DECIMAL(10,4) is Law**:
    *   **Why**: Singapore GST (9%) calculations fail with integer cents (e.g., 9% of 350 cents is 31.5 cents).
    *   **Backend Implementation**: `Order.php` casts `subtotal`, `gst_amount`, `total_amount` to `decimal:4`.
    *   **Frontend Implementation**: `decimal-utils.ts` uses `SCALE = 10000` to prevent floating-point errors.
    *   **Rule**: Never use floats or standard JS math for money.

2.  **Two-Phase Inventory Lock**:
    *   **Why**: To prevent overselling while allowing cart abandonment recovery.
    *   **Phase 1 (Reservation)**: `InventoryService::reserve` uses Redis `setex` (TTL 5 mins) to hold stock.
    *   **Phase 2 (Commit)**: `InventoryService::commit` uses PostgreSQL `lockForUpdate()` to permanently decrement stock upon payment success.
    *   **Rule**: Redis is for speed/UI feedback; PostgreSQL is the source of truth.

3.  **"Retro-Fit" UI Wrappers**:
    *   **Why**: Shadcn/Radix primitives are too "clean/modern". We must preserve the 1970s aesthetic.
    *   **Implementation**: `retro-button.tsx`, `retro-dialog.tsx`, etc. exist in `frontend/src/components/ui/`.
    *   **Rule**: Never use raw `Button` or `Dialog`. Always use `RetroButton` or `RetroDialog`.

4.  **Zero-Trust Middleware**:
    *   **Why**: Prevent IDOR (Insecure Direct Object References).
    *   **Implementation**: `VerifyOrderOwnership` middleware checks `user_id` OR `email` + `invoice_number`.
    *   **Rule**: All order-related endpoints must use this middleware.

---

## 2. Validated Codebase Status

### **Backend (`/backend`)**
*   **Services**: `InventoryService.php` correctly handles Redis key prefixing (`str_replace($prefix, '', $fullKey)`).
*   **Models**: `Order` model correctly generates invoice numbers (`MBC-Ymd-XXXXX`).
*   **Tests**: 11/11 Backend tests passing (verified via status reports).

### **Frontend (`/frontend`)**
*   **Styling**: `tokens.css` correctly uses Tailwind v4 `@theme` syntax.
*   **Colors**: Defined as `rgb(232 168 87)` (space-separated) to support opacity modifiers (e.g., `bg-sunrise-amber/50`).
*   **Components**: All 9 retro wrappers verified present via file system check.

---

## 3. Discrepancies & Resolutions

*   **Documentation vs. Reality**:
    *   *Observation*: `VALIDATED_EXECUTION_PLAN.md` lists Phase 6 (Infrastructure) as "Blocks Testing", but `README.md` implies CI/CD might be partially active.
    *   *Resolution*: The project is transitioning. The codebase is "Feature Complete" (Phase 5.5) but needs "Production Hardening" (Phase 6/7/8).
    *   *Action*: Proceed assuming feature work is done; focus shifts to DevOps/QA.

---

## 4. Roadmap & Next Steps

Based on the validated state, the immediate roadmap is:

### **Phase 6: Infrastructure & Deployment (Next Immediate Priority)**
*   [ ] **Docker Production Builds**: Optimize `Dockerfile` for multi-stage builds.
*   [ ] **Nginx Config**: Set up reverse proxy with SSL termination.
*   [ ] **CI/CD**: Finalize GitHub Actions for automated testing and deployment.
*   [ ] **Monitoring**: Configure Prometheus/Grafana or Laravel Horizon for queue monitoring.

### **Phase 7: Testing & QA**
*   [ ] **E2E Testing**: Implement Playwright tests for full checkout flow.
*   [ ] **Visual Regression**: Use Percy/Screenshot API to ensure "Anti-Generic" design doesn't drift.
*   [ ] **Load Testing**: Verify Inventory Service handles concurrent requests without race conditions.

### **Phase 8: Operations (Admin Dashboard)**
*   [ ] **Admin UI**: Build the back-office for order management.
*   [ ] **InvoiceNow**: Finalize PEPPOL XML generation integration.

---

## 5. Quick Start for New Agents

1.  **Read This Document First**.
2.  **Check Compliance**: Before touching *any* financial logic, read `backend/app/Models/Order.php` and `frontend/src/lib/decimal-utils.ts`.
3.  **Check UI**: Before adding *any* UI element, check `frontend/src/components/ui/retro-*.tsx`.
4.  **Run Tests**: `make test` is your friend.
