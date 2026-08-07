import { test, expect } from './fixtures';
import { fillStripeCheckout, handleStripe3DS, waitForPaymentSuccess } from './helpers/stripe-checkout';

/**
 * FULL E2E Stripe Payment Test
 *
 * Tento test projde celým platebním řetězcem:
 *   Košík → Checkout → Stripe hosted checkout → Platba testovací kartou
 *   → Stripe webhook → Objednávka označena jako zaplacená → /payment/success
 *
 * PREREKVIZITY (nastavit ve Vercelu pro Preview prostředí):
 *   IS_TEST_MODE = false      ← vypnout bypass
 *   STRIPE_SECRET_KEY = sk_test_...  ← testovací klíč ze Stripe Dashboard
 *   STRIPE_WEBHOOK_SECRET = whsec_...  ← tajný klíč webhooku pro test.drinkboostup.cz
 *
 * Spuštění:
 *   STRIPE_FULL_E2E=true PLAYWRIGHT_TEST_BASE_URL=https://test.drinkboostup.cz \
 *     npx playwright test --project=payment-e2e-stripe
 *
 * Testovací karta Stripe (neprovede reálnou platbu):
 *   Číslo: 4242 4242 4242 4242
 *   Datum: 12/29
 *   CVC:   123
 */

const RUN = process.env.STRIPE_FULL_E2E === 'true';

