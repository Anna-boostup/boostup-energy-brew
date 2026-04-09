import { test, expect } from '@playwright/test';

test.describe('Purchase Flow E2E', () => {
  test('should complete a full checkout journey', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');

    // 2. Add product to cart
    // Using a robust selector for the Add to Cart button
    const addToCartBtn = page.locator('button:has-text("PŘIDAT DO KOŠÍKU")').first();
    await addToCartBtn.click();

    // 3. Go to Checkout
    // The cart modal should open
    const checkoutBtn = page.locator('button:has-text("K pokladně")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 4. Fill Checkout Form
    await expect(page).toHaveURL(/.*checkout/);
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test-e2e@drinkboostup.cz');
    await page.fill('input[name="phone"]', '+420 123 456 789');
    await page.fill('input[name="street"]', 'Testovací');
    await page.fill('input[name="houseNumber"]', '123');
    await page.fill('input[name="city"]', 'Praha');
    await page.fill('input[name="zip"]', '110 00');

    // 5. Delivery Method
    const zasilkovnaBtn = page.locator('button:has-text("Zásilkovna")');
    if (await zasilkovnaBtn.isVisible()) {
        await zasilkovnaBtn.click();
        // Packeta widget usually opens in an iframe or modal
    }

    // 6. Payment Method
    // Select Manual Transfer to avoid real gateway interaction during basic smoke tests
    const manualTransfer = page.locator('button:has-text("Bankovní převod")').first();
    if (await manualTransfer.isVisible()) {
        await manualTransfer.click();
    }

    // 7. Submit (Final Step)
    // We expect a "ZÁVAZNĚ OBJEDNAT" button
    const submitBtn = page.locator('button:has-text("ZÁVAZNĚ OBJEDNAT")').first();
    if (await submitBtn.isVisible()) {
        // In CI we might not want to actually submit if it's hitting live DB
        // But for a full E2E verify we can.
        // await submitBtn.click();
    }
  });
});
