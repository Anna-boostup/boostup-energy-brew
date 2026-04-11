import { test, expect } from './fixtures';

test.describe('Mobile UI & Checkout Audit', () => {
    // We target mobile devices specifically
    test.use({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' });

    test('should navigate via hamburger menu and open cart', async ({ page }) => {
        await page.goto('/', { timeout: 60000 });

        // 1. Test Hamburger Menu
        const menuBtn = page.locator('button[aria-label="Otevřít menu"]');
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();

        // Verify menu is open (check for "Zavřít menu" label or presence of links)
        const closeBtn = page.locator('button[aria-label="Zavřít menu"]');
        await expect(closeBtn).toBeVisible();
        
        // Check for a known link in the menu
        const shopLink = page.locator('nav a').filter({ hasText: /produkty/i }).first();
        await expect(shopLink).toBeVisible();

        // Close menu
        await closeBtn.click();
        await expect(menuBtn).toBeVisible();

        // 2. Test Mobile Cart Access
        const cartBtn = page.getByTestId('header-cart-btn').first();
        await cartBtn.click();

        // Verify cart drawer is open
        const checkoutBtn = page.getByTestId('cart-drawer-checkout-btn');
        await expect(checkoutBtn).toBeVisible();
    });

    test('should complete mobile checkout flow and verify layout', async ({ page }) => {
        // 1. Add product to cart directly via URL or interaction
        await page.goto('/', { timeout: 60000 });
        const heroBuyBtn = page.getByTestId('add-to-cart-hero-btn');
        await heroBuyBtn.click();

        // 2. Go to checkout
        const cartBtn = page.getByTestId('header-cart-btn').first();
        await cartBtn.click();
        await page.getByTestId('cart-drawer-checkout-btn').click();
        
        await expect(page).toHaveURL(/.*checkout/);

        // 3. Visual Regression Check (Snapshot)
        // This will create a baseline first time it runs
        await expect(page).toHaveScreenshot('mobile-checkout-page.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05
        });

        // 4. Interaction Test: Form filling
        await page.fill('input[name="firstName"]', 'Mobilní');
        await page.fill('input[name="lastName"]', 'Tester');
        await page.fill('input[name="email"]', 'mobile-test@drinkboostup.cz');
        await page.fill('input[name="phone"]', '+420 600111222');

        // Scroll check: Ensure the submit button is reachable and not clipped
        const submitBtn = page.getByTestId('checkout-submit-btn');
        await submitBtn.scrollIntoViewIfNeeded();
        await expect(submitBtn).toBeVisible();
        await expect(submitBtn).toBeEnabled();
    });
});
