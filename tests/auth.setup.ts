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
    
    try {
      await page.goto('/login', { waitUntil: 'load', timeout: 60000 });
      
      // Wait for the app to initialize (global loader to disappear)
      const loader = page.getByTestId('auth-loading');
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

      // Check for potential error toast immediately after click
      const errorToast = page.locator('.sonner-toast[data-type="error"], .toast-destructive');
      const isErrorVisible = await errorToast.isVisible({ timeout: 5000 }).catch(() => false);
      if (isErrorVisible) {
          const errorMsg = await errorToast.textContent();
          console.error(`Setup (${role.name}): Login failed with UI error: ${errorMsg}`);
      }

      // Verify successful login (wait for redirection)
      if (role.name === 'admin') {
        await expect(page).toHaveURL(/.*admin/, { timeout: 60000 });
      } else if (role.name === 'company') {
        // Company account might go to /company-account or /account depending on profile
        await expect(page).toHaveURL(/.*account/, { timeout: 60000 });
      } else {
        await expect(page).toHaveURL(/.*account/, { timeout: 60000 });
      }

      await page.context().storageState({ path: path.join(authDir, role.file) });
      console.log(`Setup: Saved state for ${role.name} to ${role.file}`);
    } catch (error: any) {
      console.error(`Setup FAILED for ${role.name}:`, error.message);
      console.log('DIAGNOSTIC - CURRENT URL:', page.url());
      
      // Try to take a screenshot if it's a browser error
      try {
          const html = await page.content();
          console.log('DIAGNOSTIC - HTML Snippet (first 1000 chars):', html.substring(0, 1000));
          
          // Check for any visible text that looks like an error
          const bodyText = await page.innerText('body');
          if (bodyText.includes('Neplatný e-mail') || bodyText.includes('heslo')) {
              console.error('DIAGNOSTIC: Detected invalid credentials error text in body');
          }
      } catch (e) {}
      
      throw error;
    }
  });
}
