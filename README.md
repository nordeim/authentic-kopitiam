# Morning Brew Collective

**🇻🇳 Singapore's authentic kopitiam experience since 1973 — Now available online with modern payment integration**

[![Payment Integration Status](https://img.shields.io/badge/Phase%205.5-Completed-brightgreen)](https://github.com/your-repo/morning-brew-collective)
[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-red)](https://laravel.com/docs/12.x)
[![Next.js Version](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-blue)](https://tailwindcss.com)
[![WCAG AAA](https://img.shields.io/badge/WCAG-AAA-blue)](https://www.w3.org/WAI/WCAG2AAA-Conformance)
[![License](https://img.shields.io/badge/License-Commercial-orange)](#license)

> **LATEST UPDATE**: Phase 5.5 (Frontend Polish & Compliance) is complete. The application now runs on **Tailwind CSS v4.0** with a fully restored "Sunrise at the Kopitiam" aesthetic, zero build errors, and end-to-end `DECIMAL(10,4)` financial precision for Singapore GST compliance.

---

## 🎯 What We've Built

Morning Brew Collective is a **Singapore-first headless e-commerce platform** that digitizes a heritage 1970s kopitiam. This isn't just a website—it's a **transactionally robust system** capable of handling real-time inventory, GST-compliant invoicing, PayNow payments, and InvoiceNow integration—all while preserving a distinctive retro-kopitiam aesthetic rooted in Singapore's coffee shop heritage.

**Live Demo**: [https://morningbrew.collective](https://morningbrew.collective)

---

## ✅ Current Project Status (January 21, 2026)

### Frontend Architecture (Phase 2 & 5.5) ✅ 100% COMPLETE

**✅ COMPLETED**:
- **Design System**: Fully migrated to **Tailwind CSS v4.0** (CSS-first configuration).
- **Aesthetic Restoration**: Fixed "flat/minimal" regressions; restored sunburst animations, gradients, and retro styling.
- **Build Stability**: Resolved all Next.js hydration errors, unused variable warnings, and Type discrepancies.
- **Payment UI**: 8 production-ready components (PayNow QR, Stripe Elements, Status Tracker).
- **Compliance**: Frontend types and calculations now strictly use `number` (decimal) to align with backend `DECIMAL(10,4)` precision.

### Backend Domain (Phase 4) ✅ 100% COMPLETE

**✅ COMPLETED**:
- **Financial Precision**: All monetary values stored as `DECIMAL(10,4)` to prevent rounding errors (Singapore GST 9%).
- **Payment API**: Robust Stripe & PayNow integration with webhook-driven status updates.
- **Inventory System**: Two-phase reservation (Redis lock → PostgreSQL commit) prevents overselling.
- **Security**: Zero-trust `VerifyOrderOwnership` middleware implemented.
- **Service Layer**: Provider-specific services (Stripe/PayNow) isolated from orchestration logic.

### Payment Integration (Phase 5) ✅ **100% COMPLETE**

**🎉 BREAKTHROUGH**: Full-stack payment flow is operational and compliant.

- **Authoritative Data**: Frontend confirmation pages display GST and subtotal values *directly from the backend*, ensuring 100% accuracy.
- **Resilience**: Hydration mismatches in SVG animations (SteamRise) fixed via architectural refactoring.
- **Testing**: Comprehensive backend test suite (11/11 passing) validating financial logic.

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

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000  
# Mailpit: http://localhost:8025
# Database: localhost:5432
```

### Testing

```bash
# Run backend payment tests (PHPUnit)
make test-backend

# Run frontend component tests (Vitest)
make test-frontend

# Run full suite
make test
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

## 💳 Payment Architecture

### Data Flow
1.  **Initiation**: Frontend requests payment intent/QR code from Backend.
2.  **Processing**: Backend orchestrates provider (Stripe/PayNow) via `PaymentService`.
3.  **Completion**: Webhook updates payment status in Backend.
4.  **Confirmation**: Backend calculates final tax/totals (DECIMAL 10,4).
5.  **Display**: Frontend fetches authoritative order details to display receipt.

### Key Decisions
*   **No Client-Side Math**: Tax and totals are never calculated solely on the client for final receipts. We trust the backend.
*   **Webhooks Only**: Order status transitions happen *only* via webhooks, ensuring security even if the user closes the browser.
*   **Soft Deletes**: Payment records are soft-deleted for audit trails (7-year retention).

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
<strong>🏆 Project State: Production Ready</strong>
<br>
Targeting: 99.9% Uptime, <100ms API Latency, 100% Compliance
</div>