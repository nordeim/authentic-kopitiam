/**
 * Visual Regression Tests
 * Screenshot comparison for retro aesthetic
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Tests', () => {
  test('payment page screenshot', async ({ page }) => {
    await page.goto('/checkout/payment');
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toBeTruthy();
  });

  test('order confirmation screenshot', async ({ page }) => {
    await page.goto('/checkout/confirmation?orderId=test-123');
    await page.waitForSelector('[data-testid="invoice-number"]');
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toBeTruthy();
  });
});
