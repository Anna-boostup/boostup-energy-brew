import { test, expect } from './fixtures';

const identities = [
  { 
    name: 'Guest', 
    type: 'guest',
    email: '',
    password: ''
  },
  { 
    name: 'Basic User', 
    type: 'personal',
    email: process.env.TEST_BASIC_EMAIL || 'basic-test@drinkboostup.cz',
    password: process.env.TEST_BASIC_PASSWORD || 'BoostUpBasicTest2026!'
  },
  { 
    name: 'Company User', 
    type: 'company',
    email: process.env.TEST_COMPANY_EMAIL || 'company-test@drinkboostup.cz',
    password: process.env.TEST_COMPANY_PASSWORD || 'BoostUpCompanyTest2026!'
  },
  { 
    name: 'Admin User', 
    type: 'admin',
    email: process.env.TEST_ADMIN_EMAIL || 'admin-test@drinkboostup.cz',
    password: process.env.TEST_ADMIN_PASSWORD || 'BoostUpAdminTest2026!'
  }
];

test.describe('Multi-Identity Checkout Scenarios', () => {
  for (const identity of identities) {
    test(`Purchase flow as ${identity.name}`, async ({ page }, testInfo) => {
      const workerId = testInfo.workerIndex;
      
      // 1. Handle Login if not guest
      if (identity.type !== 'guest') {
        await page.goto('/login', { timeout: 60000 });
        
        // Wait for input to be present to avoid race conditions on slow loads
        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'visible', timeout: 30000 });
        
        await emailInput.fill(identity.email);
        await page.fill('input[type="password"]', identity.password);
        await page.getByTestId('login-submit-btn').click();
        
        try {
          if (identity.type === 'admin') {
            await expect(page).toHaveURL(/.*admin/, { timeout: 15000 });
          } else if (identity.type === 'company') {
            await expect(page).toHaveURL(/.*company-account/, { timeout: 15000 });
          } else {
            await expect(page).toHaveURL(/.*account/, { timeout: 15000 });
          }
        } catch (e) {
          const currentUrl = page.url();
          const toastError = await page.getByRole('alert').or(page.getByRole('status')).innerText({ timeout: 3000 }).catch(() => "No alert visible. Silent crash or timeout?");
          throw new Error(`CRITICAL LOGIN FAILURE at ${currentUrl}: Navigation did not happen. UI Alert displayed: "${toastError}"`);
        }
        
        // 🧪 Stabilization: Wait for everything to settle before going back to Home
        await page.waitForLoadState('load', { timeout: 15000 }).catch(() => console.log('Load state timeout - moving on anyway'));
        // Extra padding for internal redirects to finish
        await page.waitForTimeout(2000);
      }

      // 2. Add product to cart
      // Use domcontentloaded first to be faster, but follow with load check
      await page.goto('/', { waitUntil: 'load', timeout: 60000 });
      const addToCartButton = page.getByTestId('add-to-cart-hero-btn');
      await addToCartButton.waitFor({ state: 'visible', timeout: 60000 });
      await addToCartButton.click();

      // 3. Open the Cart Drawer
      // The drawer does not automatically open upon adding an item; we must manually click the header cart icon.
      const headerCartButton = page.getByTestId('header-cart-btn').filter({ visible: true }).first();
      // Small stabilization wait for cart animation
      await page.waitForTimeout(1000); 
      await headerCartButton.click({ force: true });

      // 4. Go to checkout
      const checkoutBtn = page.getByTestId('cart-drawer-checkout-btn');
      await checkoutBtn.waitFor({ state: 'visible', timeout: 15000 });
      await checkoutBtn.click();
      await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

      // 4. Identity-specific checks on Checkout Page
      if (identity.type !== 'guest') {
        // Verify email is correct
        await expect(page.locator('input[name="email"]')).toHaveValue(identity.email);
        
        // --- ADDRESS UPDATE TEST ---
        // Change address with worker-specific suffix to avoid collision
        const newStreet = `Testovaci W${workerId} ${Math.floor(Math.random() * 1000)}`;
        await page.fill('input[name="street"]', newStreet);
        await page.fill('input[name="city"]', 'Brno');
        await page.fill('input[name="zip"]', '602 00');
        await page.fill('input[name="houseNumber"]', '123/A');
      } else {
        // Guest: Fill everything
        await page.fill('input[name="firstName"]', `GhostW${workerId}`);
        await page.fill('input[name="lastName"]', 'Rider');
        await page.fill('input[name="email"]', `guest-${workerId}-${Date.now()}@example.com`);
        await page.fill('input[name="phone"]', '+420 777123456');
        await page.fill('input[name="street"]', 'Hlavni');
        await page.fill('input[name="houseNumber"]', '1');
        await page.fill('input[name="city"]', 'Praha');
        await page.fill('input[name="zip"]', '110 00');
      }

      if (identity.type === 'company') {
        // Verify B2B fields
        await expect(page.locator('input[name="companyName"]')).toBeVisible();
        await expect(page.locator('input[name="ico"]')).toBeVisible();
        await expect(page.locator('input[name="dic"]')).toBeVisible();
      }

      // 5. Delivery & Payment
      await page.getByTestId('checkout-shipping-zasilkovna').click();
      // Packeta Widget is usually an iframe, for smoke test we just ensure payment methods show up
      
      const gopayButton = page.getByTestId('checkout-payment-card');
      await gopayButton.click();

      // 6. Submit
      const submitButton = page.getByTestId('checkout-submit-btn');
      await expect(submitButton).toBeEnabled();
      
      // We don't actually submit to avoid creating junk orders unless it's a dry run
      // await submitButton.click();
    });
  }
});
