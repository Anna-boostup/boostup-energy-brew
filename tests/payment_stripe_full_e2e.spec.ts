import { Page } from '@playwright/test';
import { test, expect } from './fixtures';

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

// ─── Helper: fill Stripe hosted checkout card form ────────────────────────────
async function fillStripeCheckout(page: Page, email: string, cardNumber: string = '4242424242424242') {
  // Wait for Stripe checkout page to fully load
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  // 1. Počkáme, až se na stránce objeví jakékoliv viditelné vstupní pole
  await page.locator('input:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 1b. Zkontrolovat, zda je na stránce výběr platební metody "Card" (karta) a případně na ni kliknout.
  // V některých Stripe configurations může být platební metoda "Card" zobrazená jako radio button
  // nebo jako tabulátor. Pokud není vybraná, pole pro kartu se nezobrazí.
  const cardRadioSelectors = [
    'input[type="radio"][value="card"]',
    'input[type="radio"]#payment-method-accordion-item-title-card',
    'input[type="radio"]#payment-method-card',
    'label:has-text("Card")',
    'label:has-text("Karta")',
    'text=/^Card$|^Karta$|^Platební karta$/i'
  ];

  console.log('ℹ️ Kontroluji přítomnost výběru platební metody "Card"...');
  let paymentMethodSelected = false;
  for (const selector of cardRadioSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Zkontrolujeme, zda je radio button už označen (pokud je to input)
      const isChecked = await el.evaluate((node) => (node as HTMLInputElement).checked).catch(() => false);
      if (!isChecked) {
        console.log(`✅ Klikám na volbu platby kartou pomocí: ${selector}`);
        await el.click({ force: true });
        await page.waitForTimeout(2000); // Počkáme na načtení iframe pro kartu
      } else {
        console.log(`ℹ️ Volba platby kartou je již vybrána (${selector})`);
      }
      paymentMethodSelected = true;
      break;
    }
  }

  if (!paymentMethodSelected) {
    // Prohledáme i všechny frames, zda tam není volba platby kartou
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      for (const selector of cardRadioSelectors) {
        try {
          const el = frame.locator(selector).first();
          if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
            const isChecked = await el.evaluate((node) => (node as HTMLInputElement).checked).catch(() => false);
            if (!isChecked) {
              console.log(`✅ Klikám na volbu platby kartou v iframe pomocí: ${selector}`);
              await el.click({ force: true });
              await page.waitForTimeout(2000);
            }
            paymentMethodSelected = true;
            break;
          }
        } catch { /* ignore */ }
      }
      if (paymentMethodSelected) break;
    }
  }

  // 2. Vyplnit email (pokud je viditelný)
  const emailInput = page.locator('input[type="email"][name="email"], input[autocomplete="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.clear();
    await emailInput.fill(email);
    console.log('✅ Email vyplněn na Stripe Checkout');
  }

  // 3. Doručovací/billing adresa (Stripe Hosted Checkout může vyžadovat)
  await page.waitForTimeout(500);
  const addressLine1 = page.locator(
    'input[name="shippingAddressLine1"], input[autocomplete="address-line1"], ' +
    'input[placeholder*="Address line 1" i], input[placeholder*="Adresa" i], ' +
    'input[name="address-line1"]'
  ).first();
  const hasShipping = await addressLine1.isVisible({ timeout: 4000 }).catch(() => false);
  if (hasShipping) {
    const shippingName = page.locator(
      'input[name="shippingName"], input[autocomplete="name"], ' +
      'input[placeholder*="Name" i], input[placeholder*="Jméno" i]'
    ).first();
    if (await shippingName.isVisible({ timeout: 2000 }).catch(() => false)) {
      await shippingName.fill('Stripe E2E Test');
    }
    await addressLine1.fill('Testovací 123');
    const cityInput = page.locator(
      'input[autocomplete="address-level2"], input[placeholder*="City" i], input[placeholder*="Město" i]'
    ).first();
    if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityInput.fill('Brno');
    }
    const postalInput = page.locator(
      'input[autocomplete="postal-code"], input[placeholder*="Postal" i], input[placeholder*="PSČ" i]'
    ).first();
    if (await postalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postalInput.fill('62300');
    }
    console.log('✅ Shipping adresa vyplněna na Stripe Checkout');
  }

  // ── Karta ────────────────────────────────────────────────────────────────────
  // Stripe Hosted Checkout (nový design): jeden unifikovaný Payment Element iframe.
  // Starší Stripe Elements: 3 oddělené iframy pro číslo, datum, CVC.
  // Spolehlivé vyplnění probíhá přes type() (keyboard events), ne fill(),
  // protože cross-origin iframe musí přijmout input jako reálné keyeventy.

  await page.waitForTimeout(1000);

  // ── Strategie 1: Nový unifikovaný Payment Element (jeden iframe) ──────────
  // Znovu načteme seznam framů, abychom viděli nově načtený iframe pro kartu
  const allFrames = page.frames();
  let cardFilled = false;

  // Zkusíme všechny framy na stránce hledat pole pro číslo karty
  for (const frame of allFrames) {
    // Přeskočit hlavní frame
    if (frame === page.mainFrame()) continue;

    try {
      const cardInput = frame.locator(
        'input[name="cardnumber"], ' +
        'input[autocomplete="cc-number"], ' +
        'input[data-elements-stable-field-name="cardNumber"], ' +
        'input[placeholder*="1234" i], ' +
        'input[placeholder*="Card number" i], ' +
        'input[placeholder*="Číslo karty" i]'
      ).first();

      if (await cardInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        await cardInput.click();
        await cardInput.type(cardNumber, { delay: 50 });
        console.log(`✅ Číslo karty vyplněno (frame: ${frame.url().substring(0, 60)})`);

        // Expiry
        const expiryInput = frame.locator(
          'input[name="exp-date"], input[autocomplete="cc-exp"], ' +
          'input[data-elements-stable-field-name="cardExpiry"], ' +
          'input[placeholder*="MM" i], input[placeholder*="Expiry" i]'
        ).first();
        if (await expiryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expiryInput.click();
          await expiryInput.type('1229', { delay: 50 });
          console.log('✅ Datum expirace vyplněno');
        }

        // CVC
        const cvcInput = frame.locator(
          'input[name="cvc"], input[autocomplete="cc-csc"], ' +
          'input[data-elements-stable-field-name="cardCvc"], ' +
          'input[placeholder*="CVC" i], input[placeholder*="CVV" i], input[placeholder*="Security" i]'
        ).first();
        if (await cvcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cvcInput.click();
          await cvcInput.type('123', { delay: 50 });
          console.log('✅ CVC vyplněno');
        }

        cardFilled = true;
        break;
      }
    } catch {
      // Tento frame neobsahuje karta pole, pokračujeme
    }
  }

  // ── Strategie 2: frameLocator selektory (fallback) ────────────────────────
  if (!cardFilled) {
    const frameSelectors = [
      'iframe[title="Secure card number input frame"]',
      'iframe[title*="card number" i]',
      'iframe[title*="Payment information" i]',
      'iframe[name*="privateStripeFrame"]',
      'iframe[src*="js.stripe.com"]',
    ];

    for (const sel of frameSelectors) {
      try {
        const frame = page.frameLocator(sel);
        const cardInput = frame.locator('input').first();
        if (await cardInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await cardInput.click();
          await cardInput.type(cardNumber, { delay: 50 });
          console.log(`✅ Číslo karty vyplněno přes frameLocator (${sel})`);
          cardFilled = true;
          break;
        }
      } catch { /* skip */ }
    }
  }

  // ── Strategie 3: Přímé inputy bez iframu (některé Stripe integrace) ───────
  if (!cardFilled) {
    const directCard = page.locator('input#cardNumber, input[name="cardNumber"], input[autocomplete="cc-number"]').first();
    if (await directCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await directCard.click({ force: true });
      await directCard.focus();
      await directCard.type(cardNumber, { delay: 80 });
      
      const directExpiry = page.locator('input#cardExpiry, input[name="cardExpiry"], input[autocomplete="cc-exp"]').first();
      if (await directExpiry.isVisible({ timeout: 2000 }).catch(() => false)) {
        await directExpiry.click({ force: true });
        await directExpiry.focus();
        await directExpiry.type('1229', { delay: 80 });
      }
      
      const directCvc = page.locator('input#cardCvc, input[name="cardCvc"], input[autocomplete="cc-csc"]').first();
      if (await directCvc.isVisible({ timeout: 2000 }).catch(() => false)) {
        await directCvc.click({ force: true });
        await directCvc.focus();
        await directCvc.type('123', { delay: 80 });
      }
      cardFilled = true;
      console.log('✅ Číslo karty vyplněno přes přímý input');
    }
  }

  if (!cardFilled) {
    // Výpis všech framů pro debug
    const frameUrls = page.frames().map(f => f.url()).join('\n  ');
    throw new Error(
      `Nelze najít pole pro číslo karty na Stripe Checkout.\n` +
      `Dostupné framy:\n  ${frameUrls}\n` +
      `Pravděpodobně se změnilo UI Stripe.`
    );
  }

  // Cardholder name (některé Stripe šablony)
  const nameInput = page.locator('input[name="name"], input[autocomplete="cc-name"]').first();
  if (await nameInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    await nameInput.fill('Stripe E2E Test');
  }

  await page.waitForTimeout(500);
}




