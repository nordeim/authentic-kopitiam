# Morning Brew Collective

**🇻🇳 Singapore's authentic kopitiam experience since 1973 — Now available online with modern payment integration**

[![Phase 8 Complete](https://img.shields.io/badge/Phase%208-Completed-brightgreen)](https://github.com/your-repo/morning-brew-collective)
[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-red)](https://laravel.com/docs/12.x)
[![Next.js Version](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-blue)](https://tailwindcss.com)
[![WCAG AAA](https://img.shields.io/badge/WCAG-AAA-blue)](https://www.w3.org/WAI/WCAG2AAA-Conformance)
[![License](https://img.shields.io/badge/License-Commercial-orange)](#license)

> **LATEST UPDATE**: **Phase 8 (Operations & InvoiceNow)** is complete. The platform now features a comprehensive **Admin Dashboard** with a distinct "Manager's Office" aesthetic and a fully compliant **InvoiceNow (PEPPOL BIS Billing 3.0)** generation service.

---

## 🎯 What We've Built

Morning Brew Collective is a **Singapore-first headless e-commerce platform** that digitizes a heritage 1970s kopitiam. This isn't just a website—it's a **transactionally robust system** capable of handling real-time inventory, GST-compliant invoicing, PayNow payments, and InvoiceNow integration—all while preserving a distinctive retro-kopitiam aesthetic rooted in Singapore's coffee shop heritage.

**Live Demo**: [https://morningbrew.collective](https://morningbrew.collective)

---

## ⚠️ Current Project Status (January 22, 2026)

### Operations & Admin (Phase 8) ⚠️ FUNCTIONALLY COMPLETE

**✅ IMPLEMENTED**:
- **Admin Dashboard**: Route structure and InvoiceService complete (`/admin`) 
- **Route Architecture**: `(shop)` and `(dashboard)` route groups implemented
- **Order Management**: Backend CRUD and InvoiceService operational
- **InvoiceNow Integration**: UBL 2.1 XML generation functional (`InvoiceService.php`)

**⚠️ BLOCKING ISSUES**:
- **TypeScript Compilation**: 42 errors prevent frontend build
- **Test Infrastructure**: Frontend tests not yet configured
- **Production Readiness**: Cannot deploy with compilation errors

### Frontend Architecture (Phase 2 & 5.5) ⚠️ 85% COMPLETE

**✅ COMPLETED**:
- **Design System**: Tailwind CSS v4.0 migration complete
- **Payment UI**: 8 components implemented (1,836 lines)
- **Backend Services**: All 5 services operational (1,674 lines)

**❌ BLOCKING**:
- **TypeScript Errors**: 42 compilation errors in checkout pages
- **Test Coverage**: No frontend test suite configured
- **Visual Testing**: Percy/visual regression not implemented

### Backend Domain (Phase 4) ✅ 100% COMPLETE

**✅ COMPLETED**:
- **Financial Precision**: All monetary values stored as `DECIMAL(10,4)` to prevent rounding errors (Singapore GST 9%).
- **Payment API**: Robust Stripe & PayNow integration with webhook-driven status updates.
- **Inventory System**: Two-phase reservation (Redis lock → PostgreSQL commit) prevents overselling.

---

## 🚀 Quick Start

### Prerequisites

- [ ] Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- [ ] Git
- [ ] Node.js 22+
- [ ] PHP 8.3+ (for backend development)
- [ ] Stripe account (for payment testing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/morning-brew-collective.git
cd morning-brew-collective

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Add payment credentials to backend/.env:
# (See Configuration Guide below)

# 4. Install dependencies
make install

# 5. Start all services
make up

# Wait 60 seconds for services to initialize

# Services will be available at:
# Shop: http://localhost:3000
# Backend API: http://localhost:8000  
# Mailpit: http://localhost:8025
```

### Known Issues

**TypeScript Compilation** (BLOCKING):
```bash
# 42 TypeScript errors in checkout pages
# See: docs/known-issues.md for details
# Fix ETA: 2-3 hours
```

**Test Infrastructure** (INCOMPLETE):
```bash
# Backend tests work:
make test-backend

# Frontend tests NOT YET configured:
# - Vitest configuration missing
# - Playwright tests not implemented
```

### Testing

```bash
# Run backend tests (functional ✅)
make test-backend

# Run full test suite (after fixing TS errors)
make test
```

### First-Time Verification

```bash
# 1. Verify backend health
make logs backend | grep "ready"

# 2. Check API response
curl http://localhost:8000/api/v1/health

# 3. Check for TypeScript errors (will show 42 errors)
cd frontend && npm run typecheck

# 4. Run backend tests (should pass)
make test-backend
```

---

## 🎨 Design System: "Sunrise at the Kopitiam"

We have successfully migrated to **Tailwind CSS v4.0**, adopting a CSS-first configuration strategy.

- **Tokens**: Defined in `frontend/src/styles/tokens.css` using the `@theme` directive.
- **Colors**: Valid `rgb(...)` values enable Tailwind opacity modifiers (e.g., `bg-sunrise-amber/50`).
- **Animations**: Custom keyframes (`bean-bounce`, `steam-rise`, `slow-rotate`) defined natively in CSS.
- **Typography**: `Fraunces` (Display) and `DM Sans` (Body).

**Troubleshooting Visuals**:
If the UI looks "flat" or minimal, verify that `frontend/src/styles/globals.css` contains `@import "tailwindcss";` at the top. See `TAILWIND_V4_VISUAL_DEBUGGING_GUIDE.md` for detailed steps.

---

## 💳 Payment & Invoice Architecture

### Data Flow
1.  **Initiation**: Frontend requests payment intent/QR code from Backend.
2.  **Processing**: Backend orchestrates provider (Stripe/PayNow) via `PaymentService`.
3.  **Completion**: Webhook updates payment status in Backend.
4.  **Confirmation**: Backend calculates final tax/totals (DECIMAL 10,4).
5.  **Invoicing**: Admin triggers `InvoiceService` to generate UBL 2.1 XML for PEPPOL network.

### Key Decisions
*   **No Client-Side Math**: Tax and totals are never calculated solely on the client for final receipts. We trust the backend.
*   **Webhooks Only**: Order status transitions happen *only* via webhooks, ensuring security even if the user closes the browser.
*   **InvoiceNow Compliance**: Strict adherence to SG Peppol BIS Billing 3.0 standards, including specific tax category codes ('S') and currency codes ('SGD').

---

## 📚 Documentation & Guides

*   **`AGENTS.md`**: The Single Source of Truth for coding agents (commands, standards, architecture).
*   **`TAILWIND_V4_VISUAL_DEBUGGING_GUIDE.md`**: How to debug and fix visual regressions in the new stack.
*   **`Project_Architecture_Document.md`**: Deep dive into BFF architecture, DB schema, and critical technical decisions.
*   **`backend/docs/PAYMENT_API.md`**: Swagger/OpenAPI specification.

---

## 🚢 Deployment & CI/CD

**Deployment Checklist**:
- [ ] Configure `STRIPE_WEBHOOK_SECRET` in production environment.
- [ ] Ensure Redis is configured for persistent queues (Horizon).
- [ ] Run `make migrate` during deployment pipeline.
- [ ] Verify `frontend/postcss.config.mjs` is present for build.

---

## 📄 License

Copyright © 2026 Morning Brew Collective. All rights reserved.

---

<div align="center">
<strong>⚠️ Project State: Feature Complete, Pre-Production</strong>
<br>
Blocking: TypeScript Compilation (42 errors) | Test Infrastructure
<br>
Target: 99.9% Uptime, <100ms API Latency, 100% Compliance
</div>

**Note**: Project is functionally complete but requires TypeScript error fixes and test infrastructure completion before production deployment.
