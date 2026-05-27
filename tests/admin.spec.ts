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
        { path: '/admin/users', title: 'Zákazníci' },
        { path: '/admin/blog', title: 'Blog' },
        { path: '/admin/insights', title: 'Insights' },
        { path: '/admin/profile', title: 'Můj Profil' },
        { path: '/admin/help', title: 'Centrum Nápovědy' },
    ];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`BROWSER ERROR [${msg.location().url}]: ${msg.text()}`);
      }
    });

    for (const adminPage of adminPages) {
      await test.step(`Audit ${adminPage.path}`, async () => {
        console.log(`DIAGNOSTIC: Auditing admin page: ${adminPage.path}`);
        
        const response = await page.goto(adminPage.path, { timeout: 30000, waitUntil: 'load' });
        console.log(`DIAGNOSTIC - CURRENT URL: ${page.url()} (Status: ${response?.status()})`);
        
        // Check for Error Boundary crash (both old and new IDs)
        const errorBoundary = page.locator('[data-testid="admin-error-fallback"], [data-testid="admin-error-boundary"]');
        if (await errorBoundary.isVisible()) {
          const errorText = await errorBoundary.innerText();
          console.error(`DIAGNOSTIC - CRASH: Error boundary detected on ${adminPage.path}`);
          throw new Error(`CRITICAL UI CRASH on ${adminPage.path}: ${errorText}`);
        }

        const loader = page.getByTestId('admin-loader');
        try {
          await expect(loader).toBeHidden({ timeout: 15000 });
        } catch (e) {
          console.warn(`DIAGNOSTIC - WARNING: Loader still visible or timed out on ${adminPage.path}`);
        }
        
        const title = page.getByTestId('admin-page-title');
        try {
          await expect(title).toBeVisible({ timeout: 20000 });
          console.log(`DIAGNOSTIC - SUCCESS: Found title on ${adminPage.path}`);
        } catch (e) {
          console.error(`DIAGNOSTIC - FAILURE: Page title not found on ${adminPage.path}`);
          const bodyHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 1000));
          console.log(`DIAGNOSTIC - DOM SNIPPET (1000 chars):\n${bodyHtml}`);
          
          // Check if Email Management container exists
          if (adminPage.path === '/admin/emails') {
            const container = page.getByTestId('admin-email-management');
            console.log(`DIAGNOSTIC - Email Management Container Visible: ${await container.isVisible()}`);
          }

          throw e;
        }
      });
    }
  });
});
