import { test as setup, expect } from '@playwright/test';
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
    
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    // Wait for the form to be ready
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 30000 });
    
    await page.locator('input[type="email"]').fill(role.email);
    await page.locator('input[type="password"]').fill(role.password);
    await page.getByTestId('login-submit-btn').click();

    // Verify successful login (wait for redirection or profile element)
    if (role.name === 'admin') {
      await expect(page).toHaveURL(/.*admin/, { timeout: 60000 });
    } else {
      await expect(page).toHaveURL(/.*account/, { timeout: 60000 });
    }

    await page.context().storageState({ path: path.join(authDir, role.file) });
    console.log(`Setup: Saved state for ${role.name} to ${role.file}`);
  });
}
