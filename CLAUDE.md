# CLAUDE.md - Agent Initialization Handbook
**Project:** Morning Brew Collective  
**Type:** Singapore-First Headless Commerce Platform  
**Aesthetic:** 1970s Retro Kopitiam × Avant-Garde Minimalism  
**Last Validated:** January 23, 2026

---

## 🚀 QUICK START (Read This First)

### 30-Second Orientation
This is a **BFF (Backend-for-Frontend)** e-commerce platform for a Singapore heritage kopitiam:
- **Backend (Laravel 12)** = "The Truth" → Data integrity, inventory, compliance
- **Frontend (Next.js 15)** = "The Soul" → UX, aesthetics, micro-interactions
- **Core Mandate:** All financial values use **DECIMAL(10,4)** for Singapore GST (9%) precision

### First Actions Checklist
```bash
# 1. Verify services are running
make status

# 2. Run backend tests  
make test-backend

# 3. Check frontend build
cd frontend && npm run build
```

### Critical Files to Read
| Priority | File | Purpose |
|----------|------|---------|
| 1 | `CLAUDE.md` (this file) | Agent initialization |
| 2 | `static_landing_page_mockup.html` | Authoritative design reference |
| 3 | `MASTER_EXECUTION_PLAN.md` | 6-phase technical roadmap |
| 4 | `backend/app/Services/` | Core business logic |
| 5 | `frontend/src/components/ui/retro-*.tsx` | Design system components |

---

## 📖 WHAT: Project Overview

### Executive Summary
This is not a generic e-commerce site—it is a **digital resurrection of a heritage kopitiam**. We combine a "Retro-Futuristic" aesthetic (warm colors, rounded corners, nostalgic typography) with enterprise-grade transaction capabilities.

**Anti-Generic Philosophy:**
- We reject "AI slop" and standard Bootstrap grids
- Every pixel serves the "Sunrise at the Kopitiam" narrative
- Use `retro-*` components, never raw Shadcn/Radix primitives

### Technology Stack

#### Backend (`/backend`)
| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Laravel 12 | API-First |
| Language | PHP 8.3 | Strict types |
| Database | PostgreSQL 16 | **DECIMAL(10,4)** for financials |
| Cache/Queue | Redis 7 | Inventory reservations |
| Auth | Laravel Sanctum | Token-based |

#### Frontend (`/frontend`)
| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 15 | App Router |
| Language | TypeScript 5.4 | Strict Mode |
| Styling | Tailwind CSS 4.0 | CSS-first via `tokens.css` |
| State | Zustand | Cart, Payment, Filters, Toast |
| Testing | Vitest + Playwright | Unit + E2E |

#### Infrastructure
| Component | Technology |
|-----------|------------|
| Containers | Docker Compose |
| Services | PostgreSQL, Redis, Backend, Frontend |
| Email (Dev) | Mailpit (Port 8025) |

### Current Project State (Validated January 23, 2026)

| Metric | Value | Status |
|--------|-------|--------|
| Backend Services | 6 services, 1,674 lines | ✅ Complete |
| Backend Controllers | 7 controllers | ✅ Complete |
| Backend Models | 8 models | ✅ Complete |
| Database Tables | 9 tables | ✅ Migrated |
| Frontend Payment UI | 8 components, 1,836 lines | ✅ Complete |
| Frontend Retro Wrappers | 9 components | ✅ Complete |
| Frontend Tests | 1 unit + 2 E2E tests | ⚠️ Expanding |
| Backend Tests | 8 test files | ✅ Active |

---

## 🎯 WHY: Design Rationale

### Core Philosophy
1. **Meticulous Execution:** Validate every step before implementation
2. **BFF Architecture:** Backend handles truth, Frontend handles experience
3. **Singapore Compliance First:** GST precision, PDPA, PayNow, InvoiceNow

### Critical Technical Decisions

#### Decision 1: DECIMAL(10,4) for All Financials
- **Why:** Singapore GST (9%) requires 4 decimal precision to avoid rounding errors
- **Implementation:** All migrations use `$table->decimal('column', 10, 4)`
- **Boundary:** Stripe API conversion to cents happens ONLY in `StripeService`

#### Decision 2: Provider-Specific Service Pattern
- **Why:** Clean abstraction for payment providers
- **Implementation:** `PaymentService` orchestrates, `StripeService`/`PayNowService` implement
- **Benefit:** Easy to add GrabPay, PayPal by creating new Service classes

#### Decision 3: Two-Phase Inventory Reservation
- **Why:** Prevent overselling during checkout
- **Implementation:** 
  1. Redis soft reserve (15-min TTL)
  2. PostgreSQL commit on payment success

#### Decision 4: Webhook-Driven Status Updates
- **Why:** Accurate real-time status from payment provider
- **Implementation:** `WebhookController` → `PaymentService` → Order update

