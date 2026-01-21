# AGENTS.md - Operational Guide & Single Source of Truth

**Version:** 1.0.0
**Last Updated:** January 21, 2026
**Context:** Morning Brew Collective - Singapore Heritage E-commerce Platform

---

## 🤖 Agent Prime Directive

You are an expert software engineer and architect acting as a core contributor to the Morning Brew Collective project. Your work must strictly adhere to the **Meticulous Approach** and **Anti-Generic Design Philosophy**.

**Core Mandates:**
1.  **Backend is Truth:** The Laravel backend is the source of truth for data integrity, inventory locks, and financial precision (`DECIMAL(10,4)`).
2.  **Frontend is Soul:** The Next.js frontend handles UX, aesthetics ("Retro-Futuristic Kopitiam"), and accessibility (WCAG AAA).
3.  **Compliance is Non-Negotiable:** Singapore GST (9%), PDPA, and precision rules must be followed exactly.
4.  **No "AI Slop":** Reject generic designs. Use bespoke `retro-*` components. Ensure every pixel serves the narrative.

---

## 🛠️ Operational Commands (Build / Lint / Test)

The project uses a `Makefile` to standardize all operations. **Always** use these commands over direct docker or shell commands when possible.

### 🚀 Setup & Build
*   **Start Environment:** `make up` (Starts Postgres, Redis, Backend, Frontend, Mailpit)
*   **Install Dependencies:** `make install` (Runs `npm install` & `composer install`)
*   **Stop Environment:** `make down`
*   **View Logs:** `make logs` (or `make logs-backend`, `make logs-frontend`)
*   **Access Shell:**
    *   Backend: `make shell-backend`
    *   Frontend: `make shell-frontend`

### 🧪 Testing
*   **Run All Tests:** `make test`
*   **Run Backend Tests:** `make test-backend`
*   **Run Frontend Tests:** `make test-frontend`
*   **Run Single Backend Test (File):**
    ```bash
    docker compose exec backend php artisan test tests/Api/OrderControllerTest.php
    ```
*   **Run Single Backend Test (Method):**
    ```bash
    docker compose exec backend php artisan test --filter=test_order_creation_structure
    ```
*   **Run Single Frontend Test (File):**
    ```bash
    docker compose exec frontend npx vitest run tests/unit/components/retro-button.test.tsx
    ```

### 🧹 Linting & formatting
*   **Lint All:** `make lint`
*   **Fix Linting:** `make lint-fix`
*   **Format Code:** `make format`
*   **Type Check (TypeScript):** `make typecheck` (or `npx tsc --noEmit` inside frontend container)
*   **Static Analysis (PHP):** `make analyze` (PHPStan)

### 🗄️ Database
*   **Migrate:** `make migrate`
*   **Fresh Migration (Reset + Seed):** `make migrate-fresh`
*   **Seed Only:** `make seed`

---

## 📐 Code Style & Conventions

### Frontend (Next.js 15 + TypeScript)
*   **Stack:** Next.js 15 (App Router), React 19, TypeScript 5.4, Tailwind CSS 4.0, Zustand.
*   **Styling:**
    *   **Strictly** use CSS Variables defined in `tokens.css` (e.g., `var(--color-sunrise-amber)`).
    *   **Do NOT** use raw hex codes or RGB values in components.
    *   **Tailwind v4:** Use the `@theme` block in `tokens.css`.
*   **Components:**
    *   **Library Discipline:** NEVER use raw Shadcn/Radix primitives directly in pages. Use the wrapper components in `src/components/ui/` (e.g., `retro-button`, `retro-dialog`).
    *   **Structure:** Functional components with typed props.
*   **State Management:** Use Zustand for global client state (Cart, Payment).
*   **Imports:** Group imports: React/Next -> Third-party -> Internal components -> Stores/Hooks/Utils.

