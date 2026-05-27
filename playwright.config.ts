import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for BoostUp Energy Brew.
 * Tests run against the staging URL by default.
 * In CI/CD the PLAYWRIGHT_TEST_BASE_URL env variable is set to the Vercel preview URL.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://test.drinkboostup.cz',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
});
