# Morning Brew Collective — Codebase Deep Understanding Handbook (Validated)

**Purpose**

This document is a *single-source-of-truth onboarding handbook* for new coding agents working on `nordeim/authentic-kopitiam`.

- All claims below are validated against the committed code in this repo.
- Where the codebase shows **inconsistency** (e.g. frontend calling endpoints that do not exist), this is explicitly flagged.
- Values from `.env` files are **not readable** (gitignored), so environment-specific behavior is described by **variable name** and by **committed defaults**.

---

## 1) What this project is

A Singapore heritage kopitiam ordering + payments platform.

- **Frontend:** Next.js 15 (React 19) in `frontend/`
- **Backend:** Laravel 12 (PHP 8.3+) API in `backend/`
- **Infrastructure (local/dev):** Docker Compose with Postgres 16 + Redis 7 + Mailpit

**Primary product flows implemented in code**

- Browse products / locations (public endpoints exist)
- Create orders (backend API exists)
- Payments: PayNow + Stripe services exist in backend; frontend payment UI exists
- Admin dashboard UI shell exists, but most admin data features are placeholders

---

## 2) Why the architecture is shaped this way

### 2.1 Separation of concerns

- **Laravel backend is the source of truth** for:
  - Persistence (Postgres)
  - Financial logic (GST, totals)
  - Payment provider integrations (Stripe + PayNow)
  - Auth token issuance and authorization checks
  - Inventory reservation/commit (Redis + DB)

- **Next.js frontend is the UI/UX layer** for:
  - Shop/cart/checkout UX
  - Payment flows and UI resiliency
  - Admin dashboard UX shell

### 2.2 Compliance goals (validated)

- **GST 9%** is hard-coded in backend calculation (`Order::calculateTotal()`) using `round(..., 4)`.
- Monetary columns in DB migrations are **DECIMAL(10,4)** for orders/products/payments.

---

## 3) How to run the system (validated)

### 3.1 Docker Compose topology

From `docker-compose.yml`:

- `postgres` on `localhost:5432`
- `redis` on `localhost:6379`
- `backend` on `localhost:8000`
- `frontend` on `localhost:3000`
- `mailpit` on `localhost:8025` (web) + `1025` (smtp)

`frontend` container sets:

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

### 3.2 Makefile entry points

From root `Makefile`:

- `make install` installs frontend npm deps + backend composer deps.
- `make up` starts all services.
- `make migrate` / `make migrate-fresh` run Laravel migrations.
- `make test-backend` runs Laravel tests inside container.
- `make test-frontend` runs frontend tests (`npm test`) inside container.

---

## 4) Repo map (validated)

### 4.1 Top-level

- `frontend/` — Next.js app
- `backend/` — Laravel API
- `docker-compose.yml` — local stack
- Many existing status/validation docs exist, but this handbook is intended to be the operational onboarding truth.

### 4.2 Frontend routing structure (Next.js App Router)

In `frontend/src/app/`:

- `(auth)/login/page.tsx`, `(auth)/register/page.tsx`
- `(shop)/...` pages including checkout
- `(dashboard)/layout.tsx` wraps admin area
- `unauthorized/page.tsx` (403 page)

**Important:** No Next.js `app/api/*` routes were found in the codebase (no `route.ts` under `src/app`).

---

## 5) Backend API surface (validated)

### 5.1 Versioning + routing

Routes live in `backend/routes/api.php` and are grouped under:

- `/api/v1/*`

Key route groups:

- **Public auth (rate-limited):**
  - `POST /api/v1/register` (throttle:auth-register)
  - `POST /api/v1/login` (throttle:auth-login)

- **Public read-only:**
  - `GET /api/v1/products`
  - `GET /api/v1/products/{product}`
  - `GET /api/v1/locations`
  - `GET /api/v1/locations/{location}`

- **Authenticated (`auth:sanctum`):**
  - `POST /api/v1/logout`
  - `GET /api/v1/me`
  - `POST /api/v1/refresh`
  - `orders` resource (index/show/store/destroy)
  - `PUT /api/v1/orders/{id}/status` guarded by `order.ownership`
  - Payments:
    - `POST /api/v1/payments/{order}/paynow`
    - `POST /api/v1/payments/{order}/stripe`
    - `GET /api/v1/payments/{payment}`
    - `POST /api/v1/payments/{payment}/refund`

- **Admin (`auth:sanctum` + `admin` middleware) under `/api/v1/admin/*`:**
  - Admin product/location CRUD
  - Admin orders index/show/status update

### 5.2 Middleware aliases (Laravel 12 bootstrap style)

In `backend/bootstrap/app.php`:

- Adds `EnsureFrontendRequestsAreStateful` to API middleware **prepend**.
- Defines aliases:
  - `admin` => `App\Http\Middleware\EnsureUserIsAdmin`
  - `order.ownership` => `App\Http\Middleware\VerifyOrderOwnership`
  - `verified` => `App\Http\Middleware\EnsureEmailIsVerified` (note: file existence not validated here)

