/**
 * E2E Test: Trading Flow
 * Tests the trading interface and order management
 */
import { test, expect } from '@playwright/test';

test.describe('Trading Flow', () => {
  test('should navigate to trading dashboard', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify dashboard is accessible
    await expect(page.locator('text=Trading Dashboard')).toBeVisible({ timeout: 5000 });
  });

  test('should access positions section', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Navigate to positions
    await page.click('text=Positions');

    // Verify positions page loaded
    await expect(page).toHaveURL(/.*\/positions/);
    await expect(page.locator('text=Open Positions')).toBeVisible();
  });

  test('should handle order placement form', async ({ page }) => {
    // Navigate to new order page
    await page.goto('/dashboard/orders/new');

    // Wait for form to load
    await page.waitForSelector('form');

    // Fill in order details
    await page.fill('input[name="symbol"]', 'AAPL');
    await page.fill('input[name="quantity"]', '100');
    await page.selectOption('select[name="orderType"]', 'market');

    // Submit the order
    await page.click('button[type="submit"]');

    // Verify order was placed
    await expect(page.locator('text=Order submitted successfully')).toBeVisible({ timeout: 5000 });
  });
});