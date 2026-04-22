import { test, expect } from './fixtures';

test.describe('Admin Dashboard Audit', () => {
  test('should login and verify all admin modules', async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Admin credentials not provided in environment variables');
      return;
    }

    // 1. Audit all pages listed in AdminLayout
    // Since we are using storageState, we start already logged in.
    await page.goto('/admin');
    const dashboardTitle = page.getByTestId('admin-page-title');
    await expect(dashboardTitle).toBeVisible({ timeout: 15000 });

    // 3. Audit all pages listed in AdminLayout
    const adminPages = [
        { path: '/admin/orders', title: 'Správa objednávek' },
        { path: '/admin/inventory', title: 'Sklad produktů' },
        { path: '/admin/manufacture', title: 'Suroviny & Materiály' },
        { path: '/admin/messages', title: 'Zprávy z webu' },
        { path: '/admin/emails', title: 'E-mail Management' },
        { path: '/admin/content', title: 'CONTENT ENGINE' },
        { path: '/admin/pricing', title: 'Ceny & Statistiky' },
        { path: '/admin/promo-codes', title: 'SLEVOVÉ KÓDY' },
        { path: '/admin/profile', title: 'Můj Profil' },
        { path: '/admin/help', title: 'Centrum Nápovědy' },
    ];

    for (const adminPage of adminPages) {
      console.log(`DIAGNOSTIC: Auditing admin page: ${adminPage.path}`);
      await page.goto(adminPage.path, { timeout: 30000 });
      
      // Wait for navigation and loading to finish
      await page.waitForLoadState('load', { timeout: 30000 });
      
      // 🧪 DIAGNOSTIC: Verify we are on the correct page
      const currentUrl = page.url();
      console.log(`DIAGNOSTIC - CURRENT URL: ${currentUrl}`);
      
      // Check for Error Boundary crash
      const errorBoundary = page.getByTestId('admin-error-fallback');
      if (await errorBoundary.isVisible()) {
        const errorText = await errorBoundary.innerText();
        throw new Error(`CRITICAL UI CRASH on ${adminPage.path}: ${errorText}`);
      }

      const loader = page.getByTestId('admin-loader');
      await expect(loader).toBeHidden({ timeout: 20000 });
      
      const title = page.getByTestId('admin-page-title');
      await expect(title).toBeVisible({ timeout: 20000 });
      
      // Verify page content exists
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    }
  });
});