---

## 6) Authentication & authorization (validated)

### 6.1 Backend auth model

- User model: `backend/app/Models/User.php`
  - Includes `Laravel\Sanctum\HasApiTokens`
  - Has `role` field and `isAdmin()` helper.

- Migration adds role:
  - `backend/database/migrations/2026_01_23_000001_add_role_to_users_table.php`
  - `role` is enum: `customer|admin`, default `customer`.

### 6.2 Token issuance & session model

Auth endpoints are implemented in:

- `backend/app/Http/Controllers/Api/AuthController.php`

Key behaviors:

- **Register:** creates user with role `customer`, issues Sanctum token (`createToken('auth-token')`).
- **Login:** validates credentials, revokes all previous tokens (`$user->tokens()->delete()`), issues a new token.
- **Logout:** deletes *current* token.
- **Refresh:** deletes current token and issues a new one.

### 6.3 Admin authorization

- Backend: `EnsureUserIsAdmin` returns 403 JSON if `role !== 'admin'`.
- Frontend: `frontend/src/components/auth/protected-route.tsx` blocks rendering and redirects if:
  - not authenticated -> `/login`
  - authenticated but not admin -> `/unauthorized`

**Important security note (validated):** frontend route protection is **client-side only** (no Next.js middleware found). Backend still enforces admin for `/api/v1/admin/*`, which is the authoritative security barrier.

### 6.4 Frontend auth storage and propagation

- Zustand store: `frontend/src/store/auth-store.ts`
- API client: `frontend/src/lib/auth-api.ts`

Validated behavior:

- Token is stored in `localStorage` under `auth_token`.
- `authApi` attaches `Authorization: Bearer <token>`.
- `AuthProvider` calls `checkAuth()` on mount.

**Critical integration mismatch (validated):**

- `auth-api.ts` builds:
  - `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'`
- Docker Compose sets `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.
- Therefore, login/register calls become:
  - `http://localhost:8000/api/register` and `http://localhost:8000/api/login`
- But the backend routes are:
  - `/api/v1/register` and `/api/v1/login`

This means **auth will 404 unless the env var includes `/v1`** or the client code is adjusted.

---

## 7) “Backend for Frontend” (BFF) reality check (validated)

### 7.1 What exists

- The frontend contains client-side API wrappers (e.g. `auth-api.ts`, `lib/api/payment-api.ts`).
- The backend exposes a versioned REST API.

### 7.2 What does NOT exist (despite “BFF” language in some docs)

- No Next.js API routes (`src/app/api/**/route.ts`) were found.
- No Next.js `middleware.ts` was found.
- No Next.js rewrites/proxy rules were found in `frontend/next.config.ts`.

### 7.3 Consequence

Many frontend calls use relative URLs like `/api/v1/...`.

Without a Next-side proxy/rewrite, those requests will hit **the Next.js server** at `localhost:3000/api/v1/...` and will likely 404.

Examples (validated):

- `frontend/src/components/payment/payment-method-selector.tsx` calls:
  - `fetch('/api/v1/payments/methods/paynow/available')`
- `frontend/src/hooks/use-payment-status.ts` calls:
  - `fetch(`/api/v1/payments/${paymentId}`)`
- `frontend/src/lib/graceful-payment-fallback.tsx` calls:
  - `fetch('/api/v1/orders', ...)`

**To be production-correct, you need one of:**

- A Next.js proxy layer (rewrites or API routes), OR
- All frontend calls must use absolute backend URLs (via `NEXT_PUBLIC_API_URL`) consistently, OR
- A reverse proxy (nginx) that routes `/api/*` to the backend.

This repo currently does **not** implement that proxy inside Next.js.

---

## 8) Payments (validated + inconsistencies flagged)

### 8.1 Backend payment architecture

- `PaymentService.php` orchestrates:
  - PayNow QR generation via `PayNowService`
  - Stripe PaymentIntent creation via `StripeService`
  - Webhook handling via `processWebhook(...)`

- `StripeService.php` converts decimal dollars to cents internally.
- `PayNowService.php` calls an external PayNow API endpoint (`/api/v1/qr/generate`).

### 8.2 Backend payment endpoints vs frontend client mismatches

**Backend route definitions (validated):**

- `POST /api/v1/payments/{order}/paynow` => `PaymentController::createPayNowPayment(Order $order, Request $request)`
- `POST /api/v1/payments/{order}/stripe` => `PaymentController::createStripePayment(Order $order, Request $request)`

**Backend controller validation (validated):**

- PayNow endpoint requires:
  - `amount` (required)
  - `reference_number` (required)

- Stripe endpoint requires:
  - `payment_method_id` (required)
  - `amount` (required)

**Frontend PaymentApiClient requests (validated):**

- `createPayNowPayment(orderId)` sends **no body**.
- `createStripePayment(orderId, amount)` sends body `{ amount }` but **no `payment_method_id`**.

