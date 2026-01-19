# CLAUDE.md - Developer Briefing & Project Context

**Project:** Morning Brew Collective  
**Type:** Singapore-First Headless Commerce Platform  
**Aesthetic:** 1970s Retro Kopitiam with Avant-Garde Minimalism  
**Status:** Phase 2 (Frontend Architecture) In Progress

---

## 1. Executive Summary
This project is not a generic e-commerce site; it is a **digital resurrection of a heritage kopitiam**. We combine a "Retro-Futuristic" aesthetic (warm colors, rounded corners, nostalgic typography) with enterprise-grade transaction capabilities (real-time inventory, Singapore compliance).

**Core Philosophy:**
*   **Anti-Generic:** We reject "AI slop" and standard Bootstrap grids. Every pixel must serve the "Sunrise at the Kopitiam" narrative.
*   **Meticulous Execution:** We validate every step before implementation. We do not guess; we verify.
*   **BFF Architecture:** 
    *   **Frontend (Next.js 15):** The "Soul" – Handles UX, aesthetics, and micro-interactions.
    *   **Backend (Laravel 12):** The "Truth" – Handles data integrity, inventory locks, and compliance logic.

---

## 2. Technology Stack & Conventions

### Frontend (`/frontend`)
*   **Framework:** Next.js 15 (App Router), React 19.
*   **Language:** TypeScript 5.4 (Strict Mode).
*   **Styling:** Tailwind CSS 4.0 + CSS Variables (`tokens.css`).
*   **Components:** **DO NOT** use raw Shadcn/Radix primitives. You **MUST** use the `retro-*` wrappers (e.g., `retro-button.tsx`) located in `src/components/ui/` to maintain the 70s aesthetic.
*   **State:** Zustand for client state (Cart, Filters).
*   **Testing:** Vitest, Playwright.

### Backend (`/backend`)
*   **Framework:** Laravel 12 (API-First).
*   **Language:** PHP 8.3.
*   **Database:** PostgreSQL 16.
    *   **Critical:** Financial values (prices, tax) MUST use `DECIMAL(10,4)` to handle Singapore GST (9%) precision correctly.
*   **Cache/Queue:** Redis 7 (Alpine).
*   **Authentication:** Laravel Sanctum.

### Infrastructure (`/infra`)
*   **Environment:** Docker & Docker Compose (`morning-brew-network`).
*   **Reverse Proxy:** Nginx (planned).
*   **Local Dev:** Mailpit (Port 8025) for email capture.

---

## 3. Current Project State (As of Jan 16, 2026)

### ✅ Completed
*   **Phase 0 (Infrastructure):** Docker Compose, Makefile, and Monorepo structure are fully operational.
*   **Phase 1 (Design System):** 
    *   Tokens extracted to `frontend/src/styles/tokens.css`.
    *   Retro-fit Shadcn wrappers implemented (`retro-dialog`, `retro-button`, etc.).
    *   Tailwind config mapped to tokens.
*   **Backend Scaffolding:** Laravel 12 skeleton created manually with API-first configuration (`bootstrap/app.php`) and Singapore timezone defaults. Dependencies installed.

### 🚧 In Progress (Phase 2)
*   **Frontend Architecture:** Next.js App Router structure is being built.
    *   `layout.tsx` and `page.tsx` (Hero) exist but need refinement.
    *   **Missing:** `menu/page.tsx`, `heritage/page.tsx`, `locations/page.tsx`, and comprehensive Header/Footer logic.
*   **Decorative Components:** Animation primitives (`fade-in.tsx`) exist, but higher-level decorative components (`SunburstBackground`, `FloatingCoffeeCup`) need implementation.

---

## 4. Operational Guide & Commands

The project uses a `Makefile` to standardize workflows. **Always use these commands.**

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Dev** | `make up` | Starts all Docker containers (Front, Back, DB, Redis). |
| **Stop Dev** | `make down` | Stops and removes containers. |
| **View Logs** | `make logs` | Tails logs for all services. |
| **Install Deps** | `make install` | Runs `npm install` and `composer install`. |
| **Shell (Back)**| `make shell-backend` | Bash access to Laravel container. |
| **Shell (Front)**| `make shell-frontend` | Shell access to Next.js container. |
| **Migrate DB** | `make migrate` | Runs Laravel migrations. |
| **Testing** | `make test` | Runs both Frontend and Backend tests. |

---

## 5. Critical Compliance & Implementation Mandates

### 1. Singapore Compliance
*   **GST (9%):** Display prices inclusive of GST. Store as `DECIMAL` (not integer cents) to avoid rounding errors on tax calculation.
*   **PDPA:** User consent must be logged with IP, User Agent, and Timestamp. Use the `audit.consent_records` table (defined in `init.sql`).
*   **PayNow:** Integration via Stripe is required.

### 2. "Anti-Generic" Design
*   **No Standard Grids:** Use `retro-*` components.
*   **Motion:** Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for that specific "bounce" feel.
*   **Typography:** Strict adherence to `Fraunces` (Headings) and `DM Sans` (Body).

