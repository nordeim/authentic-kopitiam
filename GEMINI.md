# Morning Brew Collective - Context & Operational Guide

## 1. Project Overview
**Morning Brew Collective** is a Singapore-first headless commerce platform that digitizes a heritage 1970s kopitiam. It is not just a website but a transactional system enabling real-time inventory, GST-compliant invoicing, PayNow payments, and InvoiceNow integration, all while preserving a "retro-futuristic" aesthetic.

**Core Philosophy:**
*   **Anti-Generic:** Rejection of standard templates and "AI slop". Every pixel must have a purpose.
*   **Meticulous Approach:** Analyze -> Plan -> Validate -> Implement -> Verify -> Deliver.
*   **BFF Architecture:** Frontend (Next.js) owns the "Soul" (UX/UI), Backend (Laravel) owns the "Truth" (Data/Logic).

## 2. Technology Stack

### Frontend (`/frontend`)
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript 5.4
*   **Styling:** Tailwind CSS 4.0 + Shadcn UI (Retro-fitted)
*   **State Management:** Zustand
*   **Testing:** Vitest, Playwright

### Backend (`/backend`)
*   **Framework:** Laravel 12 (API-First)
*   **Language:** PHP 8.3
*   **Database:** PostgreSQL 16 (Using `DECIMAL(10,4)` for currency)
*   **Cache/Queue:** Redis 7
*   **Testing:** Pest

### Infrastructure (`/infra`)
*   **Containerization:** Docker & Docker Compose
*   **Reverse Proxy:** Nginx
*   **Local Dev:** Mailpit for email capture

## 3. Critical Mandates & Compliance

### Design System
*   **Source of Truth:** `static_landing_page_mockup.html`
*   **Tokens:** Defined in `frontend/src/styles/tokens.css` (Colors, Typography, Spacing, Animations).
*   **Components:** Do *not* use raw Shadcn primitives. Use the `retro-*` wrappers (e.g., `retro-button.tsx`) to enforce the 70s aesthetic.

### Singapore Compliance
*   **GST (9%):** Prices stored and calculated with high precision (`DECIMAL(10,4)`). Displayed inclusive of GST.
*   **PDPA:** Strict consent logging (IP, User Agent, Timestamp, Wording Hash). Data retention policies enforced.
*   **InvoiceNow:** PEPPOL UBL 2.1 XML generation for B2B.
*   **PayNow:** Integrated via Stripe.

## 4. Operational Guide

The project uses a `Makefile` to standardize common operations.

### Setup & Run
*   **Install Dependencies:** `make install` (Runs `npm install` and `composer install`)
*   **Start Services:** `make up` (Starts Docker containers)
*   **Stop Services:** `make down`
*   **View Logs:** `make logs`

### Development
*   **Backend Shell:** `make shell-backend`
*   **Frontend Shell:** `make shell-frontend`
*   **Database Access:** `docker-compose exec postgres psql -U brew_user -d morning_brew`

### Testing & Quality
*   **Run All Tests:** `make test`
*   **Lint Code:** `make lint`
*   **Format Code:** `make format`
*   **Type Check:** `make typecheck`

## 5. Current Project Status
*   **Phase 0 (Infrastructure):** **COMPLETE**. Docker, Makefile, and Monorepo structure fully operational.
*   **Phase 1 (Design System):** **COMPLETE**. Tokens and retro-components implemented.
*   **Backend Scaffolding:** **COMPLETE**. Laravel 12 API-first structure created with Singapore defaults and dependencies installed.
*   **Phase 2 (Frontend Architecture):** **IN PROGRESS**. Focus on constructing the Next.js App Router layout, pages (Hero, Menu, Heritage, Locations), and decorative animations.
*   **Future Phases:** Interactive Components (Ph 3), Backend Domain (Ph 4), Checkout (Ph 5), etc.

## 6. Directory Map
```
/
├── frontend/           # Next.js Application
│   ├── src/app/        # App Router Pages (In Progress)
│   ├── src/components/ # UI, Layout & Animation Components
│   └── src/styles/     # Global Styles & Tokens
├── backend/            # Laravel API (Scaffolded)
│   ├── app/            # Models, Controllers, Providers
│   ├── bootstrap/      # App Bootstrapping
│   ├── config/         # App & DB Config (Singapore Timezone)
│   ├── database/       # Migrations & Seeders
│   └── routes/         # API Routes
├── infra/              # Infrastructure Configs (Postgres, Redis, Nginx)
├── docs/               # Project Documentation & Plans
├── .claude/            # Agent Plans & Context
├── MASTER_EXECUTION_PLAN.md # The "Holy Grail" Plan
└── Makefile            # Command Shortcuts
```

