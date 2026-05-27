import { test, expect } from './fixtures';

/**
 * End-to-end payment flow tests.
 *
 * In Preview environment (IS_TEST_MODE=true), the API bypasses the real gateway
 * and redirects directly to /payment/success — so the full order flow is tested
 * without any real money being charged.
 *
 * In Production, this test is intentionally skipped to avoid real charges.
 */

const PREVIEW_ONLY = process.env.PLAYWRIGHT_TEST_BASE_URL?.includes('test.')
  || process.env.IS_TEST_MODE === 'true'
  || process.env.PLAYWRIGHT_TEST_BASE_URL?.includes('vercel.app');

test.describe('Payment Gateway — End-to-End Flow', () => {

  test.beforeEach(async ({ page }) => {
    if (!PREVIEW_ONLY) {
      test.skip(true, 'Skipping payment test on production to avoid real charges.');
    }
  });

  // ─── GUEST: Card payment (Stripe / GoPay) ───────────────────────────────────
  test('Guest — complete order via card payment', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    // 2. Add product to cart
    const addToCartBtn = page.getByTestId('add-to-cart-hero-btn');
    await addToCartBtn.waitFor({ state: 'visible', timeout: 60000 });
    await addToCartBtn.click();

    // 3. Open cart drawer
    await page.waitForTimeout(800);
    const cartBtn = page.getByTestId('header-cart-btn').filter({ visible: true }).first();
    await cartBtn.click({ force: true });

    // 4. Proceed to checkout
    const checkoutBtn = page.getByTestId('cart-drawer-checkout-btn');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    // 5. Fill in guest details
    await page.fill('input[name="firstName"]', 'Testovací');
    await page.fill('input[name="lastName"]', 'Zákazník');
    await page.fill('input[name="email"]', `e2e-payment-${Date.now()}@test.drinkboostup.cz`);
    await page.fill('input[name="phone"]', '+420 777 000 001');
    await page.fill('input[name="street"]', 'Testovací');
    await page.fill('input[name="houseNumber"]', '1');
    await page.fill('input[name="city"]', 'Praha');
    await page.fill('input[name="zip"]', '110 00');

    // 6. Select shipping method (first available)
    const shippingZasilkovna = page.getByTestId('checkout-shipping-zasilkovna');
    const shippingCzPost = page.getByTestId('checkout-shipping-home_delivery');
    if (await shippingCzPost.isVisible()) {
      await shippingCzPost.click();
    } else {
      await shippingZasilkovna.click();
    }

    // 7. Select card payment
    const cardPayment = page.getByTestId('checkout-payment-card');
    await cardPayment.waitFor({ state: 'visible', timeout: 10000 });
    await cardPayment.click();

    // 8. Submit the order
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // 9. In test mode: API bypasses gateway and redirects to /payment/success directly
    //    In real mode with sk_test_*: would redirect to Stripe hosted checkout page
    await expect(page).toHaveURL(/payment\/success|stripe\.com|sandbox\.gopay/, { timeout: 30000 });

    // 10. If we landed on our success page (test mode bypass), verify it shows success
    if (page.url().includes('/payment/success')) {
      await expect(page.locator('body')).toContainText(/objednávk|děkujeme|úspěšn|BUP-/i, { timeout: 15000 });
      console.log(`✅ Payment success page reached: ${page.url()}`);
    } else {
      // Real gateway redirect — just confirm we got to Stripe/GoPay
      console.log(`✅ Redirected to payment gateway: ${page.url()}`);
    }
  });

  // ─── GUEST: Bank transfer (manual) ──────────────────────────────────────────
  test('Guest — complete order via bank transfer', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    // 2. Add product to cart
    const addToCartBtn = page.getByTestId('add-to-cart-hero-btn');
    await addToCartBtn.waitFor({ state: 'visible', timeout: 60000 });
    await addToCartBtn.click();

    // 3. Open cart drawer and go to checkout
    await page.waitForTimeout(800);
    const cartBtn = page.getByTestId('header-cart-btn').filter({ visible: true }).first();
    await cartBtn.click({ force: true });
    const checkoutBtn = page.getByTestId('cart-drawer-checkout-btn');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    // 4. Fill in guest details
    await page.fill('input[name="firstName"]', 'Platba');
    await page.fill('input[name="lastName"]', 'Převodem');
    await page.fill('input[name="email"]', `e2e-transfer-${Date.now()}@test.drinkboostup.cz`);
    await page.fill('input[name="phone"]', '+420 777 000 002');
    await page.fill('input[name="street"]', 'Bankovní');
    await page.fill('input[name="houseNumber"]', '42');
    await page.fill('input[name="city"]', 'Brno');
    await page.fill('input[name="zip"]', '602 00');

    // 5. Select shipping
    const shippingCzPost = page.getByTestId('checkout-shipping-home_delivery');
    if (await shippingCzPost.isVisible()) {
      await shippingCzPost.click();
    }

    // 6. Select bank transfer payment
    const bankPayment = page.getByTestId('checkout-payment-transfer_manual');
    await bankPayment.waitFor({ state: 'visible', timeout: 10000 });
    await bankPayment.click();

    // 7. Submit
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // 8. Bank transfer goes directly to our success page (no external gateway)
    await expect(page).toHaveURL(/payment\/success/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/objednávk|děkujeme|úspěšn|BUP-/i, { timeout: 15000 });

    // Verify the order shows as "pending" (waiting for bank transfer)
    const url = new URL(page.url());
    const status = url.searchParams.get('status');
    expect(status).toBe('pending');
    console.log(`✅ Bank transfer order created, status: pending, URL: ${page.url()}`);
  });

  // ─── Logged-in user: Card payment ────────────────────────────────────────────
  test('Logged-in user — complete order via card payment', async ({ page }) => {
    test.use({ storageState: 'playwright/.auth/customer.json' });

    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    const addToCartBtn = page.getByTestId('add-to-cart-hero-btn');
    await addToCartBtn.waitFor({ state: 'visible', timeout: 60000 });
    await addToCartBtn.click();

    await page.waitForTimeout(800);
    const cartBtn = page.getByTestId('header-cart-btn').filter({ visible: true }).first();
    await cartBtn.click({ force: true });

    const checkoutBtn = page.getByTestId('cart-drawer-checkout-btn');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    // For logged-in users email should be pre-filled
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).not.toBeEmpty({ timeout: 10000 });

    // Ensure address fields have data (may be pre-filled from profile)
    const cityInput = page.locator('input[name="city"]');
    if (await cityInput.inputValue() === '') {
      await page.fill('input[name="street"]', 'Uživatelská');
      await page.fill('input[name="houseNumber"]', '5');
      await page.fill('input[name="city"]', 'Praha');
      await page.fill('input[name="zip"]', '110 00');
    }

    const cardPayment = page.getByTestId('checkout-payment-card');
    await cardPayment.waitFor({ state: 'visible', timeout: 10000 });
    await cardPayment.click();

    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    await expect(page).toHaveURL(/payment\/success|stripe\.com|sandbox\.gopay/, { timeout: 30000 });
    console.log(`✅ Logged-in user payment flow reached: ${page.url()}`);
  });
});
