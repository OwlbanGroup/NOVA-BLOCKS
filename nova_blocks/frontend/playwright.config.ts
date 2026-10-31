/**
 * Playwright Configuration for NOVA-BLOCKS E2E Tests
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  // Run in Chrome, Firefox, and WebKit
  // projects: [
  //   {
  //     name: 'Chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //   },
  //   {
  //     name: 'Firefox',
  //     use: { ...devices['Desktop Firefox'] },
  //   },
  //   {
  //     name: 'WebKit',
  //     use: { ...devices['Desktop Safari'] },
  //   },
  // ],
  // // Optional: Base URL for tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseIfRunning: true,
  // },
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Trace enable mode: 'on-first-retry' is recommended for CI
    trace: 'on-first-retry',

    // Collect text of selector for `expect(locator).toHaveText()`
    screenshot: 'only-on-failure',

    // Animate navigation
    navigation: 'strict',

    // Headless mode
    headless: true,

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Default permissions
    permissions: ['geolocation', 'camera', 'microphone'],
  },

  // Projects for different environments
  // projects: [
  //   { name: 'Desktop', use: { ...devices['Desktop Chrome'] } },
  //   { name: 'Mobile', use: { ...devices['Pixel 5'] } },
  // ],
});