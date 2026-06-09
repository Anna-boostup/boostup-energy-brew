import { test as setup, expect } from './fixtures';
import path from 'path';

const authDir = path.join(import.meta.dirname || '', '../playwright/.auth');

setup('authenticate as company', async ({ page }) => {
  const email = process.env.TEST_COMPANY_EMAIL?.trim();
  const password = process.env.TEST_COMPANY_PASSWORD?.trim();

  if (!email || !password) {
    console.log('Skipping setup for company: Credentials missing.');
    return;
  }

  console.log(`Setup: Logging in as company (${email})`);
  
  page.on('console', msg => {
      if (msg.type() === 'error') console.error('BROWSER ERROR (company):', msg.text());
  });
  page.on('requestfailed', request => {
      console.error('NETWORK ERROR (company):', request.url(), request.failure()?.errorText);
  });
  page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('supabase')) {
          console.error('SUPABASE ERROR (company): ', response.url(), response.status(), response.statusText());
      }
  });


  try {
    await page.goto('/login', { waitUntil: 'load', timeout: 60000 });
    
    const loader = page.getByTestId('admin-loader');
    if (await loader.isVisible()) {
        console.log('Setup (company): Waiting for auth-loading spinner to disappear...');
        await expect(loader).toBeHidden({ timeout: 30000 });
    }

    const emailInput = page.locator('#email');
    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    
    await expect(async () => {
      await emailInput.fill(email);
      await expect(emailInput).toHaveValue(email, { timeout: 1000 });
    }).toPass({ timeout: 15000 });

    const passwordInput = page.locator('#password');
    await expect(async () => {
      await passwordInput.fill(password);
      await expect(passwordInput).toHaveValue(password, { timeout: 1000 });
    }).toPass({ timeout: 10000 });
    
    const submitBtn = page.getByTestId('login-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    const errorToast = page.locator('[role="status"], [role="alert"], .sonner-toast, .toast');
    const isErrorVisible = await errorToast.isVisible({ timeout: 10000 }).catch(() => false);
    if (isErrorVisible) {
        const texts = await errorToast.allInnerTexts();
        console.error('Setup (company): Detected potential UI message(s):', texts.join(' | '));
    }

    try {
      await expect(page).toHaveURL(/.*account|.*company-account|.*admin/, { timeout: 30000 });
    } catch (err) {
        console.error(`Setup (company): Redirection check failed. Current URL: ${page.url()}`);
        const bodyText = await page.innerText('body');
        if (bodyText.includes('Neplatný') || bodyText.includes('heslo') || bodyText.includes('Chyba')) {
            console.error('Setup (company): Found error-like text in body!');
            const visibleError = await page.locator('text=/Neplatný|heslo|Chyba/i').first().innerText().catch(() => 'N/A');
            console.error(`Setup (company): Specific error found: ${visibleError}`);
        }
        throw err;
    }

    await page.context().storageState({ path: path.join(authDir, 'company.json') });
    console.log('Setup: Saved state for company to company.json');
  } catch (error: any) {
    console.error('Setup FAILED for company:', error.message);
    console.log('DIAGNOSTIC - CURRENT URL:', page.url());
    throw error;
  }
});
