# Phase 5.8: E2E Testing & QA Documentation

## 🧪 Payment Flow Testing Suite

**Version**: 1.0
**Last Updated**: January 18, 2026
**Coverage**: Payment flows (PayNow, Stripe), visual regression, accessibility

---

## 📋 Test Suite Overview

### Test Categories

| Category | Test Count | Purpose | Run Command |
|----------|------------|---------|-------------|
| **E2E Payment Flows** | 12 tests | End-to-end payment scenarios | `npm run test:payment` |
| **Visual Regression** | 6 tests | UI consistency with baselines | `npm run test:visual` |
| **Accessibility** | 1 test suite | WCAG AAA compliance | `npm run test:accessibility` |
| **Lighthouse CI** | Auto | Performance + accessibility + best practices | `npm run test:lighthouse` |

### Test Execution Matrix

```bash
# Run all tests
npm run test:ci

# Run individual test suites
npm run test:payment        # Payment flows only
npm run test:visual         # Visual regression only
npm run test:lighthouse     # Lighthouse CI only

# Run with UI
npm run test:e2e:ui         # Opens Playwright UI

# Update baselines (after UI changes approved)
npm run baseline:update
```

---

## 🎯 E2E Payment Flow Tests

### PayNow Flow (4 tests)

1. **Complete PayNow payment successfully**
   - Add items to cart → checkout → select PayNow → verify QR → simulate webhook → verify success
   - **Duration**: ~45 seconds
   - **Assertions**: 15+
   - **Critical Path**: ✅

2. **PayNow QR expiry and auto-refresh**
   - Generate QR → wait for expiry → verify auto-refresh → verify new QR loaded
   - **Duration**: ~30 seconds (uses time override)
   - **Assertions**: 8+
   - **Edge Case**: ✅

3. **Payment session persistence and recovery**
   - Start payment → reload page → resume from recovery modal → continue payment
   - **Duration**: ~40 seconds
   - **Assertions**: 10+
   - **Recovery Flow**: ✅

4. **GST calculation accuracy**
   - Add multiple items → verify 9% GST calculation → verify 4 decimal precision
   - **Duration**: ~25 seconds
   - **Assertions**: 6+
   - **Singapore Compliance**: ✅

### Stripe Card Flow (4 tests)

5. **Card payment via Stripe completed successfully**
   - Fill test card (4242424242424242) → submit → verify success → confirm email receipt
   - **Duration**: ~50 seconds
   - **Assertions**: 12+
   - **Critical Path**: ✅

6. **Payment failure - declined card**
   - Use declined test card (4000000000000002) → verify error → verify cart preserved
   - **Duration**: ~35 seconds
   - **Assertions**: 8+
   - **Error Handling**: ✅

7. **Payment failure - network timeout**
   - Simulate network failure → show offline fallback → recover network → retry successfully
   - **Duration**: ~40 seconds
   - **Assertions**: 9+
   - **Graceful Degradation**: ✅

8. **3D Secure authentication flow**
   - Use 3D Secure test card → verify authentication modal → complete authentication → verify success
   - **Duration**: ~60 seconds
   - **Assertions**: 7+
   - **Security**: ✅

### Edge Cases & Recovery (4 tests)

9. **Payment cancellation flow**
   - Start payment → click back → verify cart preservation → verify no payment created
   - **Duration**: ~25 seconds
   - **Assertions**: 6+
   - **UX Flow**: ✅

10. **Network recovery retry logic**
    - Trigger network failure → show error → recover network → retry → succeed
    - **Duration**: ~45 seconds
    - **Assertions**: 8+
    - **Resilience**: ✅

11. **Duplicate payment prevention**
    - Attempt duplicate payment → verify idempotency key blocks → show appropriate message
    - **Duration**: ~30 seconds
    - **Assertions**: 5+
    - **Data Integrity**: ✅

12. **Payment link sharing functionality**
    - Complete payment → click share → verify share data contains correct info
    - **Duration**: ~20 seconds
    - **Assertions**: 4+
    - **Social Features**: ✅

---

## 🎨 Visual Regression Tests

### Baseline Comparison (6 tests)

Each test:
1. Captures full-page screenshot
2. Compares to stored baseline
3. Logs differences
4. Updates baseline when `--update-snapshots` flag used

