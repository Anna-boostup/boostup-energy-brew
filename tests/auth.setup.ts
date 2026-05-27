import { test as setup, expect } from './fixtures';
import path from 'path';

const authDir = path.join(import.meta.dirname || '', '../playwright/.auth');

const roles = [
  {
    name: 'admin',
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
    file: 'admin.json'
  },
  {
    name: 'company',
    email: process.env.TEST_COMPANY_EMAIL,
    password: process.env.TEST_COMPANY_PASSWORD,
    file: 'company.json'
  },
  {
    name: 'customer',
    email: process.env.TEST_BASIC_EMAIL,
    password: process.env.TEST_BASIC_PASSWORD,
    file: 'customer.json'
  }
];

for (const role of roles) {
  setup(`authenticate as ${role.name}`, async ({ page }) => {
    if (!role.email || !role.password) {
      console.log(`Skipping setup for ${role.name}: Credentials missing.`);
      return;
    }

    console.log(`Setup: Logging in as ${role.name} (${role.email})`);
    
    // Monitor console messages and failed requests
    page.on('console', msg => {
        if (msg.type() === 'error') console.error(`BROWSER ERROR (${role.name}):`, msg.text());
    });
    page.on('requestfailed', request => {
        console.error(`NETWORK ERROR (${role.name}):`, request.url(), request.failure()?.errorText);
    });

    try {
      await page.goto('/login', { waitUntil: 'load', timeout: 60000 });
      
      // Wait for the app to initialize (global loader to disappear)
      const loader = page.getByTestId('admin-loader');
      if (await loader.isVisible()) {
          console.log(`Setup (${role.name}): Waiting for auth-loading spinner to disappear...`);
          await expect(loader).toBeHidden({ timeout: 30000 });
      }

      // Explicitly wait for the login form and ensure it's interactable
      const emailInput = page.locator('#email');
      await emailInput.waitFor({ state: 'visible', timeout: 30000 });
      
      await emailInput.fill(role.email);
      await page.locator('#password').fill(role.password);
      
      const submitBtn = page.getByTestId('login-submit-btn');
      await expect(submitBtn).toBeEnabled({ timeout: 10000 });
      await submitBtn.click();

      // Check for ANY toast or error message
      const errorToast = page.locator('[role="status"], [role="alert"], .sonner-toast, .toast');
      const isErrorVisible = await errorToast.isVisible({ timeout: 10000 }).catch(() => false);
      if (isErrorVisible) {
          const texts = await errorToast.allInnerTexts();
          console.error(`Setup (${role.name}): Detected potential UI message(s):`, texts.join(' | '));
      }

      // Verify successful login (wait for redirection)
      try {
        // Check for ANY valid logged-in URL
        await expect(page).toHaveURL(/.*account|.*company-account|.*admin/, { timeout: 30000 });
      } catch (err) {
          console.error(`Setup (${role.name}): Redirection check failed. Current URL: ${page.url()}`);
          // Log visible errors again
          const bodyText = await page.innerText('body');
          if (bodyText.includes('Neplatný') || bodyText.includes('heslo') || bodyText.includes('Chyba')) {
              console.error(`Setup (${role.name}): Found error-like text in body!`);
              const visibleError = await page.locator('text=/Neplatný|heslo|Chyba/i').first().innerText().catch(() => 'N/A');
              console.error(`Setup (${role.name}): Specific error found: ${visibleError}`);
          }
          throw err;
      }

      await page.context().storageState({ path: path.join(authDir, role.file) });
      console.log(`Setup: Saved state for ${role.name} to ${role.file}`);
    } catch (error: any) {
      console.error(`Setup FAILED for ${role.name}:`, error.message);
      console.log('DIAGNOSTIC - CURRENT URL:', page.url());
      
      try {
          const html = await page.content();
          console.log('DIAGNOSTIC - HTML Snippet (first 1000 chars):', html.substring(0, 1000));
          
          // Log all visible buttons/inputs to see if we are on the right page
          const inputs = await page.locator('input').all();
          console.log(`DIAGNOSTIC: Found ${inputs.length} inputs on page`);
      } catch (e) {}
      
      throw error;
    }
  });
}
