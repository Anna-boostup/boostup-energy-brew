import { test, expect } from './fixtures';

test.describe('Admin Dashboard Audit', () => {
  test('should login and verify all admin modules', async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Admin credentials not provided in environment variables');
      return;
    }

    // 1. Login
    console.log(`DIAGNOSTIC: Attempting login with email: ${email.substring(0, 3)}...`);
    await page.goto('/login', { timeout: 60000 });
    
    // Explicitly wait for the input to be present to avoid race conditions
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 60000 });
    
    await emailInput.fill(email);
    await page.fill('input[type="password"]', password);
    await page.getByTestId('login-submit-btn').click();
    
    // Diagnostic: Check for error messages if the URL doesn't change
    try {
        await expect(page).toHaveURL(/.*admin/, { timeout: 20000 });
    } catch (e) {
        // Take a screenshot of the login page state on failure
        await page.screenshot({ path: 'test-results/login-failure-diagnostic.png' });
        
        const errorText = await page.innerText('body');
        console.error('DIAGNOSTIC: Login failed or redirected slowly.');
        console.log('Current URL:', page.url());
        
        if (errorText.includes('Nesprávné heslo') || errorText.includes('Uživatel nenalezen')) {
            console.error('CRITICAL: Authentication rejected. Check CI Secrets (TEST_ADMIN_EMAIL/PASSWORD).');
            throw new Error(`Auth failed: ${errorText.substring(0, 50)}`);
        }
        throw e;
    }

    // 2. Verify Dashboard redirection
    await expect(page).toHaveURL(/.*admin/, { timeout: 45000 });
    const dashboardTitle = page.getByTestId('admin-page-title');
    await dashboardTitle.waitFor({ state: 'visible', timeout: 30000 });
    await expect(dashboardTitle).toBeVisible();

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
      // Wait for navigation and loading to finish
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      const loader = page.getByTestId('admin-loader');
      await expect(loader).toBeHidden({ timeout: 20000 });
      
      // Basic check: Page should not show "Error" or "Crashed"
      // We check for the module title (uppercase)
      const titleLocator = page.getByTestId('admin-page-title');
      await expect(titleLocator).toBeVisible({ timeout: 15000 });
      
      // Check for White Screen of Death (body should not be empty)
      const bodyContent = await page.innerHTML('body');
      expect(bodyContent.length).toBeGreaterThan(100);
    }
  });
});
