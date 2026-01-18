/**
 * Payment Flow E2E Tests
 * Comprehensive testing of PayNow and Stripe payment flows
 * Covers success, failure, edge cases, and recovery scenarios
 */

import { test, expect, Page } from '@playwright/test';
import { PaymentTestHelpers } from './helpers/payment-test-helpers';
import { A11Y_CONFIG } from './config/accessibility.config';

const PAYMENT_TIMEOUT = 30000; // 30 seconds for payment completion
const POLLING_INTERVAL = 3000; // 3 seconds polling

test.describe('Payment Flows', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests sequentially

  test('PayNow payment completed successfully', async ({ page }) => {
    const helpers = new PaymentTestHelpers(page);

    // Step 1: Navigate to menu and add items to cart
    await test.step('Add items to cart', async () => {
      await page.goto('/menu');
      await page.waitForLoadState('networkidle');
      
      // Add first item
      const firstItem = await page.locator('[data-testid="product-card"]').first();
      await firstItem.locator('[data-testid="add-to-cart-button"]').click();
      
      // Wait for cart badge to update
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    });

    // Step 2: Go to checkout
    await test.step('Navigate to checkout', async () => {
      await page.click('[data-testid="cart-button"]');
      await page.click('[data-testid="checkout-button"]');
      await page.waitForURL(/\/checkout$/);
    });

    // Step 3: Select PayNow payment method
    await test.step('Select PayNow payment', async () => {
      await page.waitForSelector('[data-testid="paynow-radio"]');
      await page.click('[data-testid="paynow-radio"]');
      await expect(page.locator('[data-testid="paynow-card"]')).toHaveClass(/selected/);
    });

    // Step 4: Continue to payment
    await test.step('Continue to payment', async () => {
      await page.click('[data-testid="continue-payment-button"]');
      await page.waitForURL(/\/checkout\/payment$/);
    });

    // Step 5: Verify QR code is displayed
    await test.step('Verify QR code generation', async () => {
      await page.waitForSelector('[data-testid="qr-code"]');
      const qrImage = page.locator('[data-testid="qr-code"]');
      await expect(qrImage).toBeVisible();
      
      // Verify QR is properly sized (> 256px)
      const qrSize = await qrImage.evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }));
      expect(qrSize.width).toBeGreaterThan(256);
      expect(qrSize.height).toBeGreaterThan(256);
    });

    // Step 6: Verify payment details
    await test.step('Verify payment details displayed', async () => {
      await expect(page.locator('[data-testid="amount-display"]')).toContainText('S$');
      await expect(page.locator('[data-testid="payment-reference"]')).toBeVisible();
      await expect(page.locator('[data-testid="qr-expiry-timer"]')).toBeVisible();
    });

    // Step 7: Simulate webhook completion via test helper
    await test.step('Simulate webhook completion', async () => {
      const paymentId = await page.locator('[data-testid="payment-id"]').textContent();
      
      // Use backend test helper to simulate webhook
      const webhookResponse = await fetch('/_test/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'paynow.succeeded',
          payment_id: paymentId,
        }),
      });
      
      expect(webhookResponse.ok).toBeTruthy();
    });

    // Step 8: Verify payment status updates to completed
    await test.step('Verify payment completion', async () => {
      await page.waitForSelector('[data-testid="success-icon"]');
      await expect(page.locator('[data-testid="success-icon"]')).toBeVisible();
      
      await expect(page.locator('[data-testid="invoice-number"]')).toContainText('MB-2026');
      await expect(page.locator('[data-testid="payment-status"]')).toContainText('completed');
    });

    // Step 9: Verify order confirmation
    await test.step('Verify order confirmation', async () => {
      await expect(page.locator('h2')).toContainText('Payment Successful');
      await expect(page.locator('[data-testid="invoice-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="gst-breakdown"]')).toContainText('GST (9%)');
      await expect(page.locator('[data-testid="pickup-time"]')).toContainText('Today');
    });

    // Step 10: Verify actions are available
    await test.step('Verify action buttons', async () => {
      await expect(page.locator('[data-testid="track-order-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="share-order-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-again-button"]')).toBeVisible();
    });

    // Step 11: Take screenshot for visual regression
    await test.step('Capture success state', async () => {
      await page.screenshot({ path: './test-results/paynow-success.png', fullPage: true });
    });
  });

  test('Card payment via Stripe completed successfully', async ({ page }) => {
    const helpers = new PaymentTestHelpers(page);

    // Step 1: Setup cart with items
    await test.step('Setup items', async () => {
      await helpers.clearCart();
      await helpers.addProductToCart('kopi-o', 1);
      await helpers.addProductToCart('kaya-toast', 2);
    });

    // Step 2: Navigate to checkout
    await test.step('Navigate to checkout', async () => {
      await page.goto('/checkout');
      await page.waitForURL(/\/checkout$/);
    });

    // Step 3: Select Stripe card payment
    await test.step('Select card payment', async () => {
      await page.click('[data-testid="stripe-radio"]');
      await expect(page.locator('[data-testid="stripe-card"]')).toHaveClass(/selected/);
    });

    // Step 4: Continue to payment form
    await test.step('Navigate to payment form', async () => {
      await page.click('[data-testid="continue-payment-button"]');
      await page.waitForURL(/\/checkout\/payment$/);
    });

    // Step 5: Wait for Stripe Elements to load
    await test.step('Wait for Stripe Elements', async () => {
      await page.waitForSelector('[data-testid="stripe-elements-loaded"]');
      
      // Verify Stripe logo is visible
      await expect(page.locator('[data-testid="stripe-badge"]')).toBeVisible();
    });

    // Step 6: Fill in test card details
    await test.step('Fill test card details', async () => {
      const stripeFrame = page.frameLocator('[data-testid="stripe-card-field"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill('4242424242424242');
      await stripeFrame.locator('[data-testid="expiry-input"]').fill('1234'); // MM/YY
      await stripeFrame.locator('[data-testid="cvc-input"]').fill('123');
    });

    // Step 7: Submit payment
    await test.step('Submit payment', async () => {
      await page.click('[data-testid="submit-payment-button"]');
      
      // Wait for processing state
      await expect(page.locator('[data-testid="processing-spinner"]')).toBeVisible();
      
      // Simulate successful payment confirmation
      await page.waitForSelector('[data-testid="success-icon"]');
    });

    // Step 8: Verify success page
    await test.step('Verify success page', async () => {
      await expect(page.locator('[data-testid="payment-amount"]')).toContainText('S$');
      await expect(page.locator('[data-testid="gst-breakdown"]')).toContainText('9%');
      await expect(page.locator('[data-testid="pickup-details"]')).toBeVisible();
      
      // Verify email receipt notification
      await expect(page.locator('[data-testid="email-receipt-sent"]')).toBeVisible();
    });

    // Step 9: Visual regression check
    await test.step('Capture Stripe success state', async () => {
      await page.screenshot({ path: './test-results/stripe-success.png', fullPage: true });
    });
  });

  test('Payment failure scenarios - declined card', async ({ page }) => {
    const helpers = new PaymentTestHelpers(page);

    await test.step('Setup declined card scenario', async () => {
      await helpers.addProductToCart('kopi-o', 1);
      await page.goto('/checkout/payment');
      await page.click('[data-testid="stripe-radio"]');
      await page.click('[data-testid="continue-payment-button"]');
    });

    // Use declined card number
    await test.step('Use declined test card', async () => {
      const stripeFrame = page.frameLocator('[data-testid="stripe-card-field"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill('4000000000000002'); // Declined card
      await stripeFrame.locator('[data-testid="expiry-input"]').fill('1234');
      await stripeFrame.locator('[data-testid="cvc-input"]').fill('123');
    });

    await test.step('Submit and verify error', async () => {
      await page.click('[data-testid="submit-payment-button"]');
      
      // Wait for error
      await page.waitForSelector('[data-testid="error-toast"]');
      await expect(page.locator('[data-testid="error-toast"]')).toContainText('declined');
      
      // Verify retry button is visible
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    // Verify cart preserved
    await test.step('Verify cart preserved', async () => {
      await page.goto('/cart');
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    });
  });

  test('Payment failure - network timeout', async ({ page }) => {
    // Simulate network failure
    await page.route('**/v1/payments/**', (route) => {
      route.abort('connectionrefused'); 
    });

    await test.step('Attempt payment during network failure', async () => {
      await page.goto('/checkout/payment');
      
      // Network error should show appropriate message
      await expect(page.locator('[data-testid="offline-fallback"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    // Test recovery
    await test.step('Test network recovery', async () => {
      await page.unroute('**/v1/payments/**');
      await page.click('[data-testid="retry-button"]');
      
      // Should return to payment selection
      await expect(page.locator('[data-testid="payment-method-selector"]')).toBeVisible();
    });
  });

  test('QR expiry and auto-refresh', async ({ page }) => {
    await test.step('Generate QR and wait for expiry', async () => {
      await page.goto('/checkout/payment?method=paynow');
      await page.waitForSelector('[data-testid="qr-code"]');
      
      // Wait for expiry (15 minutes in production, 30 seconds in test)
      const expiryTimer = page.locator('[data-testid="qr-expiry-timer"]');
      await expect(expiryTimer).toContainText('14:'); // Within first minute
      
      // Fast-forward to near expiry in test environment
      await page.evaluate(() => {
        // In test environment, expiry is 1 minute
        localStorage.setItem('qr_expiry_override', new Date(Date.now() - 58000).toISOString()); // 58 seconds ago
      });
    });

    await test.step('Verify auto-refresh', async () => {
      // Wait for auto-refresh toast
      await expect(page.locator('[data-testid="qr-refreshed-toast"]')).toBeVisible();
      
      // Wait for new QR
      await page.waitForSelector('[data-testid="qr-code"]');
      
      // Verify timer reset to 15:00
      await expect(page.locator('[data-testid="qr-expiry-timer"]')).toContainText('15:');
    });
  });

  test('Payment session persistence and recovery', async ({ page }) => {
    const helpers = new PaymentTestHelpers(page);

    await test.step('Start payment and store session', async () => {
      await helpers.addProductToCart('kopi-o', 1);
      await page.goto('/checkout/payment');
      await page.click('[data-testid="paynow-radio"]');
      await page.click('[data-testid="continue-payment-button"]');
      
      // Verify payment stored in localStorage
      const hasPayment = await page.evaluate(() => {
        const payment = localStorage.getItem('payment-storage');
        return !!payment;
      });
      
      expect(hasPayment).toBeTruthy();
    });

    await test.step('Simulate page reload during payment', async () => {
      await page.reload();
      
      // Should show recovery modal
      await expect(page.locator('[data-testid="payment-recovery-modal"]')).toBeVisible();
    });

    await test.step('Resume payment from recovery modal', async () => {
      await page.click('[data-testid="resume-payment-button"]');
      
      // Should return to QR display
      await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    });
  });

  test('GST calculation accuracy', async ({ page }) => {
    await test.step('Add multiple items with different prices', async () => {
      await page.goto('/menu');
      
      // Add items with known prices
      await helpers.addProductToCart('kopi-o', 2);        // $2.50 each
      await helpers.addProductToCart('kaya-toast', 1);   // $3.50 each
      await helpers.addProductToCart('soft-boiled-eggs', 3); // $1.80 each
    });

    await test.step('Verify GST calculation', async () => {
      await page.goto('/checkout/payment?method=paynow');
      await page.waitForURL(/\/checkout\/payment$/);
      
      // Extract amounts from page
      const subtotal = await page.locator('[data-testid="subtotal"]').textContent();
      const gstAmount = await page.locator('[data-testid="gst-amount"]').textContent();
      const totalAmount = await page.locator('[data-testid="total-amount"]').textContent();
      
      // Parse amounts
      const subtotalNum = parseFloat(subtotal.replace('S$', '').trim());
      const gstNum = parseFloat(gstAmount.replace('S$', '').trim());
      const totalNum = parseFloat(totalAmount.replace('S$', '').trim());
      
      // Verify GST is exactly 9%
      const calculatedGST = subtotalNum * 0.09;
      expect(Math.abs(gstNum - calculatedGST)).toBeLessThan(0.01);
      expect(Math.abs(totalNum - (subtotalNum + calculatedGST))).toBeLessThan(0.01);
    });
  });

  test('Accessibility - payment page WCAG AAA compliance', async ({ page }) => {
    await test.step('Navigate to payment page', async () => {
      await helpers.addProductToCart('kopi-o', 1);
      await page.goto('/checkout/payment');
    });

    await test.step('Run axe accessibility scan', async () => {
      const accessibilityScanResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Inject axe-core via CDN
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.8.2/axe.min.js';
          script.onload = () => {
            // @ts-ignore
            window.axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag2aaa']
              }
            }).then(resolve);
          };
          document.head.appendChild(script);
        });
      });

      // Verify no critical accessibility violations
      const violations = accessibilityScanResults.violations;
      const criticalViolations = violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
      
      if (criticalViolations.length > 0) {
        console.log('Critical accessibility violations:', criticalViolations);
      }
      expect(criticalViolations.length).toBe(0);
    });
  });

  test('Payment cancellation flow', async ({ page }) => {
    await test.step('Start payment and cancel', async () => {
      await helpers.addProductToCart('kopi-o', 1);
      await page.goto('/checkout/payment');
      await page.click('[data-testid="paynow-radio"]');
      await page.click('[data-testid="continue-payment-button"]');
      
      // Click back button
      await page.click('[data-testid="back-to-cart-button"]');
      
      // Verify back on cart page
      await page.waitForURL(/\/cart$/);
      await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
    });

    await test.step('Verify cart preserved', async () => {
      // Items should still be in cart
      await expect(page.locator('[data-testid="cart-item-count"]')).not.toContainText('0');
    });
  });

  test('Network recovery retry logic', async ({ page }) => {
    // Setup network failure then recovery
    await test.step('Trigger network failure', async () => {
      await page.route('**/v1/payments/**', (route) => {
        setTimeout(() => route.abort('connectionrefused'), 100);
      });
    });

    await test.step('Attempt payment and fail', async () => {
      await page.goto('/checkout/payment');
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    });

    await test.step('Recover network and retry', async () => {
      await page.unroute('**/v1/payments/**');
      await page.click('[data-testid="retry-button"]');
      
      // Should succeed on retry
      await page.waitForURL(/\/checkout\/payment$/);
      await expect(page.locator('[data-testid="payment-method-selector"]')).toBeVisible();
    });
  });

  test('Payment link sharing functionality', async ({ page }) => {
    await test.step('Complete payment and share', async () => {
      await helpers.completePayment('paynow');
      
      // Click share button
      await page.click('[data-testid="share-order-button"]');
      
      // Mock share popup (since Web Share API may not work in test environment)
      const shareText = await page.evaluate(() => {
        return navigator.clipboard.readText();
      });
      
      expect(shareText).toContain('Morning Brew');
      expect(shareText).toContain('S$');
    });
  });
});

