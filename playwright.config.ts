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
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',
    bypassCSP: true,
    trace: process.env.CI ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
      // 'x-vercel-skip-toolbar': '1',
    },
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: 'tests/auth.setup.ts',
    },
    
    // Admin Desktop
    {
      name: 'admin-desktop',
      testMatch: 'tests/admin.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Admin Mobile
    {
      name: 'admin-mobile',
      testMatch: 'tests/admin-mobile.spec.ts',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Checkout Scenarios (Guest or Logged in depending on test logic)
    {
      name: 'checkout',
      testMatch: 'tests/checkout_scenarios.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
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
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
