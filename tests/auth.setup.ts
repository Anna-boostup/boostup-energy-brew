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
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for the app to initialize (global loader to disappear)
      const loader = page.getByTestId('auth-loading');
      if (await loader.isVisible()) {
          console.log('Setup: Waiting for auth-loading spinner to disappear...');
          await expect(loader).toBeHidden({ timeout: 30000 });
      }

      // Explicitly wait for the login form
      const emailInput = page.locator('#email');
      await expect(emailInput).toBeVisible({ timeout: 30000 });
      
      await emailInput.fill(role.email);
      await page.locator('#password').fill(role.password);
      await page.getByTestId('login-submit-btn').click();

      // Verify successful login (wait for redirection or profile element)
      if (role.name === 'admin') {
        await expect(page).toHaveURL(/.*admin/, { timeout: 60000 });
      } else {
        await expect(page).toHaveURL(/.*account/, { timeout: 60000 });
      }

      await page.context().storageState({ path: path.join(authDir, role.file) });
      console.log(`Setup: Saved state for ${role.name} to ${role.file}`);
    } catch (error: any) {
      console.error(`Setup FAILED for ${role.name}:`, error.message);
      console.log('DIAGNOSTIC - URL:', page.url());
      const html = await page.content();
      console.log('DIAGNOSTIC - HTML Snippet:', html.substring(0, 1000));
      // Save full HTML to a file if possible within the runner (it will show in logs)
      throw error;
    }
  });
}
