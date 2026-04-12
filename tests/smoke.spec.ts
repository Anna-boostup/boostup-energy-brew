import { test, expect } from './fixtures';

test.describe('Frontend Smoke Test', () => {
  test('homepage should load with essential content', async ({ page }) => {
    // Capture console logs for debugging
    page.on('console', msg => {
        console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
    });

    await page.goto('/', { timeout: 60000 });
    
    // Check title
    const title = await page.title();
    if (title === "") {
        console.log("DEBUG: Empty title detected. Page content:");
        console.log(await page.content());
    }
    await expect(page).toHaveTitle(/BOOSTUP/i, { timeout: 30000 });
    
    // Check hero section elements
    const heroText = page.locator('h1');
    try {
        await expect(heroText.first()).toBeVisible({ timeout: 60000 });
    } catch (error) {
        console.error("DIAGNOSTIC: h1 NOT found! Printing page content for debugging:");
        console.log(await page.content());
        throw error;
    }
    
    // Check navigation (Responsive check)
    const nav = page.locator('nav').first();
    const mobileMenuBtn = page.locator('button[aria-label*="menu" i]').first();
    
    // On mobile, 'nav' might be hidden (desktop-only classes), so we check for either nav or mobile toggle
    const isNavVisible = await nav.isVisible();
    const isMobileToggleVisible = await mobileMenuBtn.isVisible();
    
    expect(isNavVisible || isMobileToggleVisible).toBe(true);
  });

  test('navigation to legal pages should work', async ({ page }) => {
    await page.goto('/');
    
    // Smooth scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check one legal link
    const termsLink = page.getByRole('link', { name: /obchodní podmínky/i }).first();
    if (await termsLink.isVisible()) {
        await termsLink.click();
        await expect(page).toHaveURL(/.*obchodni-podminky/);
    }
  });
});
