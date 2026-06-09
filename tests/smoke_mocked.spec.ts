import { test, expect } from './fixtures';

test.describe('Mocked Frontend Smoke Test', () => {
  test('homepage should load with essential content without hitting real Supabase', async ({ page }) => {
    // Mock Supabase REST API requests
    await page.route('**/rest/v1/**', async route => {
      // You can expand this to mock specific tables or queries based on route.request().url()
      // For a smoke test, returning an empty array is usually enough to avoid errors for missing data
      // while validating the UI renders without crashing.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]), 
      });
    });

    // Mock Supabase Auth API if used on homepage (e.g. getUser)
    await page.route('**/auth/v1/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null }), // Unauthenticated state
      });
    });

    // Capture console logs for debugging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
        }
    });

    await page.goto('/', { timeout: 60000 });
    
    // Check title
    await expect(page).toHaveTitle(/BOOSTUP/i, { timeout: 30000 });
    
    // Check hero section elements
    const heroText = page.locator('h1');
    await expect(heroText.first()).toBeVisible({ timeout: 60000 });
    
    // Check navigation
    const nav = page.locator('nav').first();
    const mobileMenuBtn = page.locator('button[aria-label*="menu" i]').first();
    
    const isNavVisible = await nav.isVisible();
    const isMobileToggleVisible = await mobileMenuBtn.isVisible();
    
    expect(isNavVisible || isMobileToggleVisible).toBe(true);
  });
});
