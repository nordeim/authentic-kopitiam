import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should navigate to orders page', async ({ page }) => {
    // Mock authentication if necessary (for now assuming public or simple access)
    // In a real app, we would log in first

    await page.goto('/admin');
    await expect(page.getByText("MANAGER'S OFFICE")).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();

    await page.click('text=Orders');
    await expect(page).toHaveURL(/\/admin\/orders/);
    await expect(page.getByText('Order Management')).toBeVisible();
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/admin/orders');
    
    // Find the view details button for the first order
    const firstOrderRow = page.locator('tbody tr').first();
    await expect(firstOrderRow).toBeVisible();
    
    // Click the view details button (eye icon)
    await firstOrderRow.locator('a[title="View Details"]').click();
    
    // Verify we are on the details page
    await expect(page).toHaveURL(/\/admin\/orders\/.+/);
    await expect(page.getByText('Order Items')).toBeVisible();
    await expect(page.getByText('InvoiceNow XML')).toBeVisible();
  });
});