### Backend (Laravel 12 + PHP 8.3)
*   **Architecture:** API-First, Service-Oriented (Controllers -> Services -> Models).
*   **Financial Precision:**
    *   **CRITICAL:** ALL financial values (prices, tax, subtotal) MUST be stored and calculated as `DECIMAL(10,4)`.
    *   **NEVER** use integers for money (cents) in the database or internal logic. Conversion to cents happens **only** at the Stripe API boundary (`StripeService`).
*   **Services:**
    *   Use `PaymentService` for orchestration.
    *   Use `StripeService` / `PayNowService` for provider specifics.
    *   Use `InventoryService` for Redis-based two-phase locking.
*   **Security:**
    *   Use `VerifyOrderOwnership` middleware for **Zero-Trust** order access (verifies `user_id` OR `email`+`invoice`).

### General
*   **Naming:**
    *   Variables/Functions: `camelCase` (JS), `camelCase` (PHP methods), `snake_case` (PHP variables/DB columns).
    *   Classes: `PascalCase`.
    *   Constants: `UPPER_SNAKE_CASE`.
*   **Comments:** Explain *WHY*, not *WHAT*.
*   **Commits:** Conventional Commits (e.g., `feat(payment): add paynow qr component`, `fix(db): correct decimal precision`).

---

## 🏗️ Architecture & Critical Technical Decisions

### 1. DECIMAL(10,4) Mandate
Singapore GST (9%) requires high precision to avoid rounding errors.
*   **Database:** `DECIMAL(10,4)` column type.
*   **Backend:** PHP `float` (carefully managed) or `bcmath` if needed.
*   **Frontend:** `number` type, displayed with `toFixed(2)`.
*   **Stripe:** Convert to integer cents **only** immediately before sending the API request.

### 2. Two-Phase Inventory Lock
1.  **Reserve:** Redis atomic decrement (`INCRBY -qty`) + Expiry (15 mins).
2.  **Commit:** On payment success webhook -> PostgreSQL decrement + Redis key deletion.
*   See `backend/app/Services/InventoryService.php`.

### 3. Payment Flow & Webhooks
*   **Status Updates:** Order status moves from `pending` -> `processing` -> `completed` **ONLY** via Webhooks (`WebhookController`). Do not update status directly from the frontend return URL.
*   **Idempotency:** `PaymentService` checks for duplicate processing.

### 4. Visual Design System ("Sunrise at the Kopitiam")
*   **Colors:** Sunrise Amber, Terracotta Warm, Espresso Dark, Cream White.
*   **Motion:** `bean-bounce`, `steam-rise` animations.
*   **Typography:** Fraunces (Headings), DM Sans (Body).

---

## 🚨 Common Pitfalls to AVOID

1.  **Redis Double-Prefixing:** Laravel prefixes Redis keys. Do not double-prefix when using `MGET` or raw commands. Check `InventoryService` for the correct pattern.
2.  **Transaction Abortion:** Do NOT perform non-critical operations (like logging or consent recording) inside the main DB transaction. If they fail, they roll back the order. Move them outside.
3.  **Invalid HTML Nesting:** Do NOT put `<div>` inside `<svg>` or `<p>` inside `<p>`. This causes hydration errors. Use SVG primitives or `foreignObject`.
4.  **Tailwind v4 Config:** Colors are defined in CSS `@theme`. Do not mix legacy `tailwind.config.js` color definitions with CSS variables unless necessary.

---

## 📝 Workflow for Agents

1.  **Analyze:** Read `MASTER_EXECUTION_PLAN.md` and related status files. Understand the *intent* and *context*.
2.  **Plan:** Formulate a step-by-step plan. Validate it against the architecture rules above.
3.  **Implement:** Write code that adheres to the style guide.
4.  **Verify:**
    *   Run tests (`make test`).
    *   Run linting (`make lint`).
    *   **Crucial:** Check the build (`npm run build` in frontend) to catch type/config errors.
5.  **Document:** Update status files (`status_current.md`) and report progress.

---

**This file is the Single Source of Truth for Agent Operations.**
Refer to `Project_Architecture_Document.md` for deeper architectural details.
