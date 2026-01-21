/**
 * Payment Flow Tests
 * Core PayNow and Stripe payment flow verification
 */

import { test, expect, Page } from '@playwright/test';

class PaymentTestHelpers {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clearCart(): Promise<void> {
    await this.page.evaluate(() => localStorage.removeItem('cart-storage'));
  }

  async addProductToCart(productId: string): Promise<void> {
    await this.page.goto(`/menu?product=${productId}`);
    await this.page.click(`[data-testid="add-to-cart-button"]`);
  }
}

test.describe('Payment Flows', () => {
  test('payment page loads successfully', async ({ page }) => {
    await page.goto('/checkout/payment');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('PayNow QR code displays', async ({ page }) => {
    await page.goto('/checkout/payment?method=paynow');
    const qrVisible = await page.isVisible('[data-testid="qr-code"]');
    expect(qrVisible).toBeTruthy();
  });
});
