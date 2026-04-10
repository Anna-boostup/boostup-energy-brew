import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Test', () => {
  test('homepage should load with essential content', async ({ page }) => {
    // Capture console logs for debugging
    page.on('console', msg => {
        console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
    });

    await page.goto('/');
    
    // Check title
    const title = await page.title();
    if (title === "") {
        console.log("DEBUG: Empty title detected. Page content:");
        console.log(await page.content());
    }
    await expect(page).toHaveTitle(/BOOSTUP/i);
    
    // Check hero section elements
    const heroText = page.locator('h1');
    await expect(heroText.first()).toBeVisible();
    
    // Check navigation
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
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
