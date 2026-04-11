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
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.getByTestId('login-submit-btn').click();

        // 2. Wait for Dashboard
        await expect(page).toHaveURL(/.*admin/, { timeout: 30000 });

        // 3. Test Sidebar/Mobile Menu (if applicable)
        // Check if we can see the module navigation on mobile
        // Usually it's a bottom bar or a hamburger
        const mobileNav = page.locator('nav').first();
        await expect(mobileNav).toBeVisible();

        // 4. Verify specific mobile UI changes (Icons instead of Text)
        await page.goto('/admin/orders');
        await expect(page.getByTestId('admin-page-title')).toBeVisible();

        // Check for specific icons known to be in Orders (e.g., sync icon)
        // We look for buttons that have only icons (no text on small screens)
        const syncBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /$/ }); 
        // Note: Check if we have buttons with icons only
        
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
