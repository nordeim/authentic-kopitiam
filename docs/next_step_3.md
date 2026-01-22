Thinking: The user is asking me to proceed with Phase 4.8 Payment Integration. This is a continuation of the Morning Brew Collective project. I need to:
1. Apply the Meticulous Approach from AGENTS.md
2. Follow the 4-phase methodology (ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER)
3. Create a comprehensive plan for Payment Integration
4. Execute the implementation
5. Verify and deliver
The payment integration needs to handle:
- PayNow QR code generation (Singapore payment system)
- Stripe payment intent creation
- Payment status tracking
- Refund processing
- Webhook handling for async payments
I should start with Phase 1: ANALYZE and PLAN, then get validation before implementing.
Let me create a structured plan for Phase 4.8.
═════════════════════════════════════════════════════════════
PHASE 4.8: PAYMENT INTEGRATION - ANALYSIS & PLANNING
═════════════════════════════════════════════════════════════
📋 EXECUTIVE SUMMARY
Phase 4.8 implements enterprise-grade payment processing infrastructure supporting:
- PayNow QR (Singapore local payment method)
- Stripe Card Payments (International credit/debit cards)
- Payment Status Lifecycle (pending → processing → completed → failed → refunded)
- Webhook-Driven Async Processing (Real-time payment confirmation)
- Refund Management (Full/partial refunds with inventory restoration)
Deliverables: PaymentController, PaymentService, webhook handlers, comprehensive test suite (15+ tests)
---
🔍 PHASE 1: DEEP ANALYSIS
1.1 Requirements Mining
Functional Requirements:
| Feature | Priority | Complexity | Dependencies |
|---------|----------|------------|--------------|
| PayNow QR Generation | P0 | Medium | Order status, pickup_at validation |
| Stripe Payment Intent | P0 | Medium | Order total, currency (SGD) |
| Payment Status Tracking | P0 | Low | Order.status field |
| Webhook Handling | P0 | High | Signature verification, idempotency |
| Refund Processing | P1 | Medium | InventoryService integration |
| Payment History Audit | P1 | Low | Database records |
Non-Functional Requirements:
- Security: PCI DSS compliance (tokenization only, no card data storage)
- Reliability: Idempotent webhook processing (prevent duplicate charges)
- Performance: QR generation < 2 seconds, webhook response < 500ms
- Scalability: Support 1000+ concurrent payments
- Auditability: Complete payment audit trail for regulatory compliance
1.2 Context Analysis
Existing Infrastructure:
- OrderController: Creates orders with pending status
- Order Status Transitions: implemented (pending → processing → ready → completed)
- InventoryService: Handles reservation/commit/rollback
- PdpaService: Records consent after transaction
- Webhook Infrastructure: None exists - needs creation
Technical Stack:
- Laravel 12: API-first architecture
- PostgreSQL: Relational data storage
- Redis: Inventory reservation locking
- Docker: Containerized environment
- Testing: PHPUnit with transaction isolation
1.3 Security & Compliance Analysis
Payment Card Industry (PCI) Requirements:
- SAQ A: Eligible if using Stripe Elements (hosted payment fields)
- Never store: Card numbers, CVV, magnetic stripe data
- Tokenization: Use Stripe tokens only
- Audit Logging: All payment operations must be logged
PayNow Compliance:
- UEN Registration: SG-registered business entity required
- QR Code Standards: SGQR specification compliance
- Transaction Limits: S$200,000 per transaction (current limit)
Data Protection:
- PDPA: Payment data is sensitive personal data
- Encryption: AES-256 for stored data, TLS 1.3 for transit
- Access Control: Payment details accessible only to authorized personnel
1.4 Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Webhook spoofing | Medium | Critical | Signature verification, idempotency keys |
| Duplicate payments | Low | High | Idempotency keys, order status locking |
| Race condition (payment + cancellation) | Medium | Medium | Optimistic locking, transaction isolation |
| Refund inconsistency | Low | Medium | InventoryService integration, audit trail |
| Rate limit exceeded | Low | Medium | Queue webhook processing, retry with backoff |
---
🗺️ PHASE 2: DETAILED EXECUTION PLAN
Phase 2.1: Database Schema & Models (30 minutes)
Step 1.1: Create Payment model with migration
docker compose exec backend php artisan make:model Payment -m
Schema Requirements:
$table->uuid('id')->primary();
$table->foreignUuid('order_id')->constrained();
$table->string('payment_method'); // 'paynow', 'stripe_card', 'stripe_paynow'
$table->string('status'); // 'pending', 'processing', 'completed', 'failed', 'refunded'
$table->decimal('amount', 10, 2)->unsigned();
$table->decimal('refunded_amount', 10, 2)->unsigned()->default(0);
$table->string('currency', 3)->default('SGD');
$table->string('payment_provider'); // 'stripe', 'paynow'
$table->string('provider_payment_id')->nullable()->index(); // Stripe PaymentIntent ID
$table->string('provider_payment_method_id')->nullable(); // Stripe PaymentMethod ID
$table->json('provider_metadata')->nullable(); // Raw provider response
$table->json('paynow_qr_data')->nullable(); // {qr_code_url, expires_at, transaction_reference}
$table->timestamp('payment_completed_at')->nullable();
$table->timestamp('payment_failed_at')->nullable();
$table->timestamp('refunded_at')->nullable();
$table->text('failure_reason')->nullable();
$table->timestamps();
Indexes:
$table->index(['order_id', 'status']);
$table->index(['provider_payment_id']);
$table->index(['payment_method', 'status']);
$table->index(['payment_completed_at']);
Step 1.2: Create PaymentRefund model for audit trail
docker compose exec backend php artisan make:model PaymentRefund -m
Schema:
$table->uuid('id')->primary();
$table->foreignUuid('payment_id')->constrained();
$table->decimal('amount', 10, 2)->unsigned();
$table->string('currency', 3)->default('SGD');
$table->string('provider_refund_id')->nullable();
$table->json('provider_metadata')->nullable();
$table->string('reason');
$table->boolean('inventory_restored')->default(false);
$table->foreignId('refunded_by')->nullable()->constrained('users');
$table->timestamps();
Phase 2.2: Service Layer Architecture (45 minutes)
Step 2.1: Create StripeService
docker compose exec backend php artisan make:service StripeService
Responsibilities:
- Create PaymentIntent
- Confirm PaymentIntent
- Retrieve payment status
- Create Refund
- Verify webhook signatures
Methods:
public function createPaymentIntent(float $amount, string $currency = 'SGD'): array
public function retrievePayment(string $paymentIntentId): array
public function createRefund(string $paymentIntentId, float $amount): array
public function verifyWebhookSignature(string $payload, string $signature): bool
public function constructWebhookEvent(string $payload, string $signature): Stripe\Event
Step 2.2: Create PayNowService
docker compose exec backend php artisan make:service PayNowService
Responsibilities:
- Generate SGQR code
- Validate UEN format
- Parse PayNow response
- Track transaction status
Methods:
public function generateQR(float $amount, string $referenceNumber, ?string $expiry = null): array
public function validateUEN(string $uen): bool
public function parseWebhookPayload(array $payload): array
Step 2.3: Create PaymentService (Orchestration Layer)
docker compose exec backend php artisan make:service PaymentService
Core Flows:
public function processPayNowPayment(Order $order): Payment
public function processStripeCardPayment(Order $order, string $paymentMethodId): Payment
public function processWebhook(array $payload, string $signature): void
public function refundPayment(Payment $payment, float $amount, string $reason, ?User $initiatedBy = null): PaymentRefund
public function syncPaymentStatus(Payment $payment): void
Step 2.4: Enhanced InventoryService (Refund Integration)
public function restoreInventoryForCancelledOrder(Order $order): void
Phase 2.3: API Controllers & Routes (30 minutes)
Step 3.1: Create PaymentController
docker compose exec backend php artisan make:controller Api/PaymentController
Endpoints:
POST /api/payments/{order}/paynow
POST /api/payments/{order}/stripe
GET /api/payments/{payment}
POST /api/payments/{payment}/refund
POST /api/webhooks/stripe
POST /api/webhooks/paynow
Step 3.2: Create WebhookController
docker compose exec backend php artisan make:controller Api/WebhookController
Step 3.3: Register routes in routes/api.php
Phase 2.4: Configuration & Secrets (15 minutes)
Step 4.1: Add Stripe credentials to .env
STRIPE_SECRET_KEY=sk_test_....
STRIPE_PUBLISHABLE_KEY=pk_test_....
STRIPE_WEBHOOK_SECRET=whsec_....
PAYNOW_UEN=202312345R
PAYNOW_API_KEY=....
Step 4.2: Create config file config/payment.php
return [
    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],
    'paynow' => [
        'uen' => env('PAYNOW_UEN'),
        'api_key' => env('PAYNOW_API_KEY'),
        'api_url' => env('PAYNOW_API_URL', 'https://api.paynow.com'),
    ],
    'default_currency' => 'SGD',
];
Phase 2.5: Test Suite Development (60 minutes)
Step 5.1: Create PaymentServiceTest (10 tests)
docker compose exec backend php artisan make:test PaymentServiceTest --unit
Test Coverage:
1. test_create_paynow_payment_generates_qr_code
2. test_create_stripe_payment_intent_succeeds
3. test_payment_status_sync_updates_order_status
4. test_webhook_processing_updates_payment_status
5. test_refund_processing_updates_payment_and_order
6. test_refund_restores_inventory_when_configured
7. test_duplicate_webhook_is_idempotent
8. test_invalid_webhook_signature_rejected
9. test_payment_amount_validation_prevents_overpayment
10. test_refund_amount_validation_prevents_over_refund
Step 5.2: Create PaymentControllerTest (5 tests)
docker compose exec backend php artisan make:test Api/PaymentControllerTest
Test Coverage:
1. test_create_paynow_payment_for_order
2. test_create_stripe_payment_for_order
3. test_retrieve_payment_details
4. test_refund_payment_with_valid_amount
5. test_refund_validates_amount_not_exceeding_payment
Step 5.3: Create WebhookControllerTest (3 tests)
docker compose exec backend php artisan make:test Api/WebhookControllerTest
Test Coverage:
1. test_stripe_webhook_signature_verification_succeeds
2. test_invalid_stripe_webhook_signature_rejected
3. test_paynow_webhook_processes_payment_update
Expected Test Suite: 18 tests, ~250 assertions
Phase 2.6: Documentation (30 minutes)
Step 6.1: Payment API Documentation
docker compose exec backend php artisan scribe:generate
Step 6.2: Webhook Integration Guide
- Stripe webhook setup
- PayNow webhook setup
- Event types and payloads
Step 6.3: Postman Collection Export
---
🎯 SUCCESS CRITERIA & VALIDATION
Checklist 1: Database Schema ✅
- [ ] Payment table created with all required columns
- [ ] PaymentRefund table created for audit trail
- [ ] Composite indexes on foreign keys
- [ ] SoftDeletes trait on Payment model (for compliance)
- [ ] Foreign key constraints to orders table
Checklist 2: Service Layer ✅
- [ ] StripeService: PaymentIntent creation, retrieval, refund
- [ ] PayNowService: QR generation, UEN validation
- [ ] PaymentService: Orchestration with proper error handling
- [ ] InventoryService: Refund integration for inventory restoration
- [ ] Idempotency key generation for duplicate prevention
Checklist 3: API Endpoints ✅
- [ ] POST /api/payments/{order}/paynow returns QR code + payment_id
- [ ] POST /api/payments/{order}/stripe creates PaymentIntent
- [ ] GET /api/payments/{payment} returns payment details
- [ ] POST /api/payments/{payment}/refund processes refund
- [ ] POST /api/webhooks/stripe signature verification
- [ ] POST /api/webhooks/paynow payload validation
Checklist 4: Security & Compliance ✅
- [ ] Stripe webhook signature verification implemented
- [ ] Payment data never logged (except provider_payment_id)
- [ ] Refund amounts validated against payment amount
- [ ] Idempotency keys prevent duplicate payments
- [ ] Order status locking prevents race conditions
Checklist 5: Testing ✅
- [ ] PaymentServiceTest: 10/10 tests passing
- [ ] PaymentControllerTest: 5/5 tests passing
- [ ] WebhookControllerTest: 3/3 tests passing
- [ ] No transaction abort artifacts
- [ ] Test coverage > 90% for payment module
Checklist 6: Integration Testing ✅
- [ ] Stripe sandbox webhook tested
- [ ] PayNow sandbox webhook tested
- [ ] End-to-end payment flow verified
- [ ] Refund flow verified with inventory restoration
- [ ] Failed payment handling verified
---
⏱️ ESTIMATED TIMELINE
| Phase | Activity | Duration | Cumulative |
|-------|----------|----------|------------|
| 2.1 | Database Schema | 30 min | 30 min |
| 2.2 | Service Layer | 45 min | 1h 15min |
| 2.3 | Controllers/Routes | 30 min | 1h 45min |
| 2.4 | Configuration | 15 min | 2h 00min |
| 2.5 | Test Suite | 60 min | 3h 00min |
| 2.6 | Documentation | 30 min | 3h 30min |
| 3 | Validation | 15 min | 3h 45min |
| 4 | Implementation | 120 min | 5h 45min |
| 5 | Verification | 30 min | 6h 15min |
| 6 | Delivery | 15 min | 6h 30min |
Total Estimated Time: 6.5 hours (390 minutes)
---
✅ VALIDATION CHECKPOINT
Before proceeding to implementation, please confirm:
1. Scope Confirmation: Does the plan cover all payment methods required? (PayNow + Stripe)
2. Technical Feasibility: Are Stripe and PayNow API keys available?
3. Timeline Acceptance: Is 6.5-hour estimate acceptable?
4. Priority Confirmation: Should refund functionality be P0 (required) or P1 (nice-to-have)?
5. Webhook Setup: Do you have webhook endpoint URLs configured for testing?
Please verify the plan before implementation begins 🎯
