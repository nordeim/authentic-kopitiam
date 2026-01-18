# PHASE 5: PAYMENT UI INTEGRATION - IMPLEMENTATION PLAN
# Stripe PayNow Frontend Integration
# Project: Morning Brew Collective
# Date: January 18, 2026
# Status: APPROVED FOR IMPLEMENTATION

---

## 🎯 EXECUTIVE SUMMARY

**Objective**: Implement production-ready frontend payment UI that integrates seamlessly with existing Laravel payment API (Phase 4.8), follows 1970s retro-kopitiam aesthetic, meets Singapore compliance, and achieves WCAG AAA accessibility.

**Scope**: 6 core components + testing (14.5 hours total)

---

## 📊 CURRENT STATE VALIDATION

### Backend Status (Phase 4.8) ✅ COMPLETE
- PaymentService, StripeService, PayNowService: 900 lines
- PaymentController (4 endpoints): 241 lines
- WebhookController (2 handlers): 103 lines  
- Payment & PaymentRefund models: SoftDeletes enabled
- Test suite: 11 tests, 184 assertions
- Documentation: 397 lines (comprehensive)

**API Endpoints Ready**:
```
POST /api/v1/payments/{order}/paynow
POST /api/v1/payments/{order}/stripe
GET  /api/v1/payments/{payment}
POST /api/v1/payments/{payment}/refund
POST /api/v1/webhooks/stripe
POST /api/v1/webhooks/paynow
```

### Frontend Status (Phase 2-3) ⚠️ INCOMPLETE
- ✅ Retro components (9 wrappers): button, dialog, dropdown, etc.
- ✅ Zustand stores: cart-store, filter-store, toast-store
- ✅ Design tokens: tokens.css (38 colors, 16 spacing, 6 animations)
- ✅ Animation primitives: bean-bounce, sunburst, steam-rise
- ❌ **Payment UI components: NOT YET IMPLEMENTED**

---

## 🎨 DESIGN SYSTEM MANDATES

### Color Tokens (from tokens.css)
```css
--color-sunrise-coral: 255 107 74;  /* CTA buttons, focus */
--color-golden-hour: 255 190 79;    /* Accents, highlights */
--color-espresso-dark: 61 35 23;   /* Text, borders */
--color-latte-cream: 255 245 230;   /* Backgrounds */
```

### Typography
- **Display**: Fraunces (Google Fonts) - 1970s groovy
- **Body**: DM Sans - Warm, readable
- **Size**: 16px base (WCAG AAA minimum)

### Animation Curves
- Primary: `cubic-bezier(0.34, 1.56, 0.64, 1)` - "bounce"
- Secondary: `cubic-bezier(0.23, 1, 0.32, 1)` - "smooth"
- Duration: 150ms / 300ms / 500ms

### Spacing System
- Base unit: 8pt (0.25rem)
- Container: 1200px max-width
- Radius: 16-48px ("soft 70s" feel)

---

## 🛡️ COMPLIANCE REQUIREMENTS

### Singapore GST (9%)
- **Precision**: DECIMAL(10,4) backend, display with 2 decimals
- **Display**: "inclusive of 9% GST" breakdown
- **Calculation**: Backend calculated, frontend displays

### WCAG AAA Accessibility
- **Contrast**: Minimum 7:1 (espresso-dark on latte-cream = 10.2:1)
- **Focus**: 3px sunrise-coral outline
- **Reduced Motion**: CSS `@media (prefers-reduced-motion)`
- **Screen Reader**: ARIA labels, live regions for status updates
- **Keyboard**: Full Tab navigation (no JS-required)

### PDPA Compliance
- **Data Retention**: Payment IDs stored 30 days max
- **Pseudonymization**: Customer data hashed in backend
- **Consent**: Explicit opt-in checkboxes (PdpaService)

---

## 🎪 COMPONENT ARCHITECTURE

