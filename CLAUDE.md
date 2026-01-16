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

**Next Immediate Action:** Continue Phase 2 implementation. Focus on building out the **Menu**, **Heritage**, and **Locations** pages in the Next.js App Router, leveraging the existing design tokens and retro components.
