import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Audit', () => {
  test('should login and verify all admin modules', async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Admin credentials not provided in environment variables');
      return;
    }

    // 1. Login
    await page.goto('/login', { timeout: 60000 });
    
    // Explicitly wait for the input to be present to avoid race conditions
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 60000 });
    
    await emailInput.fill(email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("PŘIHLÁSIT SE")');

    // 2. Verify Dashboard redirection
    await expect(page).toHaveURL(/.*admin/, { timeout: 30000 });
    await expect(page.locator('h2:has-text("PŘEHLED")')).toBeVisible({ timeout: 20000 });

    // 3. Audit all pages listed in AdminLayout
    const adminPages = [
        { path: '/admin/orders', title: 'OBJEDNÁVKY' },
        { path: '/admin/inventory', title: 'SKLAD PRODUKTŮ' },
        { path: '/admin/manufacture', title: 'SKLAD VÝROBY' },
        { path: '/admin/messages', title: 'ZPRÁVY' },
        { path: '/admin/emails', title: 'E-MAILOVÉ ŠABLONY' },
        { path: '/admin/content', title: 'OBSAH WEBU' },
        { path: '/admin/pricing', title: 'CENY A STATISTIKY' },
        { path: '/admin/promo-codes', title: 'SLEVOVÉ KÓDY' },
        { path: '/admin/profile', title: 'MŮJ ÚČET' },
        { path: '/admin/help', title: 'NÁPOVĚDA' },
    ];

    for (const adminPage of adminPages) {
      await page.goto(adminPage.path);
      
      // Basic check: Page should not show "Error" or "Crashed"
      // We check for the module title (uppercase)
      const titleLocator = page.locator(`h1, h2`).filter({ hasText: adminPage.title }).first();
      await expect(titleLocator).toBeVisible({ timeout: 10000 });
      
      // Check for White Screen of Death (body should not be empty)
      const bodyContent = await page.innerHTML('body');
      expect(bodyContent.length).toBeGreaterThan(100);
    }
  });
});