### Flow Diagram
```
Checkout Page
├── Payment Method Selection (Radio cards)
│   ├── PayNow Option (recommended)
│   └── Credit Card Option
│
├── Conditional Render
│   ├── IF PayNow → QR Display Component
│   └── IF Card → Stripe Elements Form
│
└── Payment Status Tracker (Stepper)
    ├── Pending
    ├── Processing (polling)
    ├── Success → Confirmation Page
    └── Failed → Error + Retry
```

### Component Tree
```
app/checkout/payment/page.tsx
├── components/payment/payment-method-selector.tsx
│   └── components/payment/payment-method-card.tsx (x2)
├── components/payment/paynow-qr-display.tsx
│   ├── qr-save-button.tsx
│   └── qr-share-button.tsx
├── components/payment/stripe-payment-form.tsx
│   └── lib/stripe-appearance.ts
├── components/payment/payment-status-tracker.tsx
├── components/payment/payment-success.tsx
└── components/payment/payment-failed.tsx

store/payment-store.ts
hooks/use-payment-status.ts
hooks/use-stripe-elements.ts
```

---

## 📋 PHASE 5 IMPLEMENTATION BREAKDOWN

### **Phase 5.1: State Management & Infrastructure** (2 hours)

**Files**:
- `src/store/payment-store.ts` - Zustand store for payment state
- `src/hooks/use-payment-status.ts` - Polling logic with cleanup
- `src/lib/stripe-client.ts` - Stripe initialization (async)
- `src/lib/api/payment-api.ts` - Payment API client

**Key Features**:
- Payment method selection state (paynow | stripe_card)
- Payment_id persistence to localStorage
- Status polling every 3 seconds (configurable)
- Automatic cleanup on unmount (prevent memory leaks)
- Idempotency key generation (order_id + timestamp hash)

**API Contracts**:
```typescript
interface PaymentState {
  paymentMethod: 'paynow' | 'stripe_card'
  paymentId: string | null
  orderId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  qrCodeUrl: string | null
  clientSecret: string | null
  error: string | null
}
```

**Success Criteria**:
- [ ] Store creation with TypeScript strict typing
- [ ] Polling logic with proper cleanup
- [ ] Stripe client loads asynchronously
- [ ] localStorage persistence (30-day PDPA limit)
- [ ] Idempotency prevents double payments

---

### **Phase 5.2: Payment Method Selection UI** (1.5 hours)

**Files**:
- `src/components/payment/payment-method-selector.tsx`
- `src/components/payment/payment-method-card.tsx`

**Design Requirements**:
- Two radio cards side-by-side (desktop), stacked (mobile)
- PayNow card shows "Scan with banking app" helper text
- Card payment card shows "Secured by Stripe" badge
- Selected state uses sunrise-coral accent border/shadow
- Default selection: PayNow (Singapore user preference)

**Features**:
- Accessible radio buttons (native input[type=radio])
- Keyboard navigation (Tab, Space, Enter)
- LocalStorage preference persistence
- Animated selection (300ms ease-out)

**Retro Styling**:
```css
/* Using retro-card component */
border-radius: var(--radius-xl); /* 24px */
box-shadow: var(--shadow-glow);
background: linear-gradient(135deg, var(--color-latte-cream), #FFFDF6);
```

**Success Criteria**:
- [ ] Radio cards render correctly
- [ ] Selection updates payment-store
- [ ] PayNow pre-selected by default
- [ ] Mobile responsive (stacks vertically)
- [ ] WCAG AAA keyboard navigation
- [ ] ARIA labels for screen readers

---

### **Phase 5.3: PayNow QR Display Component** (2 hours)

**Files**:
- `src/components/payment/paynow-qr-display.tsx`
- `src/components/payment/qr-save-button.tsx`
- `src/components/payment/qr-share-button.tsx`

**QR Display Specs**:
- **Size**: Minimum 256x256px (optimal: 300x300px)
- **Format**: PNG or SVG from Stripe API
- **Contrast**: Black QR on white background (400:1 ratio)
- **Mobile**: Tested on iOS Safari, Chrome Android

**Content Display**:
- Order amount (formatted: "S$15.90")
- Payment reference number (for bank app)
- Expiry timer (15 minutes countdown)
- "Scan with your banking app" instruction

