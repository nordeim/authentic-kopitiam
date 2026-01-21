# Comprehensive Validated Project Understanding
**Project:** Morning Brew Collective  
**Date:** January 20, 2026  
**Validator:** Gemini CLI Agent

## 1. Executive Summary
Morning Brew Collective is a Singapore-first headless commerce platform digitalizing a heritage 1970s kopitiam. It combines a distinct "Retro-Futuristic" aesthetic with enterprise-grade compliance (GST, PayNow, PDPA).

**Status:** Phase 5 (Payment Integration) is structurally complete but requires critical database remediation before production use. The project adheres to a BFF (Backend-for-Frontend) architecture with strict separation of concerns.

## 2. Validated Architecture & Tech Stack

### Frontend (`/frontend`)
*   **Framework:** Next.js 15 (App Router), React 19.
*   **Styling:** Tailwind CSS 4.0 with a dedicated Design Token system (`tokens.css`).
*   **UI Strategy:** "Anti-Generic" philosophy. Shadcn UI primitives are wrapped in `retro-*.tsx` components (e.g., `retro-button`, `retro-dialog`) to enforce the 70s aesthetic.
*   **State:** Zustand stores (`cart-store`, `payment-store`) handle client-side logic.
*   **Components:** 
    *   Payment UI is fully scaffolded: `stripe-payment-form`, `paynow-qr-display`, `payment-method-selector`.
    *   Page structure: `checkout`, `menu`, `heritage`, `locations`.

### Backend (`/backend`)
*   **Framework:** Laravel 12 (API-First).
*   **Database:** PostgreSQL 16.
*   **Services:** 
    *   `PaymentService`: Orchestrator for payments.
    *   `StripeService`: Adapter for Stripe API.
    *   `PayNowService`: Adapter for PayNow QR generation.
    *   `InventoryService`: Handles two-phase reservation (Redis + DB).
    *   `PdpaService`: Manages consent and pseudonymization.
*   **Queue:** Redis 7 (Horizon configured).

### Infrastructure
*   **Docker:** Full stack containerization (Frontend, Backend, Postgres, Redis, Mailpit).
*   **Dev Tools:** `Makefile` standardizes commands (`make up`, `make migrate`, `make test`).

## 3. Critical Findings & Discrepancies

### 🔴 CRITICAL: Database Schema Inconsistency
The project mandate specifies using `DECIMAL(10,4)` for all financial calculations to ensure Singapore GST (9%) compliance. However, the current codebase is in a **mixed/broken state**:

| Table | Column | Type | Status | Impact |
|-------|--------|------|--------|--------|
| `products` | `price` | `DECIMAL(10,4)` | ✅ Compliant | Correctly stores high-precision base prices. |
| `orders` | `subtotal_cents` | `INTEGER` | ❌ **Non-Compliant** | Will cause rounding errors on GST calculation. Contradicts `products` schema. |
| `payments` | `amount` | `DECIMAL(10,2)` | ❌ **Non-Compliant** | Insufficient precision for tax calculation and conflicts with `products`. |

**Logic Impact:** `PaymentService.php` currently casts amounts to integers (`(int) round($amount * 100)`) for Stripe, which aligns with the (incorrect) `orders` table but conflicts with the `products` table's precision.

### 🟡 Backend Logic
*   **Provider Pattern:** implemented correctly. `PaymentService` delegates to `StripeService` and `PayNowService`.
*   **Transactions:** `DB::beginTransaction()` is correctly used in payment processing.
*   **Soft Deletes:** Implemented on `orders`, `products`, and `payments`.

## 4. Validated Codebase Structure
(Checked against file system)

```text
frontend/
├── src/components/ui/          # ✅ Contains retro-*.tsx wrappers
├── src/components/payment/     # ✅ Contains 8 payment components
├── src/store/                  # ✅ Contains cart and payment stores
└── package.json                # ✅ Next.js 15, Tailwind 4

backend/
├── app/Services/               # ✅ Payment, Stripe, PayNow, Inventory services exist
├── app/Http/Controllers/Api/   # ✅ Controllers match services
├── database/migrations/        # ✅ Migrations exist but have schema mismatch
└── composer.json               # ✅ Laravel 12, Stripe PHP
```

## 5. Roadmap & Immediate Next Steps

### Step 1: Fix Database Schema (Priority: Critical)
The database schema must be unified to `DECIMAL(10,4)` to meet the project's core compliance mandate.
*   **Action:** Create a remediation migration to:
    *   Modify `orders` table: `subtotal_cents` (int) -> `subtotal` (decimal 10,4), `gst_cents` -> `gst_amount`, `total_cents` -> `total_amount`.
    *   Modify `payments` table: `amount` (10,2) -> `amount` (10,4).
*   **Action:** Update `PaymentService` and `Order` model to remove integer casting and use float/decimal math.

### Step 2: Validate Frontend Integration
*   Ensure the frontend `cart-store` handles the decimal precision correctly when sending data to the backend.
*   Verify `stripe-payment-form` correctly handles the decimal values.

### Step 3: Test Coverage
*   Update backend tests (`OrderControllerTest`, `PaymentServiceTest`) to use decimal values (e.g., `12.3456`) and verify GST calculations (9%) are accurate without rounding errors until the final total.

### Step 4: InvoiceNow Integration (Phase 6)
*   Once the financial schema is fixed, implement the UBL 2.1 XML generation.

## 6. Development Guidelines for New Agents
1.  **Check Schema First:** Before writing any financial logic, verify the column type. If it's `integer`, STOP and fix the schema.
2.  **Use `retro-*` Components:** Never import raw UI components. Always use the wrappers in `frontend/src/components/ui`.
3.  **Strict Typing:** Ensure TypeScript interfaces in `frontend` match the fixed Laravel models (e.g., `price` as `number` or `string` for high precision, not integer cents).
