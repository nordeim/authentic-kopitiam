# Project Architecture Document - Quick Start
## How to Use This Handbook

This document serves as the **single source of truth** for Morning Brew Collective architecture. New developers and AI agents should read this comprehensively before making changes.

## 📖 Reading Order

### **Session 1 (30 minutes): Foundation**
1. **System Overview** - BFF architecture patterns
2. **File Hierarchy** - Key files and their responsibilities
3. **Critical Technical Decisions** - 7 key architectural decisions

### **Session 2 (45 minutes): Database & Flow**
4. **Database ERD** - Table relationships and DECIMAL(10,4) compliance
5. **Order Flow** - Two-phase inventory lock sequence
6. **Design Architecture** - Retro-fit aesthetic implementation

### **Session 3 (60 minutes): Practical Implementation**
7. **Onboarding Guide** - Day-by-day setup instructions
8. **Development Commands** - Copy-paste command reference
9. **Troubleshooting** - Common errors and solutions

### **Session 4 (30 minutes): Standards**
10. **PR Checklist** - Pre-submission validation gates
11. **Additional Resources** - External service configuration

---

## 🎯 Core Concepts to Internalize

### 1. **DECIMAL(10,4) Compliance is Mandatory**
- All financial values use 4 decimal precision
- Stripe conversion happens at API boundary only
- Frontend uses decimal-utils.ts with SCALE=10000
- GST calculated as 9% of subtotal, rounded to 4 decimals

**Files to Study:**
- `backend/app/Models/Order.php` (casts)
- `frontend/src/lib/decimal-utils.ts` (precision arithmetic)
- `backend/app/Services/StripeService.php` (cents conversion)

### 2. **Two-Phase Inventory Lock**
- Phase 1: Redis reservation (atomic INCRBY)
- Phase 2: PostgreSQL commit on payment success
- Reservation expires after 15 minutes
- Prevents overselling at scale

**Files to Study:**
- `backend/app/Services/InventoryService.php` (Redis operations)
- `backend/app/Http/Controllers/Api/OrderController.php` (order creation)

### 3. **VerifyOrderOwnership Middleware = Zero Trust**
- Never assume auth user owns order
- Authenticated users: verify order.user_id
- Guest users: verify customer_email + invoice_number
- Prevents IDOR (CWE-639)

**Files to Study:**
- `backend/app/Http/Middleware/VerifyOrderOwnership.php`
- `backend/routes/api.php` (middleware application)

### 4. **Service Layer = Provider Abstraction**
- PaymentService orchestrates
- StripeService / PayNowService implement provider details
- Easy to add new providers (GrabPay, PayPal)
- Centralized webhook handling

**Files to Study:**
- `backend/app/Services/PaymentService.php` (orchestration)
- `backend/app/Services/StripeService.php` (provider-specific)

### 5. **Retro-fit Design = No AI Slop**
- Use retro-* wrappers, not plain Shadcn components
- Custom CSS tokens defined in tokens.css
- WCAG AAA strict compliance (7:1 contrast)
- 1970s kopitiam aesthetic throughout

**Files to Study:**
- `frontend/src/styles/tokens.css` (color tokens)
- `frontend/src/styles/animations.css` (custom animations)
- Examples: `retro-button`, `retro-card`, `retro-dialog`

---

## 🚀 Immediate Actions for New Developer

### Day 1: Setup (1 hour)

1. **Clone and Build**
   ```bash
   git clone <repository-url> authentic-kopitiam
   cd authentic-kopitiam
   cp backend/.env.example backend/.env
   make up  # Wait 60 seconds
   ```

2. **Verify Health**
   ```bash
   make status
   curl http://localhost:8000/api/v1/health
   open http://localhost:3000
   ```

3. **Run First Test**
   ```bash
   make test order
   # Should return: Tests: 11 passed
   ```

### Day 2: Code Exploration (2 hours)

**Backend Exploration:**
```bash
# Study the order flow
nano backend/app/Http/Controllers/Api/OrderController.php
nano backend/app/Services/InventoryService.php
nano backend/app/Models/Order.php

# Run tests to understand behavior
make test inventory
make test payment
```

**Frontend Exploration:**
```bash
# Study the state management
nano frontend/src/store/cart-store.ts
nano frontend/src/lib/decimal-utils.ts
nano frontend/src/types/api.ts

# Review design system
nano frontend/src/styles/tokens.css
nano frontend/src/styles/animations.css
```

### Day 3: Make First Change (2 hours)

**Goal:** Add a new product field `roast_level` (light/medium/dark)

1. **Backend Migration**
   ```bash
   make migration add_roast_level_to_products table=products
   # Add: $table->string('roast_level')->default('medium');
   make migrate
   ```

2. **Backend Model**
   ```bash
   nano backend/app/Models/Product.php
   # Add to $fillable: 'roast_level'
   ```

3. **Frontend Types**
   ```bash
   nano frontend/src/types/api.ts
   # Add: roast_level: 'light' | 'medium' | 'dark';
   ```