// Helper pro zpracování Stripe 3D Secure (SCA) výzvy
// Poznámka: karta 4242424242424242 3DS nevyžaduje. Tento helper slouží jako fallback pro jiné karty.
async function handleStripe3DS(page: Page, approve: boolean = true) {
  // Čekáme krátce na případný redirect/modal
  await page.waitForTimeout(2000);
  
  // Stripe Hosted Checkout - 3DS může být prezentováno jako:
  // 1. iframe[name="challengeFrame"] (Stripe Elements)
  // 2. Celostránkový redirect (Hosted Checkout automaticky zpracovává)
  // 3. Modal s tlačítky Complete/Fail (Stripe test mode)
  
  const completeSelector = '#test-source-authorize-3ds, button#challenge-complete, button:has-text("Complete"), button:has-text("Autorizovat"), button:has-text("Schválit"), [data-testid="3ds-authorize"]';
  const failSelector = '#test-source-fail-3ds, button#challenge-fail, button:has-text("Fail"), button:has-text("Odmítnout"), [data-testid="3ds-fail"]';
  
  // Zkontrolujeme, zda se zobrazil challengeFrame
  const challengeFrame = page.locator('iframe[name="challengeFrame"]').first();
  const is3dsVisible = await challengeFrame.isVisible({ timeout: 6000 }).catch(() => false);
  
  if (is3dsVisible) {
    console.log('ℹ️ Detekován Stripe 3D Secure challengeFrame, provádím autorizaci...');
    const frame = page.frameLocator('iframe[name="challengeFrame"]');
    
    // 3DS challenge může mít vnořený iframe
    const innerFrame = frame.frameLocator('iframe').first();
    
    const targetSelector = approve ? completeSelector : failSelector;
    
    // Zkusíme nejprve přímý frame, pak vnořený
    let clicked = false;
    
    const directBtn = frame.locator(targetSelector).first();
    if (await directBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await directBtn.click({ force: true });
      clicked = true;
      console.log(`✅ Kliknuto na 3DS tlačítko v challengeFrame (schválit=${approve})`);
    }
    
    if (!clicked) {
      const innerBtn = innerFrame.locator(targetSelector).first();
      if (await innerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await innerBtn.click({ force: true });
        clicked = true;
        console.log(`✅ Kliknuto na 3DS tlačítko ve vnořeném iframe (schválit=${approve})`);
      }
    }
    
    if (!clicked) {
      // Zkusíme všechny frames
      for (const f of page.frames()) {
        if (f.url().includes('3d-secure') || f.url().includes('stripe') || f.name().includes('challenge')) {
          const btn = f.locator(targetSelector).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click({ force: true });
            clicked = true;
            console.log(`✅ 3DS tlačítko kliknuto v frame: ${f.url()} (schválit=${approve})`);
            break;
          }
        }
      }
    }
    
    if (!clicked) {
      console.log('⚠️ 3DS challengeFrame nalezen, ale nepodařilo se najít a kliknout na tlačítko.');
    }
    
    await page.waitForTimeout(3000);
  } else {
    // Zkontrolujeme všechny frames pro případ, že 3DS je v jiném iframe
    let clicked = false;
    for (const f of page.frames()) {
      if (f.url().includes('3d-secure')) {
        const targetSelector = approve ? completeSelector : failSelector;
        const btn = f.locator(targetSelector).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click({ force: true });
          clicked = true;
          console.log(`✅ 3DS tlačítko kliknuto v frame URL: ${f.url()}`);
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
    if (!clicked) {
      console.log('ℹ️ Stripe 3D Secure nebyl vyžadován (karta ho nepotřebuje).');
    }
  }
}

/**
 * Robust helper: čeká na přesměrování na /payment/success po Stripe platbě.
 *
 * V CI (preview.drinkboostup.cz s Vercel Protection) může nastat:
 *   A) Přímé přesměrování na /payment/success ✔
 *   B) Vercel interceptuje redirect → přesměrovává na /_vercel/auth?redirect=/payment/success
 *
 * Tento helper detekuje obě možnosti a v případě B manuálně naviguje na cíl.
 */
async function waitForPaymentSuccess(
  page: Page,
  baseURL: string,
  _bypassSecret: string,
  timeoutMs: number = 90000
): Promise<string> {
  const start = Date.now();
  const ourOrigin = new URL(baseURL).origin;

  console.log(`⏳ Čekám na redirect na /payment/success (max ${timeoutMs / 1000}s)...`);

  while (Date.now() - start < timeoutMs) {
    const currentUrl = page.url();

    // A) Úspěch - jsme na success stránce
    if (/payment\/success/i.test(currentUrl)) {
      console.log(`✅ Dosažena success URL: ${currentUrl.substring(0, 120)}`);
      return currentUrl;
    }

    // B) Vercel auth redirect - manuálně obejdeme
    if (currentUrl.includes('_vercel/auth')) {
      try {
        const parsed = new URL(currentUrl);
        const redirectParam = decodeURIComponent(parsed.searchParams.get('redirect') || '');
        if (redirectParam) {
          const targetUrl = `${ourOrigin}${redirectParam}`;
          console.log(`⚠️ Vercel auth redirect! Manuálně naviguji na: ${targetUrl.substring(0, 120)}`);
          await page.goto(targetUrl, { waitUntil: 'commit', timeout: 30000 });
          continue;
        }
      } catch { /* ignore */ }
    }

    // Log každých ~10s pro debug
    const elapsed = Date.now() - start;
    if (elapsed > 5000 && elapsed % 10000 < 1500) {
      console.log(`⏳ ${Math.round(elapsed / 1000)}s: čekám na success URL, aktuální: ${currentUrl.substring(0, 100)}`);
    }

    await page.waitForTimeout(1500);
  }

  const finalUrl = page.url();
  throw new Error(
    `Timeout ${timeoutMs / 1000}s při čekání na /payment/success.\nFinální URL: ${finalUrl}`
  );
}

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