// Test helpers class
export class PaymentTestHelpers {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clearCart(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('cart-storage');
    });
  }

  async addProductToCart(productId: string, quantity: number = 1): Promise<void> {
    // Navigate to product (or use API if available)
    await this.page.goto(`/menu?product=${productId}`);
    await this.page.click(`[data-product-id="${productId}"] [data-testid="add-to-cart-button"]`);
    
    if (quantity > 1) {
      // Update quantity
      const quantitySelector = this.page.locator(`[data-product-id="${productId}"] [data-testid="quantity-selector"] input`);
      if (await quantitySelector.isVisible()) {
        await quantitySelector.fill(quantity.toString());
      }
    }
  }

  async completePayment(method: 'paynow' | 'stripe'): Promise<void> {
    await this.page.goto('/checkout/payment');
    await this.page.click(`[data-testid="${method}-radio"]`);
    await this.page.click('[data-testid="continue-payment-button"]');
    
    // Handle method-specific completion
    if (method === 'paynow') {
      // Simulate webhook for PayNow
      const paymentId = await this.page.locator('[data-testid="payment-id"]').textContent();
      await fetch('/_test/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'paynow.succeeded', payment_id: paymentId }),
      });
    } else {
      // For Stripe, fill test card
      const stripeFrame = this.page.frameLocator('[data-testid="stripe-card-field"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill('4242424242424242');
      await stripeFrame.locator('[data-testid="expiry-input"]').fill('1234');
      await stripeFrame.locator('[data-testid="cvc-input"]').fill('123');
      await this.page.click('[data-testid="submit-payment-button"]');
    }
  }
}