### 3. Workflow
*   **Validation:** Do not write code without validating the plan against `MASTER_EXECUTION_PLAN.md` and `static_landing_page_mockup.html`.
*   **Files:** When creating new files, ensure they are registered in the correct directory (e.g., `frontend/src/components/ui` vs `frontend/src/components/animations`).

---

## 7. Testing Philosophy

### Test Failure Categories

**Type 1: Infrastructure Setup Failures**
- Missing migrations: `SQLSTATE[42P01] relation "table" does not exist`
- Permission issues: `EACCES: permission denied`
- Container health: PostgreSQL not ready, Redis connection refused
- **Prevention**: Always verify docker containers healthy before testing

**Type 2: Logic/Implementation Failures**
- Business rule violations: expected vs actual behavior mismatch
- Edge case handling: null values, boundary conditions
- **Remediation**: Add unit tests for the specific failing logic, then fix

**Type 3: Schema/Constraint Failures**
- Foreign key violations: `SQLSTATE[23503] foreign key constraint`
- Unique constraint violations: `SQLSTATE[23505] unique constraint`
- **Remediation**: Check database constraints vs application logic

**Type 4: Transaction/Race Condition Failures**
- Concurrent access: race conditions in Redis operations
- Deadlocks: concurrent database writes
- **Remediation**: Use proper locking, atomic operations, retry logic

**Type 5: Integration/Authentication Failures**
- Middleware blocking: 401, 403 when expecting 200
- Request validation: 422 with validation errors
- **Remediation**: Provide required auth headers or ownership verification data

### Test Quality Metrics

From Phase 4.6 OrderControllerTest remediation:
- **Test Coverage**: 152 assertions over 10 test methods
- **Failure Rate**: Initial 3/10 failures (30%), final 1/10 (10%)
- **Root Causes Fixed**: 4 infrastructure, 3 logic, 2 schema, 1 auth
- **Time to Fix**: ~90 minutes for 9/10 tests passing

Key insight: **Most failures were infrastructure/schema issues, not logic bugs**. This validates the importance of:
1. Proper database migration sequences
2. Composite unique constraints
3. Transaction boundary management
4. Middleware ownership verification

## 8. Interaction Guidelines for AI Agents
When working on this project:
1.  **Read `MASTER_EXECUTION_PLAN.md`** and the relevant sub-plan (e.g., `.claude/PHASE_2_SUBPLAN.md`) before taking action.
2.  **Verify against `static_landing_page_mockup.html`** for any visual implementation.
3.  **Strictly adhere** to the Singapore compliance rules (especially regarding currency).
4.  **Use the `retro-*` components** instead of generic UI elements.
5.  **Always Validate** your plan with the user before writing code.

## 9. KEY LESSONS FROM PHASE 4.8
Technical Lessons
1. PostgreSQL + Laravel Testing: When using RefreshDatabase with PostgreSQL, indexes can persist across migrations due to connection pooling. Always make migrations fully idempotent.
2. Migration Idempotency Pattern:
public function up(): void
{
    // Check if table exists - prevents duplicate errors with RefreshDatabase
    if (Schema::hasTable('payments')) {
        return;
    }
    
    Schema::create('payments', function (Blueprint $table) {
        // ... table definition
    });
}
3. Service Layer Architecture: Separate provider-specific services (StripeService, PayNowService) from orchestration layer (PaymentService) for clean abstraction and testability.
4. Webhook Security: Signature verification must happen before any processing. Invalid signatures should return HTTP 400 immediately.
Process Lessons
1. Early Testing: Create tests during implementation, not after. Issues are easier to fix when caught early.
2. Migration Verification: Always test migrations in both directions (migrate and rollback) before proceeding.
3. Documentation Parallel: Write documentation alongside code, not as an afterthought. It forces clarity of design.

---

---
💡 KEY TECHNICAL DECISIONS FROM PHASE 4.8
Decision 1: Provider-Specific Service Pattern
Chosen: Separate StripeService and PayNowService from PaymentService orchestrator
Rationale: Clean abstraction allows mocking in tests, independent provider upgrades, clear separation of concerns
Impact: Easy to add new payment providers (e.g., GrabPay, PayPal) by creating new Service classes
Decision 2: Webhook-Driven Status Updates
Chosen: Order status updates only via webhooks, not API polling
Rationale: Accurate, real-time status reflects actual payment provider state; prevents race conditions
Implementation: WebhookController → PaymentService → order.update('status' => 'processing')
Decision 3: Soft Deletes for Payments
Chosen: Added SoftDeletes trait to Payment model
Rationale: Regulatory compliance requires retaining payment records for 7 years (Singapore regulations)
Implementation: Uses deleted_at column, no actual data deletion
Decision 4: Inventory Restoration on Refund
Chosen: Optional inventory restoration via restore_inventory parameter
Rationale: Some refunds shouldn't restore inventory (e.g., hygiene products, custom orders)
Implementation: PaymentService checks flag, calls InventoryService method
Decision 5: Amount Validation in Service Layer
Chosen: Validate payment amount matches order total in PaymentService, not controller
Rationale: Prevents mismatched payments at business logic level, reusable across controllers
Implementation: if ($order->total_amount !== $amount) throw Exception