**Interactive Elements**:
1. **Save QR Button**: Downloads PNG with filename `paynow-morningbrew-{order_id}.png`
2. **Share Button**: Triggers Web Share API (mobile) or copies to clipboard
3. **"I've completed payment"**: Manual trigger for webhook delay scenarios

**Auto-Refresh**:
- QR expires after 15 minutes
- Timer countdown shows minutes:seconds
- When expired: Auto-generate new QR + show toast

**Retro Styling**:
```css
/* Wrapped in retro-card */
border: 8px solid var(--color-espresso-dark);
background: #FFFFFF; /* Pure white for QR */
box-shadow: 0 12px 0 rgba(0,0,0,0.1); /* Retro depth */
```

**Success Criteria**:
- [ ] QR displays at minimum 256x256px
- [ ] Amount, reference, timer shown clearly
- [ ] Save button downloads PNG correctly
- [ ] Share button works on mobile/desktop
- [ ] Auto-refresh triggers when expired
- [ ] Manual completion button works
- [ ] Scannable on iOS/Android devices
- [ ] WCAG AAA contrast ratios

---

### **Phase 5.4: Stripe Elements Integration** (2.5 hours)

**Files**:
- `src/components/payment/stripe-payment-form.tsx`
- `src/lib/stripe-appearance.ts`

**Stripe Appearance Config** (Retro Theme):
```typescript
// Matches 1970s kopitiam aesthetic
const retroAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#FF6B4A',      // sunrise-coral
    colorBackground: '#FFF5E6',     // latte-cream
    colorText: '#3D2317',           // espresso-dark
    colorTextSecondary: '#8C5E4A', // terracotta-medium
    fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSizeBase: '16px',
    borderRadius: '16px',
    spacingUnit: '8px',
  },
  rules: {
    '.Block': {
      backgroundColor: '#FFF5E6',
      borderColor: '#FFBE4F',      // golden-hour
      boxShadow: 'none',
    },
    '.Input': {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5D7C3',      // muted-latte
      borderRadius: '12px',
      fontFamily: 'DM Sans',
    },
    '.Input:focus': {
      borderColor: '#FF6B4A',      // sunrise-coral
      boxShadow: '0 0 0 3px rgba(255, 107, 74, 0.1)',
    },
    '.Tab': {
      borderRadius: '9999px',
    },
    '.Tab--selected': {
      backgroundColor: '#FF6B4A',  // sunrise-coral
      color: '#FFFFFF',
    },
    '.Error': {
      color: '#DC2626',            // red-600 for errors
    },
  },
};
```

**Form Fields**:
- Card number (icon left: CreditCard)
- Expiry date (MM/YY)
- CVC (security code)
- Cardholder name (if Stripe requires)
- Billing ZIP/postal (if Stripe requires)

**Error Handling**:
- Network errors: Toast notification "Connection failed. Check your internet."
- Card declined: "Your card was declined. Please try another."
- Invalid card: "Please check your card details."
- 3D Secure: Auto-handled by Stripe Elements modal

**Loading States**:
- Stripe script loading: Skeleton loader (3 inline inputs)
- Payment processing: Full-page overlay with spinner + "Processing..."
- Button disabled with opacity-50

**Success Flow**:
1. User clicks "Pay S$XX.XX"
2. Button shows loading spinner
3. Stripe Elements processes (2-5 seconds)
4. On success: Payment status updates → Success page
5. On failure: Show error toast + enable retry

**Retro Button Styling**:
```css
/* Must use retro-button wrapper */
background: linear-gradient(135deg, var(--color-sunrise-coral), #E5513D);
border-radius: var(--radius-full); /* 9999px */
box-shadow: var(--shadow-button);
text-transform: uppercase;
font-family: 'Fraunces', cursive;
letter-spacing: 1px;
```

**Success Criteria**:
- [ ] Stripe loads asynchronously (non-blocking)
- [ ] Form fields styled with retro appearance
- [ ] Error messages show in toast (not inline)
- [ ] Loading states on button during processing
- [ ] 3D Secure flows work smoothly
- [ ] Mobile responsive (single column)
- [ ] WCAG AAA compliant (focus, labels)

