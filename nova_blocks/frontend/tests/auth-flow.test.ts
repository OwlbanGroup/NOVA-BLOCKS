/**
 * E2E Test: Authentication Flow
 * Tests the user authentication and protected route access
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in the login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation or redirect
    await page.waitForURL('/dashboard');

    // Verify user is logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in incorrect credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Click the login button
    await page.click('button[type="submit"]');

    // Verify error message is displayed
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Navigate to dashboard (assuming already logged in)
    await page.goto('/dashboard');

    // Click the logout button
    await page.click('text=Logout');

    // Verify user is redirected to login page
    await page.waitForURL('/login');

    // Verify login form is visible
    await expect(page.locator('text=Login')).toBeVisible();
  });
});