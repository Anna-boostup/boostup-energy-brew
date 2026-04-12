import { test, expect } from './fixtures';

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
        const navList = page.locator('ul[role="list"]');
        await expect(navList.first()).toBeVisible({ timeout: 10000 });

        // 4. Verify specific mobile UI changes (Icons instead of Text)
        await page.goto('/admin/orders');
        await expect(page.getByTestId('admin-page-title')).toBeVisible();

        // Check for specific icons known to be in Orders (e.g., sync icon)
        // We look for buttons that contain SVGs. In mobile mode, these buttons often lose their text label.
        const iconButtons = page.locator('button').filter({ has: page.locator('svg') });
        await expect(iconButtons.first()).toBeVisible({ timeout: 10000 });
        
        // 5. Visual health check: No horizontal scroll on the main container
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // 6. Screenshot for regression
        await expect(page).toHaveScreenshot('admin-orders-mobile.png', {
            fullPage: false,
            maxDiffPixelRatio: 0.1
        });
    });
});
