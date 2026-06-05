import { test, expect } from './fixtures';

test('Debug email odesilani and diagnostic error', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]: ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR]: ${err.message}\nStack:\n${err.stack}`);
  });

  // Capture network requests and responses
  page.on('request', req => {
    if (req.url().includes('send-email') || req.url().includes('supabase')) {
      console.log(`[REQ]: ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async res => {
    if (res.url().includes('send-email') || res.url().includes('supabase')) {
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch (e) {
        bodyText = '(could not parse body)';
      }
      console.log(`[RES]: ${res.status()} ${res.url()}\nBody: ${bodyText}`);
    }
  });

  console.log('Navigating to login page...');
  await page.goto('https://test.drinkboostup.cz/login');

  // Wait for login page
  const emailInput = page.locator('#email');
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });

  console.log('Logging in...');
  await emailInput.fill('admin-test@drinkboostup.cz');
  await page.locator('#password').fill('BoostUpAdminTest2026!');
  
  const submitBtn = page.getByTestId('login-submit-btn');
  await submitBtn.click();

  // Wait for admin page redirect
  console.log('Waiting for redirection to admin...');
  await page.waitForURL(/.*admin/, { timeout: 20000 });
  console.log(`Successfully logged in. Current URL: ${page.url()}`);

  console.log('Navigating to email management...');
  await page.goto('https://test.drinkboostup.cz/admin/emails');

  // Wait for email management page to load
  await page.waitForSelector('[data-testid="admin-email-management"]', { timeout: 20000 });
  console.log('Email management loaded.');

  // Find the test email input field and send button
  // Let's locate the input with placeholder "Testovací e-maily oddělené čárkou..." or value
  const testInput = page.locator('input[placeholder*="Testovací e-maily"]');
  await testInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill test email
  await testInput.fill('admin-test@drinkboostup.cz');
  console.log('Filled test email field.');

  // Click the send button (it contains "Odeslat testovací e-mail" or form button)
  const sendBtn = page.locator('button:has-text("Odeslat testovací e-mail")').first();
  console.log('Clicking send test email button...');
  await sendBtn.click();

  // Wait 5 seconds to capture any async console errors or network responses
  await page.waitForTimeout(5000);
  console.log('Done waiting.');
});
