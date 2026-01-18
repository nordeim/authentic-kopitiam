Thinking: The user is asking me to meticulously plan and execute Stripe PayNow frontend integration following the Meticulous Approach documented in AGENTS.md. I've completed Phase 1 (deep analysis and context synchronization). Now I need to proceed with:
1. Phase 1: Request Analysis & Planning - Already done (deep analysis completed)
2. Phase 2: Implementation - Need to create structured execution plan
3. Phase 3: Validation & Refinement - Build validation checkpoints
4. Phase 4: Delivery & Knowledge Transfer - Document everything
Based on my deep analysis:
- Frontend is 75% complete (Phase 2-3 hybrid)
- Backend Payment Integration is 100% complete (Phase 4.8)
- Missing frontend payment UI components
- Must use retro-* components
- Must follow Singapore compliance (GST 9%, PayNow via Stripe)
- Must be WCAG AAA compliant
- Must use Zustand for state management
- Must integrate with existing backend payment endpoints
I need to create a detailed execution plan with phases, checklists, success criteria, and then implement the payment UI components.
Key Components to Create:
1. Payment Method Selection Component
- Radio buttons for PayNow vs Credit Card
- Retro-styled with sunrise-coral accents
- Mobile-responsive
- Store preference in localStorage
2. PayNow QR Display Component
- Large scannable QR code (min 256x256px)
- Order amount and reference number
- Save/share buttons
- Auto-refresh on expiry (15 min)
- "Payment complete" button
3. Stripe Elements Integration
- Card payment form
- Custom retro appearance config
- Error handling with toast notifications
- Loading states
4. Payment Status Management
- Poll payment status every 3 seconds
- Show stepper (Pending → Processing → Completed)
- Handle success/failure states
- Redirect to order confirmation
5. Order Confirmation Page
- Invoice number display
- GST breakdown (9%)
- Pickup details
- Email receipt trigger
Let me create the comprehensive plan with meticulous detail.
Phase 1: Request Analysis & Deep Requirement Mining
Executive Summary
Request: Implement Stripe PayNow frontend integration to complete the payment flow from UI to backend.
Current State: Backend payment infrastructure is 100% complete (Phase 4.8). Frontend is at 75% completion (Phase 2-3 hybrid). Missing payment UI components.
Objective: Create production-ready payment UI that integrates seamlessly with existing Laravel payment API, follows 1970s retro-kopitiam aesthetic, meets Singapore compliance, and achieves WCAG AAA accessibility.
---
Multi-Dimensional Analysis
1. Psychological Impact Analysis
| Component | User Sentiment | Cognitive Load | Risk | Mitigation |
|-----------|---------------|----------------|------|------------|
| Payment Method Selection | Confidence, control | Low (2 options) | Decision paralysis | Default to PayNow (Singapore norm) |
| QR Code Display | Trust, security | Medium (scanning action) | Scanning difficulty | Min 256x256px, high contrast, save button |
| Card Form | Security concerns | High (data entry) | Abandonment | Stripe Elements (trusted brand) |
| Status Polling | Anxiety → Relief | Medium (waiting) | Perceived slowness | Progress stepper, estimated time |
| Order Confirmation | Satisfaction, relief | Low (celebration) | Unclear next steps | Clear pickup instructions, share button |
2. Technical Performance Analysis
| Metric | Target | Implementation Approach |
|--------|--------|----------------------|
| Payment Initiation | < 800ms | Server-side payment creation, client receives token |
| QR Load Time | < 200ms | Direct image URL from Stripe API |
| Status Polling | 3s interval | useEffect + setInterval, cleanup on unmount |
| Stripe Elements | < 500ms | Async script loading, appearance pre-config |
| Total Payment Flow | < 5s to completion | Optimistic UI updates, webhook-driven status |
3. Accessibility (WCAG AAA) Analysis
| Requirement | Score | Implementation |
|-------------|-------|----------------|
| Contrast | 10.2:1 | espresso-dark (#3D2317) on latte-cream (#FFF5E6) |
| Focus Visible | 3px sunrise-coral outline | retro-button:focus uses --color-sunrise-coral |
| Screen Reader | Full ARIA support | aria-labels, live regions for status updates |
| Keyboard Nav | Full support | Tab order: method → QR/Card → complete button |
| Reduced Motion | Respected | @media (prefers-reduced-motion: reduce) disables animations |
| Color Blindness | Friendly | Not relying solely on color (labels + icons) |
4. Scalability & Maintenance Analysis
| Factor | Current State | Future-Proofing |
|--------|---------------|-----------------|
| Payment Provider | Stripe + PayNow | Easy to add GrabPay (new service class) |
| Component Structure | Modular | Each payment method is separate component |
| State Management | Zustand | Centralized payment store |
| Error Handling | Per-component | Global error boundary can catch all |
| Testing | Manual E2E needed | Playwright tests for regression |
---
Explicit Requirements (Validated)
Core Features
1. ✅ Payment Method Selection: Radio buttons (PayNow QR vs Credit Card)
2. ✅ PayNow QR Display: 256x256px, scannable, with save/share
3. ✅ Stripe Card Form: Secure Elements integration
4. ✅ Status Polling: Webhook-driven updates
5. ✅ Order Confirmation: GST breakdown, invoice number, pickup details
6. ✅ Error Handling: Toast notifications for failures
7. ✅ Loading States: Disabled buttons during async operations
Compliance Requirements
1. ✅ GST 9%: Displayed in breakdown, calculated with 4 decimal precision
2. ✅ PayNow: Integrated via Stripe (Singapore compliance)
3. ✅ PDPA: Consent logged via existing PdpaService
4. ✅ Accessibility: WCAG AAA strictness maintained
Design Requirements
1. ✅ Use retro- components*: NO raw Radix/Shadcn primitives
2. ✅ 1970s aesthetic: Warm colors, rounded corners, groovy typography
3. ✅ Intentional minimalism: Whitespace as structural element
4. ✅ Library discipline: Shadcn/Radix as foundation only
---
Implicit Requirements (Inferred)
UX Nuances
1. Mobile-first: Many Singaporeans shop on mobile; QR scanning must work on same device
2. Trust signals: Stripe badge, secure checkout messaging
3. Payment recovery: Store payment_id in localStorage for recovery
4. Guest checkout: No auth required (middleware allows guest access)
5. Single-page flow: All payment steps on /checkout/payment page
Performance Nuances
1. Code splitting: Payment components loaded only when needed
2. Image optimization: QR code as SVG if possible
3. Bundle size: Keep Stripe library async, not in initial bundle
4. Caching: Payment methods don't change, cache the component
Security Nuances
1. No sensitive data in logs: Payment IDs only, never card numbers
2. Idempotency: Prevent double-charging via Stripe's idempotency_key
3. Webhook signature: Frontend doesn't need to verify (backend does)
4. CSRF protection: Sanctum middleware handles API security
---
Risk Assessment & Mitigation
Critical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| R1: Mobile QR scanning fails | Medium | High | Test on iOS Safari + Chrome Android |
| R2: Stripe Elements fails to load | Low | Critical | Fallback to "Refresh page" button |
| R3: Webhook delay causes UX drop | Medium | Medium | Show "Processing" state, email confirmation |
| R4: Double payment (race condition) | Low | Critical | Idempotency keys per session |
| R5: Payment page abandoned | High | Medium | Cart persistence + email reminder |
Mitigation Details
R1: Mobile QR Scanning
- QR size: 256x256px minimum
- Contrast: Black QR on white background (400:1 ratio)
- Save button: Download QR as PNG for offline scanning
- Alternative: "Copy payment details" for mobile banking apps
R2: Stripe Elements Load Failure
- Async script loading with onload callback
- Loading spinner while script initializes
- Error message: "Payment form failed to load. Please refresh."
- Fallback to server-side payment method (rare)
R3: Webhook Processing Delays
- Show "Payment processing" with animated spinner
- Text: "This may take up to 2 minutes"
- Offer: "We'll email you confirmation at {email}"
- Allow user to close page (backend handles async)
R4: Double Payment Prevention
- Generate idempotency_key = order_id + timestamp (hashed)
- Store in localStorage: payment_intent_created_at
- Frontend checks: if intent exists for order, reuse it
- Backend enforces: PaymentService.validateNoDuplicatePayment()
R5: Cart Abandonment
- Store cart + payment progress in localStorage
- Recovery: On return to /checkout, show "Continue previous payment"
- Email reminder: 1 hour after abandonment (if email provided)
- Keep cart for 30 days (PDPA compliance)
---
Execution Plan: Phase 5 Frontend Payment
Phase 5.1: Payment State Management (2 hours)
Files to Create:
- frontend/src/store/payment-store.ts - Zustand store for payment state
- frontend/src/hooks/use-payment-status.ts - Polling logic
- frontend/src/lib/stripe-client.ts - Stripe initialization
Success Criteria:
- [ ] Payment store manages method selection, payment_id, status
- [ ] Polling hook checks status every 3 seconds during processing
- [ ] Stripe client initialized only once per session
- [ ] LocalStorage persists payment data (30-day PDPA limit)
Phase 5.2: Payment Method Selection UI (1.5 hours)
Files to Create:
- frontend/src/components/payment/payment-method-selector.tsx
- frontend/src/components/payment/payment-method-card.tsx
Success Criteria:
- [ ] Two radio buttons: PayNow (recommended) vs Credit Card
- [ ] PayNow card shows "Scan with banking app" helper text
- [ ] Card payment card shows "Secured by Stripe" badge
- [ ] Selected state uses sunrise-coral accent
- [ ] Mobile-responsive layout (cards stack vertically)
Phase 5.3: PayNow QR Display Component (2 hours)
Files to Create:
- frontend/src/components/payment/paynow-qr-display.tsx
- frontend/src/components/payment/qr-save-button.tsx
Success Criteria:
- [ ] QR code displays at 256x256px minimum
- [ ] Shows order amount, reference number, expiry timer (15 min)
- [ ] "Save QR" button downloads PNG
- [ ] "Share" button triggers native share UI
- [ ] "I've completed payment" button triggers status check
- [ ] Auto-refresh QR when expired
Phase 5.4: Stripe Elements Integration (2.5 hours)
Files to Create:
- frontend/src/components/payment/stripe-payment-form.tsx
- frontend/src/lib/stripe-appearance.ts - Retro-themed Stripe appearance
Success Criteria:
- [ ] Stripe Elements loads dynamically (async)
- [ ] Card field styled with retro colors (latte-cream background, espresso-dark text)
- [ ] Error messages show in toast notifications
- [ ] Submit button disabled during processing
- [ ] Loading spinner appears during submission
- [ ] Handles 3D Secure authentication flows
Phase 5.5: Payment Status Management (2 hours)
Files to Create:
- frontend/src/components/payment/payment-status-tracker.tsx
- frontend/src/components/payment/payment-success.tsx
- frontend/src/components/payment/payment-failed.tsx
Success Criteria:
- [ ] Status stepper: Pending → Processing → Completed (or Failed)
- [ ] Polling logic integrated (3-second intervals)
- [ ] Success page shows green checkmark, order number, next steps
- [ ] Failure page shows error message, retry button, support contact
- [ ] Auto-redirect to order confirmation on success
Phase 5.6: Order Confirmation Page (1.5 hours)
Files to Create:
- frontend/src/app/checkout/confirmation/page.tsx
- frontend/src/components/confirmation/order-summary.tsx
Success Criteria:
- [ ] Displays invoice number prominently
- [ ] Shows GST breakdown (9% with 4 decimal precision)
- [ ] Shows pickup location and time
- [ ] Shows "Track Order" button linking to order status
- [ ] Triggers email receipt automatically
- [ ] WCAG AAA compliant contrast and typography
Phase 5.7: Error Handling & Edge Cases (1 hour)
Implement:
- Network failure handling
- Expired payment sessions
- Duplicate payment prevention
- Cart restoration on failure
Success Criteria:
- [ ] Network errors show toast: "Connection lost. Retrying..."
- [ ] Expired sessions redirect to cart with message
- [ ] Duplicate payments blocked at UI layer
- [ ] Cart contents restored if payment fails
Phase 5.8: Integration & E2E Testing (2 hours)
Tests to Create:
- Playwright: Complete payment flow (PayNow and Card)
- Unit tests: Payment store, status polling
- Visual regression: Payment pages vs mockup
Success Criteria:
- [ ] PayNow flow completes end-to-end with sandbox
- [ ] Card payment flow completes end-to-end
- [ ] Failed payment shows correct error
- [ ] Visual regression tests pass
- [ ] Lighthouse score > 95 (performance, accessibility)
---
Phase 5 Validation Checkpoint
✅ Functional Requirements
- [ ] Payment method selection works on mobile/desktop
- [ ] PayNow QR is scannable (tested on iOS/Android)
- [ ] QR save/share functions work
- [ ] Stripe card form accepts test cards
- [ ] Status polling updates UI in real-time
- [ ] Success page shows invoice and pickup details
- [ ] Failure page allows retry
- [ ] GST breakdown shows 9% correctly
✅ Compliance Requirements
- [ ] GST displayed with 2 decimals, calculated with 4 decimals
- [ ] WCAG AAA contrast ratios met (7:1 minimum)
- [ ] All interactive elements have focus indicators
- [ ] Screen reader labels present
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Payment data not logged (only payment_id)
✅ Design Requirements
- [ ] Uses retro-button, retro-dialog wrappers
- [ ] Follows 1970s color palette (sunrise-coral, espresso-dark)
- [ ] Intentional whitespace, asymmetrical layouts
- [ ] No generic Bootstrap grids or "AI slop"
- [ ] Animations respect prefers-reduced-motion
✅ Performance Requirements
- [ ] First load < 100KB JS
- [ ] LCP < 2.5s
- [ ] Payment initiation < 800ms
- [ ] QR load < 200ms
- [ ] Bundle size optimized (Stripe async loaded)
---
Implementation Notes
API Integration Points
From backend analysis, the frontend needs to call:
// 1. Create PayNow payment
const response = await fetch(`/api/v1/payments/${orderId}/paynow`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: order.total })
});
const { qr_code_url, payment_id } = await response.json();
// 2. Create Stripe payment intent
const response = await fetch(`/api/v1/payments/${orderId}/stripe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: order.total })
});
const { client_secret, payment_id } = await response.json();
// 3. Poll payment status
const payment = await fetch(`/api/v1/payments/${paymentId}`).then(r => r.json());
Stripe Appearance Config (Retro Theme)
const retroAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#FF6B4A', // sunrise-coral
    colorBackground: '#FFF5E6', // latte-cream
    colorText: '#3D2317', // espresso-dark
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '16px',
  },
  rules: {
    '.Block': {
      backgroundColor: '#FFF5E6',
      borderColor: '#FFBE4F', // golden-hour
    },
    '.Input': {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5D7C3', // muted-latte
    },
  },
};
---
Estimated Timeline & Deliverables
| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 5.1: State Management | 2 hours | payment-store.ts, use-payment-status.ts |
| Phase 5.2: Method Selection | 1.5 hours | payment-method-selector.tsx |
| Phase 5.3: PayNow QR | 2 hours | paynow-qr-display.tsx |
| Phase 5.4: Stripe Elements | 2.5 hours | stripe-payment-form.tsx |
| Phase 5.5: Status Management | 2 hours | payment-status-tracker.tsx |
| Phase 5.6: Confirmation | 1.5 hours | confirmation/page.tsx |
| Phase 5.7: Error Handling | 1 hour | Toast errors, recovery flows |
| Phase 5.8: Testing | 2 hours | Playwright E2E tests |
| Total | 14.5 hours | Complete payment UI system |
---
Go/No-Go Decision Point
Before implementation begins, confirm:
1. ✅ Backend payment API is ready (100% complete - validated)
2. ✅ Stripe sandbox credentials configured in backend .env
3. ✅ PayNow UEN and API credentials configured
4. ✅ Frontend retro-components are available and working
5. ✅ Zustand store pattern is established (cart-store exists)
6. ✅ WCAG AAA compliance is mandatory
7. ✅ GST must be displayed with 4 decimal precision
8. ✅ Mobile-first approach required
Confirm "PROCEED TO IMPLEMENTATION" to begin Phase 5.1-5.8 execution.

---

✅ PLAN SAVED & TODO LIST UPDATED
📄 Documentation Created
File: /home/project/authentic-kopitiam/frontend/docs/PHASE5_PAYMENT_INTEGRATION_PLAN.md (10.4KB, 347 lines)
Contents:
- ✅ Executive Summary & Current State
- ✅ Design System Mandates (colors, typography, animations)
- ✅ Compliance Requirements (GST 9%, WCAG AAA, PDPA)
- ✅ Component Architecture with flow diagrams
- ✅ 8 Detailed Implementation Phases (5.1 - 5.8)
- ✅ API Integration Contracts
- ✅ Technical Specifications
- ✅ Risk Mitigation Matrix
- ✅ Success Metrics & Validation Checkpoints
- ✅ E2E Testing Strategy
---
📋 TODO List Updated
Phase 5.1: Payment state management (HIGH) ⏳
Phase 5.2: Payment method selection UI (HIGH) ⏳  
Phase 5.3: PayNow QR display component (HIGH) ⏳
Phase 5.4: Stripe Elements integration (HIGH) ⏳
Phase 5.5: Payment status tracker (HIGH) ⏳
Phase 5.6: Order confirmation page (HIGH) ⏳
Phase 5.7: Error handling & edge cases (MEDIUM) ⏳
Phase 5.8: E2E testing & QA (MEDIUM) ⏳
Total Estimated Effort: 14.5 hours (± 2 hours variance)
---
🎯 READY FOR IMPLEMENTATION
Next Step: Phase 5.1 - Create payment state management (payment-store.ts, use-payment-status.ts)