---

### **Phase 5.5: Payment Status Tracker** (2 hours)

**Files**:
- `src/components/payment/payment-status-tracker.tsx`
- `src/components/payment/payment-success.tsx`
- `src/components/payment/payment-failed.tsx`

**Stepper Component**:
```typescript
interface StatusStep {
  id: 'pending' | 'processing' | 'completed' | 'failed'
  label: string
  icon: React.ReactNode
  isActive: boolean
  isCompleted: boolean
}
```

**Visual States**:
1. **Pending**: Grey circle, waiting icon
2. **Processing**: Animated sunrise-coral spinner
3. **Completed**: Green checkmark, success animation
4. **Failed**: Red error icon, retry button

**Polling Logic** (in usePaymentStatus):
```typescript
// Poll every 3 seconds while processing
useEffect(() => {
  if (status !== 'processing') return;
  
  const interval = setInterval(async () => {
    const payment = await fetchPaymentStatus(paymentId);
    if (payment.status === 'completed' || payment.status === 'failed') {
      clearInterval(interval);
      setStatus(payment.status);
    }
  }, 3000);
  
  return () => clearInterval(interval);
}, [status, paymentId]);
```

**Optimistic UI Updates**:
- Show "Processing..." immediately after user confirms payment
- Don't wait for webhook to update UI
- On webhook success: Show confirmation page
- On webhook failure: Show error + allow retry

**Success Page** (`payment-success.tsx`):
- Green checkmark with bounce animation
- Large invoice number display
- GST breakdown (subtotal, GST 9%, total)
- Pickup location + time
- "Track Order" button
- "Share Order" button (copies invoice number)
- "Order again" button

**Failure Page** (`payment-failed.tsx`):
- Red error icon
- Specific error message from Stripe/PayNow
- "Try again" button (returns to payment method selection)
- "Contact support" button (links to /contact)
- Cart preserved (items still in cart)

**Common Error Messages**:
- "Payment was declined by your bank"
- "Payment session expired. Please try again."
- "Insufficient funds in your account"
- "Network error. Please check your connection."

**Success Criteria**:
- [ ] Stepper shows correct current stage
- [ ] Processing spinner animates smoothly
- [ ] Polling stops when status changes
- [ ] Success page shows all required info
- [ ] Failure page allows retry
- [ ] Cart preserved on failure
- [ ] Toast notifications for status changes

---

### **Phase 5.6: Order Confirmation Page** (1.5 hours)

**File**: `src/app/checkout/confirmation/page.tsx`

**Layout** (3-column grid on desktop, stacked on mobile):
```
┌─────────────────────────────────────────┐
│  ✅ Payment Successful!                 │
│  Invoice #MB-2026-001234              │
├─────────────────────────────────────────┤
│  Order Summary       Pickup Details     │
│  ────────────        ──────────────    │
│  • Kopi O (x1)       📍 Tiong Bahru   │
│  • Kaya Toast (x2)   🕒 15 Jan, 10:30 │
│  Subtotal: S$15.00                     │
│  GST (9%): S$1.35                      │
│  Total: S$16.35                        │
├─────────────────────────────────────────┤
│  [Track Order]  [Share Order]  [Order Again]│
└─────────────────────────────────────────┘
```

**Features**:
- **Invoice Number**: Large, prominent, kopitiam-style numbering
- **GST Breakdown**: Shows 4 decimal precision in calculation (display: 2 decimals)
- **Pickup Map**: Embedded map (placeholder for Phase 6)
- **Order Actions**: Track, Share, Reorder
- **Email Receipt**: Auto-sent via SendInvoiceJob (backend already implements)

**Retro Styling**:
```css
/* Invoice number */
font-family: 'Fraunces', cursive;
font-size: 2.5rem; /* 40px */
font-weight: 900;
color: var(--color-sunrise-coral);
text-shadow: 2px 2px 0 rgba(61, 35, 23, 0.1);

/* Card container */
background: linear-gradient(135deg, var(--color-latte-cream), #FFFDF6);
border: 4px solid var(--color-espresso-dark);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-glow);
```