---

## Troubleshooting Methodology (Lessons from Phase 4.6)

### Test Failure Analysis Framework
When tests fail, follow this systematic approach:

1. **Isolate the Failure**
   ```bash
   # Run single test with verbose output
   docker compose exec backend php artisan test --filter='TestClass::test_method_name' -v
   ```

2. **Verify Expected vs Actual State**
   ```bash
   # Check database state
   docker compose exec backend php artisan tinker --execute '
   $model = Model::find($id);
   print("Field value: " . $model->field . " (expected: X)\n");
   '
   
   # Check Redis state
   docker compose exec backend php artisan tinker --execute '
   dump(\Illuminate\Support\Facades\Redis::get("key"));
   '
   ```

3. **Trace Request Flow with Logging**
   Add Laravel logging in strategic locations:
   ```php
   \Log::debug('Checkpoint name', [
       'variable' => $value,
       'context' => 'method_name'
   ]);
   ```
   Then tail logs: `docker compose exec backend tail -f storage/logs/laravel.log`

4. **Verify Middleware Execution**
   - Check route list: `php artisan route:list --name=resource`
   - Verify middleware registered in bootstrap/app.php
   - Test middleware in isolation with tinker

5. **Database Constraint Validation**
   - Check indexes: `php artisan tinker --execute '\DB::select("SELECT * FROM pg_indexes WHERE tablename = ?", ["table_name"]);'`
   - Verify composite unique constraints allow expected data permutations

6. **Race Condition Detection**
   For concurrency issues:
   ```bash
   # Run test multiple times
   for i in {1..10}; do docker compose exec backend php artisan test --filter='test_concurrent_inventory'; done
   ```

### Common Pitfalls & Prevention

**PIT-001: Redis Double-Prefixing**
- **Symptom**: Keys stored as `prefix:prefix:key` instead of `prefix:key`
- **Detection**: Check Redis keys in Laravel: `Redis::keys('pattern')` vs direct redis-cli
- **Prevention**: Always extract Laravel prefix before Redis operations with custom patterns
- **Fix**: Use `str_replace(config('database.redis.options.prefix'), '', $fullKey)`

**PIT-002: Transaction Abortion from Secondary Operations**
- **Symptom**: SQLSTATE[25P02] "current transaction is aborted" when querying after error
- **Cause**: Non-critical operations (logging, consent recording) inside transaction boundaries cause cascading failures
- **Prevention**: Move non-critical operations outside transaction boundaries
- **Pattern**: Transaction should ONLY contain critical data integrity operations

**PIT-003: Missing Soft Delete Columns**
- **Symptom**: QueryException "column table.deleted_at does not exist"
- **Cause**: Model has SoftDeletes trait but migration didn't add column
- **Detection**: Check Schema::getColumnListing('table') before using SoftDeletes trait
- **Prevention**: Always verify migration and model consistency

**PIT-004: Unique Constraint on Wrong Columns**
- **Symptom**: SQLSTATE[23505] when inserting valid multi-row data
- **Cause**: Single-column unique index instead of composite unique index
- **Analysis**: Determine if unique constraint should be per-row or per-combination
- **Fix**: Drop single-column unique, add composite: `$table->unique(['col1', 'col2'])`

**PIT-005: Authorization Missing in Tests**
- **Symptom**: Tests get 401/403 when they expect 200
- **Checklist**:
  - Does route have auth middleware? Check `php artisan route:list`
  - Does test provide ownership verification credentials?
  - For Order status: requires `customer_email` + `invoice_number` OR auth user
  - Are credentials valid? (match actual order data)
  - Is middleware throwing validation errors before controller?

**PIT-006: Inventory Not Restoring on Cancellation**
- **Symptom**: Stock quantity remains reduced after order cancellation
- **Checklist**:
  1. Is endpoint being called? (200 vs 401/422)
  2. Is middleware allowing request through?
  3. Does Order load items relationship? (`$order->items` not null)
  4. Is Product::findOrFail() finding product? (check foreign key)
  5. Is increment() being called? Add logging
  6. Is transaction committing? (`DB::commit()` reached)
  7. Check final state: `Product::fresh()->stock_quantity`

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