4. **Frontend Display**
   ```bash
   nano frontend/src/app/menu/page.tsx
   # Add: <span className="retro-badge">{product.roast_level}</span>
   ```

5. **Test**
   ```bash
   make lint
   make test
   make build
   ```

6. **Commit**
   ```bash
   make commit
   # Follow conventional format
   ```

---

## 🔍 Verification Checklist

Before starting work, verify you understand:

- [ ] **DECIMAL(10,4) Compliance:** All financial values use 4 decimal precision
- [ ] **Two-Phase Inventory Lock:** Redis reservation → PostgreSQL commit
- [ ] **VerifyOrderOwnership:** Middleware ensures zero-trust security
- [ ] **Service Layer:** PaymentService orchestrates provider-specific services
- [ ] **Retro-fit Design:** Use retro-* wrappers, follow WCAG AAA
- [ ] **Make Commands:** Can run `make up`, `make test`, `make migrate`
- [ ] **Database Schema:** Can name all 8 core tables and relationships
- [ ] **API Routes:** Know endpoint prefixes and authentication flow

---

## 📚 Reference Materials

### Primary Documents
- **This File:** Single source of truth (`Project_Architecture_Document.md`)
- **AGENTS.md:** Global coding patterns and agent instructions
- **README.md:** Project overview and external links
- **Makefile:** All automation commands

### Design Reference
- **static_landing_page_mockup.html:** Visual design reference
- **frontend/src/styles/tokens.css:** Color tokens and scales
- **frontend/src/styles/animations.css:** Animation definitions

### API Documentation
- **backend/docs/PAYMENT_API.md:** Payment endpoints specification
- **backend/routes/api.php:** All API routes (read code comments)

### Troubleshooting
- **docs/fix_error_php_cache_clear.md:** Cache clearing
- **docs/PDPA_requirements.md:** Singapore compliance
- **PIT007_SOLUTION.md:** Inventory restoration issue

---

## 🆘 When Stuck

### Common Blockers

1. **Tests Failing**
   - Check: `make logs backend`
   - Check: Postgres/Redis health: `make status`
   - Check: Database seeded: `make migrate-fresh`

2. **Frontend Not Loading**
   - Check: Backend API responding: `curl http://localhost:8000/api/v1/health`
   - Check: Frontend logs: `make logs frontend`
   - Check: TypeScript errors: `docker compose exec -w /app frontend npm run typecheck`

3. **Database Connection Failed**
   - Check: Postgres container running: `make status`
   - Check: Credentials in backend/.env
   - Reset: `make down && make up`

4. **Payment Webhook Not Working**
   - Check: Stripe webhook config in Dashboard
   - Check: Signature verification: `backend/.env` has correct STRIPE_WEBHOOK_SECRET
   - Check: Logs: `make logs backend | grep webhook`

### Where to Ask

- **Technical Questions:** Create GitHub Issue with label `question`
- **Architecture Decisions:** Reference specific decision in Critical Technical Decisions section
- **Code Review:** Follow PR Checklist strictly
- **Urgent Blockers:** Mention @frontend-architect in issue

---

## 🎓 Advanced Topics

### After Mastering Basics

1. **Scaling Inventory Service**
   - Redis cluster configuration
   - Lua scripting for atomic operations
   - Monitoring: Redis latency, keyspace hits

2. **Payment Provider Expansion**
   - Add GrabPay: Create GrabPayService.php
   - Implement PaymentProviderInterface
   - Add webhook handler

3. **Frontend Optimization**
   - Code splitting by route
   - Image optimization with Next.js Image
   - Web Vitals monitoring

4. **Testing Strategy**
   - Property-based testing for decimal arithmetic
   - Load testing inventory reservation
   - Chaos engineering: Redis failure scenarios

---

## 💡 Key Takeaways

### What Makes This Project Unique

1. **DECIMAL(10,4) Mandate** - Singapore GST compliance is non-negotiable
2. **Two-Phase Inventory** - Redis for speed, PostgreSQL for durability
3. **VerifyOrderOwnership** - Zero-trust security model
4. **Retro-fit Design** - 1970s kopitiam aesthetic, WCAG AAA
5. **Service Layer** - Clean abstraction for payment providers
6. **Comprehensive Automation** - `make` commands for everything

### What You'll Learn

- **Backend:** Laravel service layer, Redis atomic ops, webhook handling
- **Frontend:** Next.js App Router, Zustand state, Stripe Elements
- **DevOps:** Docker multi-service orchestration, health checks
- **Architecture:** BFF pattern, transaction boundaries, zero-trust security
- **Compliance:** Decimal precision, PDPA consent, Singapore GST

### Success Metrics

- ✅ All 11 OrderControllerTest tests passing
- ✅ Frontend lint-free: `make lint`
- ✅ WCAG AAA compliance on all pages
- ✅ Payment webhook processing: 200 OK
- ✅ Redis inventory: no overselling
- ✅ DECIMAL precision: 4 decimals throughout

---

**Ready to code? Start with Day 1 setup above. For questions, reference the Troubleshooting section or create a GitHub Issue.**

**Remember: Always validate your changes against the PR Checklist before submitting pull requests.**
