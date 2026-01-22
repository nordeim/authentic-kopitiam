CLAUDE.md - Developer Briefing & Project Context
Project: Morning Brew Collective
Type: Singapore-First Headless Commerce Platform
Aesthetic: 1970s Retro Kopitiam with Avant-Garde Minimalism
Status: Phase 5 (Payment Integration) 100% COMPLETE
---
1. Executive Summary
This project is not a generic e-commerce site; it is a digital resurrection of a heritage kopitiam. We combine a "Retro-Futuristic" aesthetic (warm colors, rounded corners, nostalgic typography) with enterprise-grade transaction capabilities (real-time inventory, Singapore compliance).
Core Philosophy:
*   Anti-Generic: We reject "AI slop" and standard Bootstrap grids. Every pixel must serve the "Sunrise at the Kopitiam" narrative.
*   Meticulous Execution: We validate every step before implementation. We do not guess; we verify.
*   BFF Architecture: 
    *   Frontend (Next.js 15): The "Soul" – Handles UX, aesthetics, and micro-interactions.
    *   Backend (Laravel 12): The "Truth" – Handles data integrity, inventory locks, and compliance logic.
---
2. Technology Stack & Conventions
Frontend (/frontend)
*   Framework: Next.js 15 (App Router), React 19.
*   Language: TypeScript 5.4 (Strict Mode).
*   Styling: Tailwind CSS 4.0 + CSS Variables (tokens.css).
*   Components: DO NOT use raw Shadcn/Radix primitives. You MUST use the retro-* wrappers (e.g., retro-button.tsx) located in src/components/ui/ to maintain the 70s aesthetic.
*   State: Zustand for client state (Cart, Filters, Payment).
*   Testing: Vitest (planned), Playwright (planned) - infrastructure being built.
Backend (/backend)
*   Framework: Laravel 12 (API-First).
*   Language: PHP 8.3.
*   Database: PostgreSQL 16.
    *   Critical: Financial values (prices, tax) MUST use DECIMAL(10,4) to handle Singapore GST (9%) precision correctly.
*   Cache/Queue: Redis 7 (Alpine).
*   Authentication: Laravel Sanctum.
*   Services: PaymentService, StripeService, PayNowService, InventoryService, PdpaService.
Infrastructure (/infra, /)
*   Environment: Docker & Docker Compose (morning-brew-network).
*   Services: PostgreSQL 16, Redis 7, Laravel Backend, Next.js Frontend.
*   Reverse Proxy: Nginx (planned for production).
*   Local Dev: Mailpit (Port 8025) for email capture.
---
3. Current Project State (As of January 20, 2026)
✅ Phase 5 Complete - Payment Integration
Backend (Payment Domain):
*   Services: PaymentService (382 lines), StripeService (238 lines), PayNowService (244 lines), InventoryService, PdpaService
*   Models: Payment (SoftDeletes), PaymentRefund (audit trail), Order, OrderItem, Product, Location, PdpaConsent, Category, User
*   Controllers: PaymentController (4 endpoints), WebhookController (Stripe & PayNow), OrderController, ProductController, LocationController, PdpaConsentController
*   APIs: PayNow QR generation, Stripe PaymentIntent, webhooks, refunds, status tracking
*   Middleware: VerifyOrderOwnership (zero-trust authentication)
*   Migrations: All tables with DECIMAL(10,4) precision, proper indexes, soft deletes, composite unique constraints
Frontend (Payment UI):
*   8 Payment Components: 1,839 lines of production code
    *   payment-method-selector.tsx (radio cards for PayNow/Card)
    *   paynow-qr-display.tsx (256x256 QR, timer, save/share)
    *   stripe-payment-form.tsx (Stripe Elements with retro theme)
    *   payment-status-tracker.tsx (3s polling, stepper UI)
    *   payment-success.tsx (confirmation with GST breakdown)
    *   payment-failed.tsx (error handling with retry)
    *   payment-recovery-modal.tsx (30-day session persistence)
    *   payment-method-card.tsx (individual method cards)