**Social Sharing**:
```typescript
const shareOrder = async () => {
  const shareData = {
    title: 'Morning Brew Order',
    text: `Order ${invoiceNumber} - Pickup on ${pickupTime}`,
    url: window.location.href,
  };
  
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
    toast({ title: 'Copied to clipboard' });
  }
};
```

**Success Criteria**:
- [ ] Invoice number prominently displayed
- [ ] GST breakdown shows 9% calculation
- [ ] Pickup location + time clearly visible
- [ ] All three action buttons work
- [ ] Email receipt triggered automatically
- [ ] WCAG AAA compliant
- [ ] Mobile responsive layout

---

### **Phase 5.7: Error Handling & Edge Cases** (1 hour)

**Handled Edge Cases**:

**1. Network Failure**
- During payment initiation: Retry 3x, then show "Connection failed. Check your internet."
- During status polling: Continue silently, retry logic in usePaymentStatus
- On submission: Disable button with spinner, never allow double-submit

**2. Expired Payment Session**
- After 15 minutes, QR expires
- Auto-generate new QR with toast notification
- If user on card form: Allow resubmit (new PaymentIntent)

**3. Duplicate Payment Prevention**
- Frontend: Store idempotency_key in localStorage
- Check: If payment already exists for this order, show "Continue previous payment"
- Backend: PaymentService.validateNoDuplicatePayment() (already implemented)

**4. Cart Preservation**
- On payment failure: Keep items in cart
- Show toast: "Payment failed. Your items are still in your cart."
- Allow immediate retry or return to checkout

**5. Webhook Delays**
- User closes page before webhook arrives
- Recovery: Store payment_id in localStorage
- On return to order tracking: Check payment status
- Email confirmation serves as backup

**Error Toast Messages** (consistent pattern):
```typescript
toast({
  title: "Payment Failed",
  description: "Your card was declined. Please try another payment method.",
  actionLabel: "Retry",
  onAction: () => retryPayment(),
  variant: "destructive",
});
```

**Success Criteria**:
- [ ] Network errors show retry option
- [ ] Expired sessions auto-refresh
- [ ] Duplicate payments blocked
- [ ] Cart preserved on failure
- [ ] Recovery flow works after page close
- [ ] All errors use retro-toast component

---

### **Phase 5.8: E2E Testing & QA** (2 hours)

**Test Scenarios**:

**1. PayNow Success Flow**
```typescript
test('complete PayNow payment successfully', async ({ page }) => {
  // Add item to cart
  await page.click('[data-testid="add-to-cart-button"]');
  
  // Go to checkout
  await page.click('[data-testid="cart-button"]');
  await page.click('[data-testid="checkout-button"]');
  
  // Select PayNow
  await page.click('[data-testid="paynow-radio"]');
  
  // Verify QR displayed
  await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
  
  // Simulate payment webhook (backend test helper)
  await fetch('/api/test/simulate-webhook', { method: 'POST', ... });
  
  // Verify success page
  await expect(page.locator('[data-testid="success-icon"]')).toBeVisible();
  await expect(page.locator('[data-testid="invoice-number"]')).toContainText('MB-2026');
});
```

**2. Card Payment Success**
```typescript
test('complete card payment successfully', async ({ page }) => {
  await page.click('[data-testid="stripe-radio"]');
  
  // Wait for Stripe Elements to load
  await page.waitForSelector('[data-testid="stripe-card-field"]');
  
  // Fill test card
  await page.fill('[data-testid="card-number-field"]', '4242424242424242');
  await page.fill('[data-testid="expiry-field"]', '1234');
  await page.fill('[data-testid="cvc-field"]', '123');
  
  // Submit
  await page.click('[data-testid="submit-payment-button"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-icon"]')).toBeVisible();
});
```

**3. Payment Failure**
```typescript
test('handle declined card', async ({ page }) => {
  await page.click('[data-testid="stripe-radio"]');
  await page.waitForSelector('[data-testid="stripe-card-field"]');
  
  // Use declined test card
  await page.fill('[data-testid="card-number-field"]', '4000000000000002');
  
  await page.click('[data-testid="submit-payment-button"]');
  
  // Verify error toast
  await expect(page.locator('[data-testid="toast-error"]')).toContainText('declined');
  
  // Verify retry button shows
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
});
```

