/**
 * Payment Test Helpers
 * Utility class for testing payment flows and cart management
 */

import { Page } from '@playwright/test';

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
    await this.page.goto(`/menu?product=${productId}`);
    await this.page.click(`[data-product-id="${productId}"] [data-testid="add-to-cart-button"]`);
    
    if (quantity > 1) {
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
    
    if (method === 'paynow') {
      const paymentId = await this.page.locator('[data-testid="payment-id"]').textContent();
      await this.page.evaluate((paymentId) => {
        return fetch('/_test/simulate-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'paynow.succeeded', payment_id: paymentId }),
        });
      }, paymentId);
    } else {
      const stripeFrame = this.page.frameLocator('[data-testid="stripe-card-field"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill('4242424242424242');
      await stripeFrame.locator('[data-testid="expiry-input"]').fill('1234');
      await stripeFrame.locator('[data-testid="cvc-input"]').fill('123');
      await this.page.click('[data-testid="submit-payment-button"]');
    }
  }
}