#### Decision 5: Soft Deletes for Payments
- **Why:** 7-year regulatory retention requirement
- **Implementation:** `SoftDeletes` trait on `Payment` model

### Singapore Compliance Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| GST (9%) | DECIMAL(10,4) precision | ✅ |
| PDPA | `pdpa_consents` table with SHA256 pseudonymization | ✅ |
| PayNow | 256x256 QR, 15-min expiry, manual fallback | ✅ |
| InvoiceNow | UBL 2.1 XML via `InvoiceService` | ✅ |

---

## 🔧 HOW: Implementation Guide

### File Hierarchy

```
/backend
├── app/
│   ├── Http/Controllers/Api/     # REST endpoints (7 controllers)
│   │   ├── OrderController.php       # Order CRUD, status transitions
│   │   ├── PaymentController.php     # Payment initiation, status
│   │   ├── ProductController.php     # Product catalog
│   │   ├── LocationController.php    # Store locations
│   │   ├── WebhookController.php     # Stripe/PayNow webhooks
│   │   ├── PdpaConsentController.php # PDPA consent tracking
│   │   └── InvoiceController.php     # Invoice generation
│   ├── Models/                   # Eloquent models (8 models)
│   │   ├── Order.php                 # Main order entity
│   │   ├── OrderItem.php             # Line items
│   │   ├── Payment.php               # Payment records (SoftDeletes)
│   │   ├── PaymentRefund.php         # Refund audit trail
│   │   ├── Product.php               # Menu items
│   │   ├── Category.php              # Product categories
│   │   ├── Location.php              # Store locations
│   │   └── PdpaConsent.php           # Consent records
│   └── Services/                 # Business logic (6 services)
│       ├── PaymentService.php        # Orchestrator (410 lines)
│       ├── StripeService.php         # Stripe API (182 lines)
│       ├── PayNowService.php         # PayNow QR (244 lines)
│       ├── InventoryService.php      # Stock management (373 lines)
│       ├── PdpaService.php           # Consent handling (283 lines)
│       └── InvoiceService.php        # UBL 2.1 XML (182 lines)
├── database/migrations/          # 15 migration files
└── tests/                        # 8 test files
    ├── Api/                          # Controller tests
    └── Unit/                         # Service tests

/frontend
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (shop)/                   # Customer-facing routes
│   │   │   ├── page.tsx                  # Landing page (Hero)
│   │   │   ├── menu/page.tsx             # Menu catalog
│   │   │   ├── heritage/page.tsx         # Brand story
│   │   │   ├── locations/page.tsx        # Store finder
│   │   │   └── checkout/                 # Checkout flow
│   │   │       ├── payment/page.tsx
│   │   │       └── confirmation/page.tsx
│   │   └── (dashboard)/              # Admin routes
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                       # Design system (20 files)
│   │   │   ├── retro-button.tsx          # Primary button
│   │   │   ├── retro-dialog.tsx          # Modal dialogs
│   │   │   ├── retro-dropdown.tsx        # Dropdown menus
│   │   │   └── ... (9 retro-* wrappers)
│   │   ├── payment/                  # Payment UI (8 components)
│   │   │   ├── payment-method-selector.tsx
│   │   │   ├── paynow-qr-display.tsx
│   │   │   ├── stripe-payment-form.tsx
│   │   │   └── ...
│   │   └── animations/               # Motion components (8 files)
│   ├── store/                    # Zustand stores (6 files)
│   │   ├── cart-store.ts             # Cart state
│   │   ├── payment-store.ts          # Payment flow state
│   │   ├── filter-store.ts           # Product filters
│   │   ├── toast-store.ts            # Notifications
│   │   ├── expiration.ts             # TTL utilities
│   │   └── persistence.ts            # localStorage sync
│   ├── styles/                   # CSS design system
│   │   ├── tokens.css                # Design tokens (15KB)
│   │   ├── globals.css               # Global styles (34KB)
│   │   ├── animations.css            # Motion (5KB)
│   │   ├── patterns.css              # Backgrounds (10KB)
│   │   └── accessibility.css         # WCAG AAA (12KB)
│   └── lib/
│       └── decimal-utils.ts          # Financial precision
└── tests/
    ├── unit/cart-store.test.ts       # Cart logic tests
    └── e2e/                          # Playwright E2E tests
```

### Component Ownership Matrix

| Feature | Backend Owner | Frontend Owner |
|---------|---------------|----------------|
| Order Creation | `OrderController`, `PaymentService` | `checkout/payment/page.tsx` |
| Payment (Stripe) | `StripeService` | `stripe-payment-form.tsx` |
| Payment (PayNow) | `PayNowService` | `paynow-qr-display.tsx` |
| Inventory | `InventoryService` | `cart-store.ts` |
| PDPA Consent | `PdpaService`, `PdpaConsentController` | `payment-method-selector.tsx` |
| Invoice | `InvoiceService`, `InvoiceController` | (Admin panel) |
| Product Catalog | `ProductController` | `menu/page.tsx` |
| Locations | `LocationController` | `locations/page.tsx` |