**4. Visual Regression**
```typescript
test('payment page matches design mockup', async ({ page }) => {
  await page.goto('/checkout/payment');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  const screenshot = await page.screenshot();
  
  // Compare against baseline
  await expect(screenshot).toMatchSnapshot('payment-page.png', {
    threshold: 0.1,
  });
});
```

**Lighthouse CI**:
```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse
  run: |
    lhci autorun --config=.lighthouserc.js
    # Assert performance budgets
    # LCP < 2.5s, CLS < 0.1, FID < 100ms
```

**Success Criteria**:
- [ ] PayNow E2E test passes
- [ ] Card payment E2E test passes
- [ ] Failure scenarios tested
- [ ] Visual regression passes
- [ ] Lighthouse score > 95
- [ ] Test coverage > 80%

---

## 📐 TECHNICAL SPECIFICATIONS

### API Integration

```typescript
// 1. Create PayNow Payment
const createPayNowPayment = async (orderId: string) => {
  const response = await fetch(`${API_BASE}/payments/${orderId}/paynow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': generateIdempotencyKey(orderId),
    },
    body: JSON.stringify({ amount: order.total }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create PayNow payment');
  }
  
  return response.json(); // { qr_code_url, payment_id, expires_at }
};

// 2. Create Stripe Payment Intent
const createStripePaymentIntent = async (orderId: string) => {
  const response = await fetch(`${API_BASE}/payments/${orderId}/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': generateIdempotencyKey(orderId),
    },
    body: JSON.stringify({ amount: order.total }),
  });
  
  return response.json(); // { client_secret, payment_id }
};

// 3. Get Payment Status
const getPaymentStatus = async (paymentId: string) => {
  const response = await fetch(`${API_BASE}/payments/${paymentId}`);
  return response.json(); // Payment object
};

// 4. Generate Idempotency Key
const generateIdempotencyKey = (orderId: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `payment_${orderId}_${timestamp}_${random}`;
};
```

### Stripe Appearance Configuration

```typescript
interface Appearance {
  theme: 'stripe';
  variables: {
    colorPrimary: string;        // #FF6B4A
    colorBackground: string;      // #FFF5E6
    colorText: string;            // #3D2317
    borderRadius: string;         // '16px'
    fontFamily: string;           // 'DM Sans'
  };
  rules: {
    '.Block': { backgroundColor: string; borderColor: string; };
    '.Input': { borderRadius: string; };
    '.Tab--selected': { backgroundColor: string; };
  };
}
```

### Zustand Store Structure

```typescript
interface PaymentStore {
  // State
  payment: Payment | null;
  qrCodeUrl: string | null;
  clientSecret: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  isPolling: boolean;

  // Actions
  selectPaymentMethod: (method: 'paynow' | 'stripe') => void;
  createPayment: (orderId: string) => Promise<void>;
  startPolling: (paymentId: string) => void;
  stopPolling: () => void;
  setStatus: (status: PaymentStatus) => void;
  reset: () => void;
}
```

---

## 🎯 SUCCESS METRICS

### Functional
- [ ] Payment method selection works (mobile & desktop)
- [ ] PayNow QR is scannable on iOS/Android
- [ ] QR save/share functions work
- [ ] Stripe card form accepts test cards
- [ ] Status polling updates UI in real-time
- [ ] Success page shows invoice and pickup details
- [ ] Failure page allows retry
- [ ] GST breakdown shows 9% correctly

### Compliance
- [ ] GST calculation: 4 decimal precision backend, 2 decimal display
- [ ] WCAG AAA: Contrast ratios ≥ 7:1
- [ ] Screen reader: All elements labeled
- [ ] Keyboard: Full Tab order navigation
- [ ] Reduced motion: Animations disabled
- [ ] Payment data: Only IDs logged (no card numbers)

### Design
- [ ] Uses retro-button wrapper (not raw Button)
- [ ] Follows 1970s color palette
- [ ] Intentional whitespace (asymmetrical)
- [ ] No generic Bootstrap grids
- [ ] Retro typography hierarchy (Fraunces + DM Sans)

### Performance
- [ ] First load < 100KB JS
- [ ] LCP < 2.5s (Lighthouse)
- [ ] Payment initiation < 800ms
- [ ] QR load < 200ms
- [ ] Stripe async loaded (not in bundle)

### Testing
- [ ] PaymentServiceTest passes (backend)
- [ ] PayNow E2E test passes
- [ ] Card payment E2E test passes
- [ ] Failure scenario tests pass
- [ ] Visual regression passes
- [ ] Lighthouse score > 95
- [ ] Test coverage > 80%

---

## ⚠️ RISK MITIGATION

### Risk 1: Mobile QR Scanning Fails
- **Mitigation**: 256x256px minimum, high contrast, save button
- **Test**: iPhone Safari, Android Chrome, WeChat browser

### Risk 2: Stripe Elements Load Failure
- **Mitigation**: Async script with retry logic, skeleton loader
- **Fallback**: "Refresh page" button if fails 3x

### Risk 3: Webhook Delay
- **Mitigation**: Show "Processing...", estimated time, email confirmation
- **Handle**: User closes page → recovery via localStorage + email

### Risk 4: Double Payment
- **Mitigation**: Idempotency keys per session, frontend checks
- **Backend**: PaymentService.validateNoDuplicatePayment()

### Risk 5: Cart Abandonment
- **Mitigation**: 30-day cart persistence, email reminder after 1 hour
- **Recovery**: "Continue previous payment" on return

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Stripe sandbox credentials configured
- [ ] PayNow UEN and API keys configured
- [ ] Webhook endpoints registered in Stripe dashboard
- [ ] Backend .env.testing has test credentials
- [ ] Frontend .env has NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

### Post-Deployment
- [ ] Webhook signature verification logs checked
- [ ] Payment success emails deliver correctly
- [ ] Inventory restoration tested on refund
- [ ] Monitoring: Payment success/failure rates
- [ ] PDPA audit trail logging verified

---

## 📚 DEPENDENCIES

### Frontend
```json
{
  "@stripe/stripe-js": "^3.0.0",
  "zustand": "^4.5.0",
  "lucide-react": "^0.300.0" // for icons
}
```

### Backend (Already Implemented)
- stripe/stripe-php: ^15.0
- predis/predis: ^2.0

---

## 📖 DOCUMENTATION

### User-Facing
- Payment method guide (PayNow vs Card)
- FAQ: "My payment failed, what do I do?"
- "How to scan PayNow QR" instructions
- GST breakdown explanation

### Developer
- API docs (OpenAPI/Swagger)
- Webhook integration guide
- Stripe test cards reference
- Payment flow diagram

---

## 🎓 LEARNING FROM PHASE 4.8

### Technical
1. **PostgreSQL Indexes**: Frontend unaffected, but tested backend via API
2. **Idempotency Keys**: Critical for preventing double-payments
3. **Webhook Security**: Frontend doesn't verify (backend only)
4. **Soft Deletes**: Frontend must respect deleted payments (don't show in history)

### Process
1. **Test Early**: Write E2E tests as components are built
2. **Visual Regression**: Daily tests to catch design drift
3. **Documentation Parallel**: Update docs with code changes
4. **Accessibility First**: Test with screen readers early

---

## ✅ APPROVAL TO PROCEED

**This implementation plan has been:**
- ✅ Validated against backend API (Phase 4.8)
- ✅ Checked against design system (tokens.css)
- ✅ Cross-referenced with compliance requirements
- ✅ Reviewed for WCAG AAA accessibility
- ✅ Estimated at 14.5 hours (± 2 hour variance)
- ✅ Risk mitigation strategies defined

**Ready for execution.**

**Next Action**: Begin Phase 5.1 (State Management)

---

*Last Updated: January 18, 2026*
*Version: 1.0*
*Author: Frontend Architect & Avant-Garde UI Designer*
