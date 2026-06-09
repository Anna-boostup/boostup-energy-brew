import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(import.meta.dirname || '', '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Allow multiple workers in CI for speed, while maintaining stability */
  workers: process.env.CI ? 2 : undefined,
  /* Timeout per test */
  timeout: 120000,
  /* Reporter to use */
  reporter: 'html',
  expect: {
    timeout: 30000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:5176',
    bypassCSP: true,
    trace: process.env.CI ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    ignoreHTTPSErrors: true,
  },

  projects: [
    // Setup projects for authentication
    {
      name: 'setup-admin',
      testMatch: 'tests/admin.setup.ts',
    },
    {
      name: 'setup-customer',
      testMatch: 'tests/customer.setup.ts',
    },
    {
      name: 'setup-company',
      testMatch: 'tests/company.setup.ts',
    },
    
    // Admin Desktop
    {
      name: 'admin-desktop',
      testMatch: ['tests/admin.spec.ts', 'tests/capture_admin_screenshots.spec.ts', 'tests/debug-email.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },

    // Admin Mobile
    {
      name: 'admin-mobile',
      testMatch: 'tests/admin-mobile.spec.ts',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },

    // Checkout Scenarios (Guest or Logged in depending on test logic)
    {
      name: 'checkout',
      testMatch: 'tests/checkout_scenarios.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup-admin', 'setup-customer', 'setup-company'],
    },

    // Payment E2E — runs on Preview only (IS_TEST_MODE=true bypasses real gateway)
    {
      name: 'payment-e2e',
      testMatch: 'tests/payment_e2e.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup-customer'],
    },

    // Full Stripe E2E — goes through real Stripe hosted checkout page
    // Requires: STRIPE_FULL_E2E=true, IS_TEST_MODE=false, STRIPE_SECRET_KEY=sk_test_...
    {
      name: 'payment-stripe-e2e',
      testMatch: 'tests/payment_stripe_full_e2e.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Allow navigation to stripe.com
        bypassCSP: true,
      },
      dependencies: ['setup-admin'],
    },

    // Full GoPay E2E — goes through real GoPay Sandbox hosted checkout page
    // Requires: GOPAY_FULL_E2E=true, IS_TEST_MODE=false
    {
      name: 'payment-gopay-e2e',
      testMatch: 'tests/payment_gopay_full_e2e.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Allow navigation to gopay.com/gopay.cz
        bypassCSP: true,
      },
      dependencies: ['setup-admin'],
    },

    // Guest / General Smoke Tests
    {
      name: 'smoke-desktop',
      testMatch: 'tests/smoke.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'smoke-mobile',
      testMatch: 'tests/mobile.spec.ts',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    
    // Visual Regression Tests (Desktop)
    {
      name: 'visual-desktop',
      testMatch: 'tests/visual.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // Visual Regression Tests (Mobile)
    {
      name: 'visual-mobile',
      testMatch: 'tests/visual.spec.ts',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    
    // Layout and Accessibility
    {
      name: 'layout-and-a11y',
      testMatch: ['tests/layout.spec.ts', 'tests/a11y.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev -- --host 127.0.0.1 --port 5176',
    url: 'http://127.0.0.1:5176',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