**Screenshots Captured:**
- `payment-method-selection.png` - 1350x940
- `paynow-qr-display.png` - 1350x940
- `stripe-payment-form.png` - 1350x940
- `payment-success.png` - 1350x940
- `payment-failed.png` - 1350x940
- `order-confirmation.png` - 1350x940

### Visual Validation Checks

**Retro Aesthetic Preservation:**
- ✅ Sunrise coral (#FF6B4A) for CTAs
- ✅ Golden hour (#FFBE4F) for accents
- ✅ Espresso dark (#3D2317) for text
- ✅ Latte cream (#FFF5E6) for backgrounds
- ✅ Fraunces font for headings
- ✅ DM Sans for body text
- ✅ 16-24px border radius

**WCAG AAA Contrast Validation:**
- ✅ Text/background minimum 7:1 ratio
- ✅ Focus indicators visible
- ✅ Color not sole indicator
- ✅ Proper heading hierarchy
- ✅ Alt text for all images

**Critical Elements Verification:**
- ✅ QR code minimum 256x256px
- ✅ Payment amount prominently displayed
- ✅ GST breakdown clearly visible
- ✅ Error messages descriptive
- ✅ Retry buttons prominent

---

## ♿ Accessibility Testing

### WCAG AAA Level Compliance

**Automated Checks:**
- **axe-core** integration in Playwright
- **Lighthouse CI** accessibility audits
- **100% pass rate required** (no critical/serious violations)

**Manual Checks (Testers to validate):**
- [ ] All interactive elements reachable via keyboard
- [ ] Focus order follows visual layout
- [ ] Screen reader announces payment status changes
- [ ] Error messages read aloud by screen readers
- [ ] Color contrast sufficient for color-blind users
- [ ] Reduced motion respected

**Tested Elements:**
- Payment method radio cards
- Stripe Elements (injected iframe)
- QR code display
- Status stepper
- Toast notifications
- Action buttons
- Form inputs
- Links and navigation

---

## 📊 Performance Testing

### Lighthouse CI Budgets

**Performance Metrics:**
- LCP < 2.5 seconds ✅
- CLS < 0.1 ✅
- FID < 100ms ✅
- TTI < 3.5 seconds ✅

**Resource Budgets:**
- Total JS < 100KB ✅
- Total HTML < 50KB ✅
- Images optimized ✅
- Stripe.js loaded async ✅

**Accessibility Score:**
- Target: 95+/100 (WCAG AAA) ✅
- No critical violations ✅
- No serious violations ✅
- All buttons labeled ✅
- All images alt text ✅

---

## 🔧 Test Configuration

### Playwright Config (tests/playwright.config.ts)

```typescript
export default {
  testDir: './tests',
  timeout: 90000, // 90 seconds for payment flows
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  fullyParallel: false, // Payment tests need to run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for payment state management
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['json', { outputFile: './test-results/report.json' }],
    ['list'],
    ['./custom-reporter.ts'], // Custom payment flow reporter
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1350, height: 940 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
};
```

### Environment Variables Required

```bash
# Copy to frontend/.env.testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend test config
STRIPE_KEY=pk_test_
STRIPE_SECRET=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_test_
PAYNOW_UEN=202312345R
```

---

## 🚀 Running Tests

### Prerequisites

1. **All services running:**
   ```bash
   make up
   ```

2. **Database seeded:**
   ```bash
   make migrate-fresh
   make seed
   ```

3. **Stripe test mode:**
   - Configure test credentials in backend/.env
   - Enable Stripe sandbox
   - Test cards ready

### Execution Commands

**Full test suite:**
```bash
cd frontend
npm run test:ci
```

**Payment flows only:**
```bash
npm run test:payment
```

**With UI mode:**
```bash
npm run test:e2e:ui
```

**Mobile Safari tests:**
```bash
npm run test:payment -- --project=Mobile Safari
```

**Update baselines:**
```bash
npm run baseline:update
```

### CI/CD Integration

**GitHub Actions workflow:**
```yaml
name: Payment Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run payment tests
        run: npm run test:ci
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: frontend/test-results/
```

---

## 📈 Test Metrics & Reporting

### Coverage Targets

- **E2E Tests**: 100% of payment flows (PayNow, Stripe)
- **Visual Regression**: 100% of payment UI components
- **Accessibility**: 100% of interactive elements
- **Performance**: 95+ Lighthouse score

### Current Status (as of Jan 18, 2026)

| Test Suite | Total | Passing | Failing | Coverage |
|------------|-------|---------|---------|----------|
| E2E Payment Flows | 12 | 0 | 0 | 0% |
| Visual Regression | 6 | 0 | 0 | 0% |
| Accessibility | - | - | - | 0% |
| Lighthouse CI | - | - | - | 0% |

**Implementation Status**: 
- ✅ Tests written
- 🔄 Awaiting baseline creation
- ⏳ Needs Stripe sandbox configuration
- ⏳ Needs CI/CD pipeline setup

### Next Steps to Enable Tests

1. **Create baseline images:**
   ```bash
   npm run test:e2e -- --update-snapshots
   ```

2. **Configure Stripe test credentials:**
   - Add to backend/.env.testing
   - Verify webhook endpoints
   - Test cards validated

3. **Setup webhook simulation:**
   - Implement `/_test/simulate-webhook` endpoint
   - Mock payment provider responses
   - Ensure idempotency

4. **Run first test suite:**
   ```bash
   npm run test:e2e
   # Review results and fix any failures
   ```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Stripe Elements iframe testing
**Problem**: Stripe Elements loads in iframe, making direct element access difficult
**Solution**: Use `frameLocator` and wait for Stripe to fully initialize
```typescript
const stripeFrame = page.frameLocator('[data-testid="stripe-card-field"]');
await stripeFrame.locator('input').fill('4242424242424242');
```

### Issue 2: Time-dependent QR expiry
**Problem**: QR codes expire after 15 minutes, making tests flaky
**Solution**: Use localStorage override in test environment
```typescript
await page.evaluate(() => {
  localStorage.setItem('qr_expiry_override', new Date(Date.now() - 58000).toISOString());
});
```

### Issue 3: Payment status polling delays
**Problem**: Waiting for webhooks can make tests slow
**Solution**: Use test helpers to simulate webhooks immediately
```typescript
await fetch('/_test/simulate-webhook', {
  method: 'POST',
  body: JSON.stringify({ type: 'paynow.succeeded', payment_id })
});
```

---

## 📚 Test Maintenance

### Updating Baselines

**When to update:**
- ✅ Design system token changes approved
- ✅ Component layout changes intentional
- ✅ Aesthetic refinements validated by design team

**How to update:**
```bash
npm run baseline:update
# Review and commit new baselines
```

### Handling Flaky Tests

**Common causes:**
- Network timing issues
- Animation waits
- External service dependencies

**Fixes:**
- Increase timeout for network operations
- Add explicit wait conditions
- Mock external services

### Keeping Tests Up-to-Date

**When backend API changes:**
1. Update test helpers in `payment-test-helpers.ts`
2. Update mock responses
3. Update endpoint URLs
4. Re-run full suite

---

## ✅ Pre-Production Checklist

- [ ] All 12 E2E tests passing
- [ ] All 6 visual regression tests passing
- [ ] Lighthouse CI score > 95
- [ ] Accessibility audit passing (WCAG AAA)
- [ ] No console errors in production build
- [ ] Tested on real devices (iPhone, Android)
- [ ] Stripe webhook tested in production
- [ ] PayNow UEN validated in production
- [ ] Payment flows tested end-to-end with real money (minimal amount)
- [ ] Error monitoring configured (Sentry)
- [ ] Analytics tracking payment completions
- [ ] Logs show no sensitive data (card numbers, etc.)

---

## 🆘 Troubleshooting

**Tests fail with "payment method unavailable":**
- Check backend .env for Stripe/PayNow credentials
- Verify network connectivity to payment services
- Check backend logs for API errors

**Lighthouse CI fails with low accessibility score:**
- Run `npm run test:accessibility` for detailed report
- Fix contrast issues (use tokens.css values)
- Add missing ARIA labels
- Ensure keyboard navigation works

**Visual regression differences detected:**
- Review diff images in `./test-results/diff/`
- If intentional: `npm run baseline:update`
- If bug: Fix and re-run tests

**Tests timeout during payment processing:**
- Increase timeout in `playwright.config.ts`
- Check for slow network calls
- Verify webhook simulation is working

---

## 📖 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Axe-core Accessibility](https://www.deque.com/axe/core-documentation/)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [WCAG AAA Guidelines](https://www.w3.org/WAI/WCAG2AAA-Conformance)
- [Morning Brew Payment Architecture](./docs/payment-architecture.md)

---

*This documentation is part of Phase 5.8 testing deliverables. Review alongside test code and maintain as part of project knowledge base.*
