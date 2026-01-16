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

## 7. Interaction Guidelines for AI Agents
When working on this project:
1.  **Read `MASTER_EXECUTION_PLAN.md`** and the relevant sub-plan (e.g., `.claude/PHASE_2_SUBPLAN.md`) before taking action.
2.  **Verify against `static_landing_page_mockup.html`** for any visual implementation.
3.  **Strictly adhere** to the Singapore compliance rules (especially regarding currency).
4.  **Use the `retro-*` components** instead of generic UI elements.
5.  **Always Validate** your plan with the user before writing code.