Therefore, the current frontend client will **fail validation** against the backend controller as written.

### 8.3 Payment “availability/health” endpoints mismatch

Frontend calls these endpoints (validated):

- `/api/v1/payments/methods/paynow/available`
- `/api/v1/payments/methods/stripe/available`
- `/api/v1/payments/health`

Backend `routes/api.php` does **not** define these endpoints.

### 8.4 Payment schema precision mismatch

- DB migration: `payments.amount` is `decimal(10,4)`.
- Backend model casts in `Payment.php`:
  - `amount` => `decimal:2`
  - `refunded_amount` => `decimal:2`

This contradicts the DECIMAL(10,4) intent.

---

## 9) Orders, GST, and financial precision (validated + pitfalls)

### 9.1 DB schema

- Orders totals are `DECIMAL(10,4)`:
  - `orders.subtotal`, `orders.gst_amount`, `orders.total_amount`
- Products price is `DECIMAL(10,4)`.

### 9.2 Backend GST computation

In `Order::calculateTotal()`:

- `gst_amount = round(subtotal * 0.09, 4)`
- `total_amount = round(subtotal + gst_amount, 4)`

### 9.3 Frontend decimal handling

- `frontend/src/lib/decimal-utils.ts` uses `SCALE = 10000` and integer math for add/multiply/GST.
- Cart totals in `cart-store.ts` use `decimal.*` helpers.

**Pitfall (validated):** `PaymentMethodSelector` displays GST as `(amount * 0.09).toFixed(2)` rather than the decimal util.

---

## 10) Inventory management (validated)

Inventory is a two-phase system:

- **Reserve (Redis):** `InventoryService::reserve()`
  - Soft-reserves by setting `inventory:reserve:<token>:<productId>` with TTL
  - Also increments `inventory:reserved:<productId>` to reflect reserved stock

- **Commit (Postgres + Redis cleanup):** `InventoryService::commit()`
  - Scans reservation keys and decrements stock in Postgres under `lockForUpdate()`
  - Deletes reservation keys and decrements reserved counters

**Validated TTL:** `RESERVATION_TTL = 300` seconds (5 minutes).

---

## 11) Admin dashboard (validated)

### 11.1 Frontend admin routes

- Layout: `frontend/src/app/(dashboard)/layout.tsx`
  - Wraps children in `<ProtectedRoute requireAdmin>`
  - Includes `AdminSidebar` and `AdminHeader`

- Pages:
  - `frontend/src/app/(dashboard)/admin/page.tsx` — static dashboard UI (hardcoded numbers)
  - `.../admin/orders/page.tsx` — placeholder (“coming soon...”) no data wiring
  - `.../admin/inventory/page.tsx` — placeholder
  - `.../admin/settings/page.tsx` — placeholder

### 11.2 Backend admin APIs

Admin APIs exist under:

- `/api/v1/admin/*`

But the frontend admin pages do not currently call them.

---

## 12) Known high-impact issues (validated)

These are the key “agent traps” that will cause broken behavior or incorrect assumptions:

- **[No true BFF]** No Next.js API proxy layer exists; relative `/api/v1/*` calls are likely wrong.
- **[NEXT_PUBLIC_API_URL mismatch]** Docker Compose sets `NEXT_PUBLIC_API_URL=http://localhost:8000/api`, but frontend auth client defaults to `/api/v1` and payment client appends `/api/v1` again.
- **[Payments API contract mismatch]** Frontend payment client does not satisfy backend controller validation.
- **[Missing endpoints]** Frontend references payment health/availability endpoints that backend does not define.
- **[Precision mismatch]** `Payment` model casts decimals to 2dp while DB uses 4dp.
- **[Admin UI not wired]** Admin pages are largely static/placeholder.

---

## 13) Agent onboarding checklist (do this before touching code)

- Confirm the expected API base URL contract:
  - Decide whether frontend will call backend directly via `NEXT_PUBLIC_API_URL` or via a Next proxy.
- Validate auth flow by hitting:
  - `POST /api/v1/register`, `POST /api/v1/login`, `GET /api/v1/me`
- Validate payment flow contract alignment:
  - Ensure frontend request bodies match `PaymentController` validations.
- Decide authoritative ID:
  - Orders have both `id` (uuid) and `invoice_number`.
  - Frontend sometimes treats `orderId` as invoice number.
- Run backend tests first (`make test-backend`) to avoid breaking core compliance logic.

---

## 14) Suggested next PR targets (non-authoritative)

- Implement a real BFF/proxy layer in Next.js (rewrites or API routes) **or** normalize all frontend calls to absolute backend URLs.
- Align payment API request/response contracts between frontend and backend.
- Add missing payment availability/health endpoints or remove those calls.
- Fix `Payment` model decimal casts to `decimal:4` if DECIMAL(10,4) is the invariant.
- Wire admin dashboard pages to `/api/v1/admin/*` endpoints with server-side or client-side data fetching.

---

**Status:** Handbook created from codebase validation on 2026-01-23.
