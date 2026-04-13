import { test, expect } from './fixtures';
// CI_DIAGNOSTIC_MARKER: V10_SPEED_FIX (Triggering CI)

test.describe('Admin Mobile UI Audit', () => {
    test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12/13/14 viewport

    test('should verify mobile admin layout and iconography', async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip(true, 'Admin credentials not provided');
            return;
        }

        // 1. Login
        await page.goto('/login', { timeout: 60000 });
        
        // Wait for input to be present
        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'visible', timeout: 30000 });
        
        await emailInput.fill(email);
        await page.fill('input[type="password"]', password);
        await page.getByTestId('login-submit-btn').click();

        // 2. Wait for Dashboard with Diagnostic
        try {
            await expect(page).toHaveURL(/.*admin/, { timeout: 15000 });
        } catch (e) {
            const errorText = await page.innerText('body');
            console.error('DIAGNOSTIC: Login failed in development/mobile environment');
            if (errorText.includes('Nesprávné heslo') || errorText.includes('Uživatel nenalezen')) {
                throw new Error(`Authentication failed during test: ${errorText.substring(0, 100)}`);
            }
            throw e;
        }

        // 3. Verify Dashboard title to ensure full load
        await expect(page.getByTestId('admin-page-title')).toBeVisible({ timeout: 15000 });

        // 3. Test Sidebar/Mobile Menu
        // On the new responsive layout, we have a hamburger menu trigger
        const menuTrigger = page.getByTestId('admin-mobile-menu-trigger');
        await expect(menuTrigger).toBeVisible({ timeout: 10000 });
        await menuTrigger.click();

        // Verify that the navigation list is now visible inside the Sheet
        const navList = page.locator('ul[role="list"]').filter({ visible: true });
        await expect(navList.first()).toBeVisible({ timeout: 10000 });

        // 4. Verify specific mobile UI changes (Icons instead of Text)
        await page.goto('/admin/orders');
        await page.waitForLoadState('load', { timeout: 30000 });
        
        // Ensure loader is hidden before checking the title
        const loader = page.getByTestId('admin-loader');
        await expect(loader).toBeHidden({ timeout: 20000 });
        
        // 🧪 EMERGENCY DIAGNOSTIC
        console.log('DIAGNOSTIC - CURRENT URL:', page.url());
        
        // Check IF we crashed instead of waiting 45s blindly
        const errorBoundary = page.getByTestId('admin-error-fallback');
        const isCrashed = await errorBoundary.isVisible();
        if (isCrashed) {
            const errorText = await errorBoundary.innerText();
            throw new Error(`CRITICAL UI CRASH DETECTED: ${errorText}`);
        }

        await page.screenshot({ path: 'test-results/safari-debug-pre-title.png' });
        
        await expect(page.getByTestId('admin-page-title')).toBeVisible({ timeout: 45000 });
        

        // Check for specific icons known to be in Orders (e.g., eye icon)
        // We look for buttons that contain SVGs and are VISIBLE (not in hidden sidebar).
        const iconButtons = page.locator('button').filter({ has: page.locator('svg'), visible: true });
        await expect(iconButtons.first()).toBeVisible({ timeout: 15000 });
        
        // 5. Visual health check: No horizontal scroll on the main container
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // 6. Screenshot for regression - SKIP IN CI to avoid baseline issues
        if (!process.env.CI) {
            await expect(page).toHaveScreenshot('admin-orders-mobile.png', {
                fullPage: false,
                maxDiffPixelRatio: 0.1
            });
        } else {
            console.log('SKIPPING: Visual regression screenshot in CI environment');
        }
    });
});
