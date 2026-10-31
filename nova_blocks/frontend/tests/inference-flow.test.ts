/**
 * E2E Test: GPU Inference Flow
 * Tests the AI model inference and visualization interface
 */
import { test, expect } from '@playwright/test';

test.describe('GPU Inference Flow', () => {
  test('should load the inference page', async ({ page }) => {
    // Navigate to inference page
    await page.goto('/inference');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify inference controls are visible
    await expect(page.locator('text=Model Selection')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Run Inference')).toBeVisible();
  });

  test('should select a model and run inference', async ({ page }) => {
    // Navigate to inference page
    await page.goto('/inference');

    // Select a model from the dropdown
    await page.selectOption('select[name="model"]', 'model-a');

    // Click the run inference button
    await page.click('button:text("Run Inference")');

    // Wait for results to appear
    await page.waitForSelector('text=Inference Results', { timeout: 10000 });

    // Verify results are displayed
    await expect(page.locator('text=Prediction')).toBeVisible();
  });

  test('should display tensor visualizations', async ({ page }) => {
    // Navigate to inference page
    await page.goto('/inference');

    // Select model and run inference
    await page.selectOption('select[name="model"]', 'model-b');
    await page.click('button:text("Run Inference")');

    // Wait for visualization to render
    await page.waitForSelector('[data-testid="tensor-visualization"]', { timeout: 10000 });

    // Verify visualization container exists
    await expect(page.locator('[data-testid="tensor-visualization"]')).toBeVisible();
  });
});