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
        await page.fill('input[type="email"]', identity.email);
        await page.fill('input[type="password"]', identity.password);
        await page.click('button:has-text("PŘIHLÁSIT SE")');
        
        // Wait for redirect to home or admin
        await page.waitForURL(identity.type === 'admin' ? /.*admin/ : /.*\//, { timeout: 60000 });
      }

      // 2. Add product to cart
      await page.goto('/', { timeout: 60000 });
      const addToCartButton = page.locator('button:has-text("Do košíku")').first();
      await addToCartButton.waitFor({ state: 'visible', timeout: 60000 });
      await addToCartButton.click();

      // 3. Go to checkout
      await page.locator('button:has-text("K pokladně")').click();
      await expect(page).toHaveURL(/.*checkout/);

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
      await page.click('text=Výdejní místo Zásilkovna');
      // Packeta Widget is usually an iframe, for smoke test we just ensure payment methods show up
      
      const gopayButton = page.locator('text=GoPay');
      await gopayButton.click();

      // 6. Submit
      const submitButton = page.locator('button:has-text("Objednat a zaplatit")');
      await expect(submitButton).toBeEnabled();
      
      // We don't actually submit to avoid creating junk orders unless it's a dry run
      // await submitButton.click();
    });
  }
});