*   Pages: /checkout/payment/, /checkout/confirmation/
*   State: Payment store with Zustand, localStorage persistence
*   Design: 100% WCAG AAA compliance, retro-styled Stripe Elements
✅ Frontend Foundation Complete - Phase 2
*   Design System: tokens.css (38 colors, 16 spacing, 6 animations), globals.css, animations.css, patterns.css, accessibility.css
*   Retro Components: 9 wrappers implemented (retro-dialog, retro-button, retro-dropdown, retro-popover, retro-select, retro-checkbox, retro-switch, retro-progress, retro-slider)
*   Pages: layout.tsx, page.tsx (Hero), menu/page.tsx, heritage/page.tsx, locations/page.tsx, checkout/payment/page.tsx, checkout/confirmation/page.tsx
*   Interactive: Cart overlay, toast notifications, filter store, undo/redo (10-action history)
*   Animations: BeanBounce, SteamRise, SunburstBackground, FloatingCoffeeCup, MapMarker, PolaroidGallery (IntersectionObserver-based)
✅ Backend Domain Complete - Phase 4
*   Models: All domain models with proper casts, relationships, scopes
*   APIs: RESTful endpoints with validation, OpenAPI documentation
*   Services: Inventory reservation (Redis + PostgreSQL), PDPA pseudonymization, GST calculations
*   Testing: 7 test files (OrderController, ProductController, LocationController, PdpaConsentController, PaymentService unit tests)
🐳 Infrastructure - Phase 0
*   Docker Compose: PostgreSQL 16, Redis 7, Backend, Frontend configured
*   Makefile: Standard commands (make up, make down, make logs, make migrate, make test)
*   Database: init.sql with UUID/crypto extensions, proper schema
📊 Project Statistics
| Metric | Value | Status |
|--------|-------|--------|
| Frontend Components | 25+ | ✅ Implemented |
| Frontend Payment UI | 1,839 lines | ✅ Complete |
| Backend Services | 5 services | ✅ Complete |
| Backend Controllers | 6 controllers | ✅ Complete |
| Database Tables | 9 tables | ✅ Migrated |
| API Endpoints | 15+ endpoints | ✅ Documented |
| Test Files | 7 files | ⚠️ Infrastructure needed |
| Docker Services | 4 services | ✅ Running |
---
4. Operational Guide & Commands
The project uses a Makefile to standardize workflows. Always use these commands.
| Task | Command | Description |
| :--- | :--- | :--- |
| Start Dev | make up | Starts all Docker containers (Front, Back, DB, Redis). |
| Stop Dev | make down | Stops and removes containers. |
| View Logs | make logs | Tails logs for all services. |
| Install Deps | make install | Runs npm install and composer install. |
| Shell (Back)| make shell-backend | Bash access to Laravel container. |
| Shell (Front)| make shell-frontend | Shell access to Next.js container. |
| Migrate DB | make migrate | Runs Laravel migrations. |
| Testing | make test | Runs both Frontend and Backend tests. |
---
5. Critical Compliance & Implementation Mandates
1. Singapore Compliance
*   GST (9%): Display prices inclusive of GST. Store as DECIMAL(10,4) (not integer cents) to avoid rounding errors on tax calculation.
*   PDPA: User consent must be logged with IP, User Agent, and Timestamp. Use the pdpa_consents table with pseudonymization (SHA256 hash).
*   PayNow: Integration via Stripe Singapore. QR codes must be 256x256px minimum, 15-minute expiry, with manual fallback.
*   InvoiceNow: Planned for Phase 6 - UBL 2.1 XML generation for PEPPOL.
2. "Anti-Generic" Design
*   No Standard Grids: Use retro-* components for all UI elements.
*   Motion: Use cubic-bezier(0.34, 1.56, 0.64, 1) for that specific "bounce" feel.
*   Typography: Strict adherence to Fraunces (Headings) and DM Sans (Body).
*   Color Tokens: Must reference CSS variables from tokens.css (e.g., var(--color-sunrise-coral)).
*   Accessibility: WCAG AAA compliance mandatory (7:1 contrast minimum).
3. Backend Implementation Rules
*   Decimal Precision: All financial calculations use DECIMAL(10,4) in PostgreSQL.
*   Inventory: Two-phase reservation - Redis soft reserve (15-min TTL) → PostgreSQL commit on payment success.
*   Payment Idempotency: PaymentService validates amount matches order total before processing.
*   Webhook Security: Signature verification happens before any processing. Invalid signatures return HTTP 400 immediately.
*   Soft Deletes: Payment records use SoftDeletes trait for 7-year regulatory retention.
4. Workflow
*   Validation: Do not write code without validating the plan against MASTER_EXECUTION_PLAN.md and VALIDATED_EXECUTION_PLAN.md.
*   Files: When creating new files, ensure they are registered in the correct directory (e.g., frontend/src/components/ui vs frontend/src/components/animations).
*   Git: Never commit secrets. Use .env files only.
*   Testing: Write tests alongside implementation, not as an afterthought.
---
6. Key Reference Documents
Master Plans
*   MASTER_EXECUTION_PLAN.md (79KB) - Original 6-phase technical architecture
*   VALIDATED_EXECUTION_PLAN.md (38KB) - 119 validated tasks across 8 phases with refinements
*   Phase Sub-Plans: PHASE_0_SUBPLAN.md through PHASE_5_SUBPLAN.md in /home/project/authentic-kopitiam/ directory
Current Status
*   PROJECT_STATUS_REPORT.md (15KB) - Latest completion report as of Jan 18, 2026
*   status_current.md (20KB) - Real-time implementation progress
*   final_status.md (5KB) - Phase 5 completion summary
Testing & Troubleshooting
*   PHASE_4_VALIDATION_REPORT.md (13KB) - OrderController test failures analysis
*   PHASE_3_INTEGRATION_TESTS.md (14KB) - Backend testing strategy
Design Reference
*   static_landing_page_mockup.html (75KB) - Authoritative design reference (1970s kopitiam aesthetic)
*   AGENTS.md (37KB) - AI agent operational constraints and persona definitions
*   GEMINI.md (13KB) - Additional developer context
---
7. Test Coverage Status
Current Test Implementation (Phase 6 in Progress)
Backend Tests (7 files located in /backend/tests/):
*   Api/OrderControllerTest.php - 152 assertions (10 methods)
*   Api/ProductControllerTest.php - CRUD operations
*   Api/LocationControllerTest.php - Location endpoints
*   Api/PdpaConsentControllerTest.php - Consent tracking
*   Unit/PaymentServiceTest.php - Payment logic
*   TestCase.php - Base test case
Frontend Tests - Infrastructure being built:
*   E2E Tests: Playwright setup pending (referenced in README but not implemented)
*   Unit Tests: Vitest configuration pending
*   Visual Regression: Percy/Screenshot API pending
*   Performance: Lighthouse CI pending
Test Failure Categories & Mitigation
Type 1: Infrastructure Setup Failures
- Missing migrations: SQLSTATE[42P01] relation "table" does not exist
- Permission issues: EACCES: permission denied
- Container health: PostgreSQL not ready, Redis connection refused
- Prevention: Always verify docker containers healthy with make logs
Type 2: Logic/Implementation Failures
- Business rule violations: expected vs actual behavior mismatch
- Edge case handling: null values, boundary conditions
- Remediation: Add unit tests for specific logic, then fix
Type 3: Schema/Constraint Failures
- Foreign key violations: SQLSTATE[23503] foreign key constraint
- Unique constraint violations: SQLSTATE[23505] unique constraint
- Remediation: Check database constraints vs application logic
- Example: pdpa_consents composite unique index on (pseudonymized_id, consent_type)
Type 4: Transaction/Race Condition Failures
- Concurrent access: race conditions in Redis operations
- Deadlocks: concurrent database writes
- Remediation: Redis atomic operations, PostgreSQL advisory locks
- Example: Inventory reservation uses lockForUpdate()
Type 5: Integration/Authentication Failures
- Middleware blocking: 401, 403 when expecting 200
- Request validation: 422 with validation errors
- Remediation: Provide required auth headers or ownership verification data
- Example: Order status requires customer_email + invoice_number OR auth user
---
8. Interaction Guidelines for AI Agents
When working on this project:
1.  Read MASTER_EXECUTION_PLAN.md and the relevant sub-plan (e.g., PHASE_5_SUBPLAN.md) before taking action.
2.  Verify against static_landing_page_mockup.html for any visual implementation.
3.  Strictly adhere to the Singapore compliance rules (especially regarding currency/GST).
4.  Use the retro-* components instead of generic UI elements.
5.  Always Validate your plan with the user before writing code.
6.  Reference VALIDATED_EXECUTION_PLAN.md for implementation checkpoints.
---
9. Critical Technical Decisions from Phase 5
Decision 1: Provider-Specific Service Pattern
*   Chosen: Separate StripeService and PayNowService from PaymentService orchestrator
*   Rationale: Clean abstraction allows mocking in tests, independent provider upgrades, clear separation of concerns
*   Impact: Easy to add new payment providers (e.g., GrabPay, PayPal) by creating new Service classes
*   Files: backend/app/Services/PaymentService.php, StripeService.php, PayNowService.php
Decision 2: Webhook-Driven Status Updates
*   Chosen: Order status updates only via webhooks, not API polling
*   Rationale: Accurate, real-time status reflects actual payment provider state; prevents race conditions
*   Implementation: WebhookController → PaymentService → order.update('status' => 'processing')
*   Files: backend/app/Http/Controllers/Api/WebhookController.php
Decision 3: Soft Deletes for Payments
*   Chosen: Added SoftDeletes trait to Payment model
*   Rationale: Regulatory compliance requires retaining payment records for 7 years (Singapore regulations)
*   Implementation: Uses deleted_at column, no actual data deletion
*   Files: backend/app/Models/Payment.php, migration: add_deleted_at_to_payments
Decision 4: Inventory Restoration on Refund
*   Chosen: Optional inventory restoration via restore_inventory parameter
*   Rationale: Some refunds shouldn't restore inventory (e.g., hygiene products, custom orders)
*   Implementation: PaymentService checks flag, calls InventoryService method
*   Files: backend/app/Services/PaymentService.php, InventoryService.php
Decision 5: Decimal Precision Strategy
*   Chosen: Use DECIMAL(10,4) for all financial fields in PostgreSQL
*   Rationale: Singapore GST calculations require 4 decimal precision to avoid rounding errors on 9% tax
*   Implementation: All migrations use $table->decimal('price', 10, 4)
*   Files: All migration files, backend/app/Models/ casts
---
10. Common Pitfalls & Prevention (from Phase 4.6 Lessons)
PIT-001: Redis Double-Prefixing
- Symptom: Keys stored as prefix:prefix:key instead of prefix:key
- Detection: Check Redis keys in Laravel: Redis::keys('pattern') vs direct redis-cli
- Fix: Extract Laravel prefix before Redis operations: str_replace(config('database.redis.options.prefix'), '', $fullKey)
PIT-002: Transaction Abortion from Secondary Operations
- Symptom: SQLSTATE25P02 "current transaction is aborted" when querying after error
- Cause: Non-critical operations inside transaction boundaries cause cascading failures
- Prevention: Move non-critical operations (consent recording, logging) outside transaction boundaries
PIT-003: Missing Soft Delete Columns
- Symptom: QueryException "column table.deleted_at does not exist"
- Cause: Model has SoftDeletes trait but migration didn't add column
- Prevention: Always verify migration and model consistency
PIT-004: Unique Constraint on Wrong Columns
- Symptom: SQLSTATE23505 when inserting valid multi-row data
- Cause: Single-column unique index instead of composite unique index
- Fix: Drop single-column unique, add composite: $table->unique(['col1', 'col2'])
---