// ─── Tests ────────────────────────────────────────────────────────────────────
test.describe('Full Stripe E2E — Real Gateway + Webhook', () => {

  test.beforeEach(async () => {
    if (!RUN) {
      test.skip(true, [
        'Přeskočeno. Pro spuštění nastav:',
        '  STRIPE_FULL_E2E=true',
        '  IS_TEST_MODE=false (ve Vercelu pro Preview)',
        '  STRIPE_SECRET_KEY=sk_test_... (ve Vercelu pro Preview)',
        '  STRIPE_WEBHOOK_SECRET=whsec_... (pro test.drinkboostup.cz)',
      ].join('\n'));
    }
  });

  // ── Test 1: Úspěšná platba testovací kartou ──────────────────────────────────
  test('Úspěšná platba — karta 4000 (Stripe Test Mode)', async ({ page }) => {
    const testEmail = `stripe-e2e-${Date.now()}@test.drinkboostup.cz`;
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
    const ourOrigin = new URL(baseURL).origin;

    // Přidat nav loggér pro diagnostiku v CI
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (!url.startsWith('data:') && url !== 'about:blank') {
          console.log(`📍 Navigace: ${url.substring(0, 130)}`);
        }
      }
    });

    // 1. Přidat do košíku (VYBRAT PŘEDPLATNÉ, ABY SE AKTIVOVAL STRIPE)
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    
    // Klikneme na tlačítko "Předplatné" (podporuje jak nasazenou verzi pomocí textu, tak lokální s test-id)
    const subBtn = page.locator('button:has-text("Předplatné"), button[data-testid="purchase-type-subscription"]').first();
    await subBtn.waitFor({ state: 'visible', timeout: 30000 });
    
    // Klikneme na tlačítko a ověříme výběr (třída bg-amber-500) – řeší případnou pomalou hydrataci Reactu
    await expect(async () => {
      await subBtn.click();
      await expect(subBtn).toHaveClass(/bg-amber-500/, { timeout: 2000 });
    }).toPass({
      intervals: [1000, 2000],
      timeout: 15000
    });
    await page.waitForTimeout(500); // Nechat chvíli na přerenderování

    const addBtn = page.getByTestId('add-to-cart-hero-btn');
    await addBtn.waitFor({ state: 'visible', timeout: 60000 });
    await addBtn.click();

    // 2. Otevřít košík a přejít na checkout
    await page.waitForTimeout(800);
    await page.getByTestId('header-cart-btn').filter({ visible: true }).first().click({ force: true });
    await page.getByTestId('cart-drawer-checkout-btn').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('cart-drawer-checkout-btn').click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    // 3. Vyplnit údaje
    await page.fill('input[name="firstName"]', 'Stripe');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+420 777 000 042');
    await page.fill('input[name="street"]', 'Testovací');
    await page.fill('input[name="houseNumber"]', '42');
    await page.fill('input[name="city"]', 'Praha');
    await page.fill('input[name="zip"]', '110 00');

    // 4. Vybrat dopravu
    const homeDelivery = page.getByTestId('checkout-shipping-home_delivery');
    const zasilkovna = page.getByTestId('checkout-shipping-zasilkovna');
    if (await homeDelivery.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homeDelivery.click();
    } else {
      await zasilkovna.click();
    }

    // 5. Vybrat platbu kartou
    await page.getByTestId('checkout-payment-card').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('checkout-payment-card').click();

    // 6. Odeslat objednávku → přesměrování na Stripe
    await page.getByTestId('checkout-terms').click(); // souhlas s VOP (povinné)
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    // Zachytit URL Stripe po přesměrování
    const [stripeResponse] = await Promise.all([
      page.waitForURL(/checkout\.stripe\.com|stripe\.com\/pay/, { timeout: 30000 }),
      submitBtn.click(),
    ]);

    console.log(`✅ Přesměrováno na Stripe: ${page.url()}`);

    // 7. Vyplnit platební formulář na Stripe
    await fillStripeCheckout(page, testEmail);

    // 8. Odeslat platbu na Stripe
    const stripePayBtn = page.locator(
      'button[type="submit"]:has-text("Pay"), ' +
      'button[type="submit"]:has-text("Zaplatit"), ' +
      'button[type="submit"]:has-text("Confirm"), ' +
      'button[type="submit"]:has-text("Subscribe"), ' +
      'button[type="submit"]:has-text("Předplatit"), ' +
      '[data-testid="hosted-payment-submit-button"], ' +
      'button.SubmitButton'
    ).first();
    await expect(stripePayBtn).toBeEnabled({ timeout: 15000 });
    console.log('ℹ️ Klikám na Pay tlačítko na Stripe...');
    await stripePayBtn.click();
    console.log('ℹ️ Pay tlačítko kliknuto, čekám na zpracování...');

    // 8b. Ošetřit případný 3D Secure modal (potvrdit pro úspěšnou platbu)
    await handleStripe3DS(page, true);

    // 9. Počkat na přesměrování zpět na náš web
    // Používáme vlastní helper, který detekuje i případ, kdy Vercel Protection zachytí redirect
    const successUrl = await waitForPaymentSuccess(page, baseURL, bypassSecret, 90000);
    // Po dosažení URL počkáme na plné načtení stránky
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    console.log(`✅ Platba úspěšná, URL: ${page.url()}`);

    // 9b. Počkat, až zmizí React Suspense spinner (lazy-load bundle)
    // Spinner se zobrazuje dokud se nenačte JS chunk pro PaymentSuccess stránku
    const spinner = page.locator('[data-testid="admin-loader"]');
    if (await spinner.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⏳ Čekám na zmizení loadovacího spinneru...');
      await expect(spinner).toBeHidden({ timeout: 30000 });
      console.log('✅ Spinner zmizel, stránka načtena.');
    }

    // 10. Ověřit obsah success stránky
    await expect(page.locator('body')).toContainText(/děkujeme|úspěšn|BUP-/i, { timeout: 15000 });

    const url = new URL(page.url());
    const orderNumber = url.searchParams.get('orderNumber');
    expect(orderNumber).toBeTruthy();
    console.log(`✅ Číslo objednávky: ${orderNumber}`);

    // 11. Počkat na webhook (Stripe volá náš server asynchronně, typicky do 5s)
    await page.waitForTimeout(6000);

    // 12. Ověřit objednávku v adminu (použijeme nový context s admin session, protože hlavní test běží jako guest)
    const adminContext = await page.context().browser().newContext({
      storageState: 'playwright/.auth/admin.json'
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/admin/orders', { waitUntil: 'load', timeout: 30000 });
    const shortOrderNumber = orderNumber.substring(0, 12);
    await expect(adminPage.locator(`text=${shortOrderNumber}`).first()).toBeVisible({ timeout: 20000 });
    console.log(`✅ Objednávka ${orderNumber} (zkráceně ${shortOrderNumber}) nalezena v administraci`);
    await adminContext.close();
  });

  // ── Test 2: Zamítnutá karta ──────────────────────────────────────────────────
  test('Zamítnutá platba — karta 4000 0000 0000 9995', async ({ page }) => {
    const testEmail = `stripe-fail-${Date.now()}@test.drinkboostup.cz`;
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

    // VYBRAT PŘEDPLATNÉ, ABY SE AKTIVOVAL STRIPE
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    
    // Vybereme tlačítko předplatného (podporuje jak nasazenou verzi pomocí textu, tak lokální s test-id)
    const subBtn = page.locator('button:has-text("Předplatné"), button[data-testid="purchase-type-subscription"]').first();
    await subBtn.waitFor({ state: 'visible', timeout: 30000 });
    
    // Klikneme na tlačítko a ověříme výběr (třída bg-amber-500) – řeší případnou pomalou hydrataci Reactu
    await expect(async () => {
      await subBtn.click();
      await expect(subBtn).toHaveClass(/bg-amber-500/, { timeout: 2000 });
    }).toPass({
      intervals: [1000, 2000],
      timeout: 15000
    });
    await page.waitForTimeout(500);

    await page.getByTestId('add-to-cart-hero-btn').waitFor({ state: 'visible', timeout: 60000 });
    await page.getByTestId('add-to-cart-hero-btn').click();

    await page.waitForTimeout(800);
    await page.getByTestId('header-cart-btn').filter({ visible: true }).first().click({ force: true });
    await page.getByTestId('cart-drawer-checkout-btn').click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    await page.fill('input[name="firstName"]', 'Decline');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+420 777 000 000');
    await page.fill('input[name="street"]', 'Zamítnutá');
    await page.fill('input[name="houseNumber"]', '1');
    await page.fill('input[name="city"]', 'Praha');
    await page.fill('input[name="zip"]', '110 00');

    // Vybrat dopravu (stejně jako v Test 1)
    const homeDelivery2 = page.getByTestId('checkout-shipping-home_delivery');
    const zasilkovna2 = page.getByTestId('checkout-shipping-zasilkovna');
    if (await homeDelivery2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homeDelivery2.click();
    } else {
      await zasilkovna2.click();
    }

    await page.getByTestId('checkout-payment-card').click();
    await page.getByTestId('checkout-terms').click(); // souhlas s VOP (povinné)
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    await Promise.all([
      page.waitForURL(/checkout\.stripe\.com|stripe\.com\/pay/, { timeout: 30000 }),
      submitBtn.click(),
    ]);

    // Vyplnit zamítnutou kartu přímo přes naši upravenou helper funkci (použijeme kartu s nedostatečnými prostředky)
    await fillStripeCheckout(page, testEmail, '4000000000009995');

    const stripePayBtn = page.locator(
      'button[type="submit"]:has-text("Pay"), ' +
      'button[type="submit"]:has-text("Zaplatit"), ' +
      'button[type="submit"]:has-text("Subscribe"), ' +
      'button[type="submit"]:has-text("Předplatit"), ' +
      '[data-testid="hosted-payment-submit-button"]'
    ).first();
    await stripePayBtn.click();

    // Ošetřit případný 3D Secure modal (zamítnout autorizaci)
    await handleStripe3DS(page, false);

    // Ověřit, že Stripe zobrazí chybovou hlášku (platba zamítnuta)
    // Stripe Hosted Checkout zobrazuje chyby v:
    //   - p.p-ErrorMessage (starší Stripe UI)
    //   - div[data-testid="error-message"]
    //   - [class*="Error"] (případné třídy)
    //   - text včetně textu declined/insufficient/card
    // Pro nejspolehlivejší detekci kombinujeme selektory OR
    const stripeErrorLocator = page.locator([
      'p.p-ErrorMessage',
      '[data-testid="error-message"]',
      '[class*="ErrorMessage"]',
      '[class*="error-message"]',
      'div[role="alert"]',
      // Fallback: jakýkoliv viditellný text o chybě platby
      'text=/declined|insufficient|zamit|zamítnut|náž|card.*error|Your card/i',
    ].join(', '));
    
    // Karta 4000 0000 0000 9995 = insufficient funds
    // Stripe může: (a) zobrazit chybu inline, (b) přesměrovat na cancel_url
    // Ověříme obě možnosti
    const errorOrRedirect = await Promise.race([
      stripeErrorLocator.first().waitFor({ state: 'visible', timeout: 35000 })
        .then(() => 'error')
        .catch(() => 'timeout'),
      page.waitForURL(/kosik|cancel|payment\/fail/, { timeout: 35000 })
        .then(() => 'redirected')
        .catch(() => 'timeout'),
    ]);

    if (errorOrRedirect === 'error') {
      const errorText = await stripeErrorLocator.first().textContent().catch(() => '(text unavailable)');
      console.log(`✅ Zamítnutá karta správně zobrazila chybu: "${errorText}"`);
    } else if (errorOrRedirect === 'redirected') {
      console.log(`✅ Zamítnutá karta způsobila přesměrování na: ${page.url()}`);
    } else {
      // Jako poslední možnost zkontřolujeme, zda nejsme na Stripe URL se zobrazenu chybou
      const currentUrl = page.url();
      const pageText = await page.locator('body').textContent().catch(() => '');
      const hasError = /declined|insufficient|zamit|zamítnutá|Your card/i.test(pageText || '');
      if (hasError) {
        console.log(`✅ Zamítnutá karta zobrazila chybu v body (URL: ${currentUrl})`);
      } else {
        // Tvrdd assert - pokud žádná z možností nenastala, test selže
        throw new Error(`Zamítnutá karta nezobrazila očekávanou chybu. URL: ${currentUrl}\nBody: ${(pageText || '').substring(0, 500)}`);
      }
    }
  });
});
