import { test, expect, Page } from '@playwright/test';
import { test as boostupTest } from './fixtures';

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
async function fillStripeCheckout(page: Page, email: string) {
  // Wait for Stripe checkout page to fully load
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  // Email field — Stripe pre-fills if passed in session, but may show an input
  const emailInput = page.locator('input[type="email"][name="email"], input[autocomplete="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.clear();
    await emailInput.fill(email);
  }

  // ── Card number ──────────────────────────────────────────────────────────────
  // Stripe uses iframes for PCI compliance. Try both new and legacy selector patterns.
  const cardFrameSelectors = [
    'iframe[title="Secure card number input frame"]',
    'iframe[name="__privateStripeFrame5"]',
    'iframe[src*="js.stripe.com"][src*="card-number"]',
  ];

  let cardFilled = false;
  for (const sel of cardFrameSelectors) {
    const frame = page.frameLocator(sel);
    const input = frame.locator('input[name="cardnumber"], input[autocomplete="cc-number"], input[data-elements-stable-field-name="cardNumber"]');
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('4242424242424242');
      cardFilled = true;
      break;
    }
  }

  // Fallback: Stripe's newer unified checkout might have direct inputs
  if (!cardFilled) {
    const directCardInput = page.locator('[data-testid="card-number-input"], input[name="cardNumber"]');
    if (await directCardInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await directCardInput.fill('4242424242424242');
      cardFilled = true;
    }
  }

  if (!cardFilled) {
    throw new Error('Could not find Stripe card number input. The Stripe checkout UI may have changed.');
  }

  // ── Expiry ───────────────────────────────────────────────────────────────────
  const expiryFrameSelectors = [
    'iframe[title="Secure expiration date input frame"]',
    'iframe[name="__privateStripeFrame6"]',
    'iframe[src*="js.stripe.com"][src*="card-expiry"]',
  ];
  for (const sel of expiryFrameSelectors) {
    const frame = page.frameLocator(sel);
    const input = frame.locator('input[name="exp-date"], input[autocomplete="cc-exp"], input[data-elements-stable-field-name="cardExpiry"]');
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('1229');
      break;
    }
  }

  // ── CVC ──────────────────────────────────────────────────────────────────────
  const cvcFrameSelectors = [
    'iframe[title="Secure CVC input frame"]',
    'iframe[name="__privateStripeFrame7"]',
    'iframe[src*="js.stripe.com"][src*="card-cvc"]',
  ];
  for (const sel of cvcFrameSelectors) {
    const frame = page.frameLocator(sel);
    const input = frame.locator('input[name="cvc"], input[autocomplete="cc-csc"], input[data-elements-stable-field-name="cardCvc"]');
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('123');
      break;
    }
  }

  // ── Cardholder name (some Stripe themes show this) ────────────────────────────
  const nameInput = page.locator('input[name="name"], input[autocomplete="cc-name"], input[placeholder*="jmén" i], input[placeholder*="name" i]').first();
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill('Stripe E2E Test');
  }

  // ── Billing postal code (US Stripe forms may ask) ────────────────────────────
  const postalInput = page.locator('input[name="postal"], input[autocomplete="postal-code"]').first();
  if (await postalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await postalInput.fill('11000');
  }
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
  boostupTest('Úspěšná platba — karta 4242 (Stripe Test Mode)', async ({ page }) => {
    const testEmail = `stripe-e2e-${Date.now()}@test.drinkboostup.cz`;

    // 1. Přidat do košíku
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
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
      '[data-testid="hosted-payment-submit-button"], ' +
      'button.SubmitButton'
    ).first();
    await expect(stripePayBtn).toBeEnabled({ timeout: 15000 });
    await stripePayBtn.click();

    // 9. Počkat na přesměrování zpět na náš web
    await page.waitForURL(/drinkboostup\.cz.*payment\/success/, { timeout: 60000 });
    console.log(`✅ Platba úspěšná, URL: ${page.url()}`);

    // 10. Ověřit obsah success stránky
    await expect(page.locator('body')).toContainText(/děkujeme|úspěšn|BUP-/i, { timeout: 15000 });

    const url = new URL(page.url());
    const orderNumber = url.searchParams.get('orderNumber');
    expect(orderNumber).toBeTruthy();
    console.log(`✅ Číslo objednávky: ${orderNumber}`);

    // 11. Počkat na webhook (Stripe volá náš server asynchronně, typicky do 5s)
    await page.waitForTimeout(6000);

    // 12. Ověřit objednávku v adminu
    await page.goto('/admin/orders', { waitUntil: 'load', timeout: 30000 });
    await expect(page.locator(`text=${orderNumber}`)).toBeVisible({ timeout: 15000 });
    console.log(`✅ Objednávka ${orderNumber} nalezena v administraci`);
  });

  // ── Test 2: Zamítnutá karta ──────────────────────────────────────────────────
  boostupTest('Zamítnutá platba — karta 4000 0000 0000 0002', async ({ page }) => {
    const testEmail = `stripe-fail-${Date.now()}@test.drinkboostup.cz`;

    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
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

    await page.getByTestId('checkout-payment-card').click();
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    await Promise.all([
      page.waitForURL(/checkout\.stripe\.com|stripe\.com\/pay/, { timeout: 30000 }),
      submitBtn.click(),
    ]);

    // Vyplnit zamítnutou kartu
    await fillStripeCheckout(page, testEmail);

    // Přepsat číslo karty zamítnutou kartou
    const cardFrameSelectors = [
      'iframe[title="Secure card number input frame"]',
      'iframe[name="__privateStripeFrame5"]',
    ];
    for (const sel of cardFrameSelectors) {
      const frame = page.frameLocator(sel);
      const input = frame.locator('input[name="cardnumber"], input[autocomplete="cc-number"]');
      if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
        await input.fill('4000000000000002'); // Vždy zamítnutá karta
        break;
      }
    }

    const stripePayBtn = page.locator(
      'button[type="submit"]:has-text("Pay"), ' +
      'button[type="submit"]:has-text("Zaplatit"), ' +
      '[data-testid="hosted-payment-submit-button"]'
    ).first();
    await stripePayBtn.click();

    // Ověřit, že Stripe zobrazí chybovou hlášku (platba zamítnuta)
    await expect(
      page.locator('text=/Your card was declined|Platba zamítnuta|declined/i')
    ).toBeVisible({ timeout: 30000 });

    console.log('✅ Zamítnutá karta správně zobrazila chybu na Stripe stránce');
  });
});