### PR Handling Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    What type of change?                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
    BUG FIX               NEW FEATURE           UI CHANGE
        │                     │                     │
        ▼                     ▼                     ▼
   1. Find failing        1. Check               1. Compare to
      test or write          MASTER_EXECUTION       static_landing_
      one first              _PLAN.md               page_mockup.html
        │                     │                     │
        ▼                     ▼                     ▼
   2. Fix the bug         2. Identify phase      2. Use retro-*
                             and relevant           components ONLY
        │                    sub-plan               │
        ▼                     │                     ▼
   3. Verify test         3. Follow validation   3. Run visual
      passes                 checkpoints            regression
        │                     │                     │
        ▼                     ▼                     ▼
   4. Run make test       4. Create tests        4. Verify WCAG AAA
                             alongside code          (7:1 contrast)
```

### Operational Commands

| Task | Command | Description |
|------|---------|-------------|
| Start Dev | `make up` | Start all Docker containers |
| Stop Dev | `make down` | Stop and remove containers |
| View Logs | `make logs` | Tail logs for all services |
| Install Deps | `make install` | Run npm/composer install |
| Backend Shell | `make shell-backend` | Bash into Laravel container |
| Frontend Shell | `make shell-frontend` | Shell into Next.js container |
| Migrate DB | `make migrate` | Run Laravel migrations |
| Run All Tests | `make test` | Backend + Frontend tests |
| Backend Tests | `make test-backend` | PHPUnit tests only |
| Fresh DB | `make migrate-fresh` | Reset + seed database |

---

## 📋 REFERENCE: Quick Lookup

### Verification Commands Cheatsheet

```bash
# Database schema verification (DECIMAL(10,4))
docker compose exec postgres psql -U brew_user -d morning_brew -c "
SELECT table_name, column_name, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE numeric_scale = 4;"

# Backend service line counts
wc -l backend/app/Services/*.php

# Frontend payment components
wc -l frontend/src/components/payment/*.tsx

# Run backend tests
docker compose exec backend php artisan test

# Frontend TypeScript check
cd frontend && npm run typecheck

# Frontend build
cd frontend && npm run build
```

### Test Coverage Status

| Test File | Type | Status |
|-----------|------|--------|
| `Api/OrderControllerTest.php` | Integration | ✅ Passing |
| `Api/ProductControllerTest.php` | Integration | ✅ Passing |
| `Api/LocationControllerTest.php` | Integration | ✅ Passing |
| `Api/PdpaConsentControllerTest.php` | Integration | ⚠️ Auth issue |
| `Unit/PaymentServiceTest.php` | Unit | ⚠️ Mock update needed |
| `tests/unit/cart-store.test.ts` | Unit (Frontend) | ✅ 4 tests |
| `tests/e2e/admin-flows.spec.ts` | E2E | ✅ Active |
| `tests/e2e/payment-flows.spec.ts` | E2E | ✅ Active |

### Common Pitfalls

| ID | Symptom | Cause | Fix |
|----|---------|-------|-----|
| PIT-001 | `prefix:prefix:key` in Redis | Double-prefixing | Extract Laravel prefix before ops |
| PIT-002 | `SQLSTATE[25P02]` | Non-critical ops in transaction | Move logging outside transaction |
| PIT-003 | `column.deleted_at does not exist` | Missing soft delete column | Verify migration adds column |
| PIT-004 | `SQLSTATE[23505]` on valid data | Wrong unique constraint | Use composite unique index |

### Key Reference Documents

| Document | Size | Purpose |
|----------|------|---------|
| `MASTER_EXECUTION_PLAN.md` | 79KB | Original 6-phase architecture |
| `VALIDATED_EXECUTION_PLAN.md` | 38KB | 119 validated tasks |
| `static_landing_page_mockup.html` | 75KB | Authoritative design reference |
| `Project_Architecture_Document.md` | 7KB | Architecture overview |

---

## 🎓 Agent Interaction Guidelines

1. **Before coding:** Read this file + `MASTER_EXECUTION_PLAN.md`
2. **For UI work:** Verify against `static_landing_page_mockup.html`
3. **For payments:** Strictly follow DECIMAL(10,4) mandate
4. **For components:** Use `retro-*` wrappers, never raw Shadcn/Radix
5. **Always validate:** Present plan to user before writing code
6. **After changes:** Run `make test` and `npm run build`

---

*Document validated against codebase: January 23, 2026*  
*Next scheduled validation: After next major phase completion*
