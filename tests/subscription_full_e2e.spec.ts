import { test, expect } from './fixtures';
import { fillStripeCheckout, handleStripe3DS, waitForPaymentSuccess } from './helpers/stripe-checkout';

/**
 * FULL E2E předplatné — reálný Stripe + webhook + zrušení
 *
 * Projde celý životní cyklus:
 *   Košík (Předplatné) → Checkout → Stripe hosted checkout → platba kartou 4242
 *   → webhook vytvoří záznam v `subscriptions` → ověření v /admin/subscriptions
 *   → zrušení přes veřejnou stránku /zruseni-predplatneho → ověření stavu v adminu
 *
 * PREREKVIZITY (Vercel, Preview prostředí):
 *   IS_TEST_MODE = false
 *   STRIPE_SECRET_KEY = sk_test_...
 *   STRIPE_WEBHOOK_SECRET = whsec_...  (pro endpoint, kam Stripe posílá — www.test.*)
 *
 * Spuštění:
 *   SUBSCRIPTION_FULL_E2E=true PLAYWRIGHT_TEST_BASE_URL=https://preview.drinkboostup.cz \
 *     npx playwright test --project=subscription-full-e2e
 *
 * Testovací karta Stripe: 4242 4242 4242 4242, 12/29, CVC 123
 */

const RUN = process.env.SUBSCRIPTION_FULL_E2E === 'true';

test.describe('Full Subscription E2E — nákup + zrušení', () => {
  test.beforeEach(async () => {
    if (!RUN) {
      test.skip(true, [
        'Přeskočeno. Pro spuštění nastav:',
        '  SUBSCRIPTION_FULL_E2E=true',
        '  IS_TEST_MODE=false (Vercel Preview)',
        '  STRIPE_SECRET_KEY=sk_test_... (Vercel Preview)',
        '  STRIPE_WEBHOOK_SECRET=whsec_... (pro endpoint, kam Stripe volá)',
      ].join('\n'));
    }
  });

  test('Nákup předplatného → záznam vznikne → zrušení ke konci období', async ({ page }) => {
    const testEmail = `sub-e2e-${Date.now()}@test.drinkboostup.cz`;
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (!url.startsWith('data:') && url !== 'about:blank') {
          console.log(`📍 Navigace: ${url.substring(0, 130)}`);
        }
      }
    });

    // ─── 1. Vybrat PŘEDPLATNÉ a přidat do košíku ─────────────────────────────
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });

    const subBtn = page.locator('button:has-text("Předplatné"), button[data-testid="purchase-type-subscription"]').first();
    await subBtn.waitFor({ state: 'visible', timeout: 30000 });
    await expect(async () => {
      await subBtn.click();
      await expect(subBtn).toHaveClass(/bg-amber-500/, { timeout: 2000 });
    }).toPass({ intervals: [1000, 2000], timeout: 15000 });
    await page.waitForTimeout(500);

    const addBtn = page.getByTestId('add-to-cart-hero-btn');
    await addBtn.waitFor({ state: 'visible', timeout: 60000 });
    await addBtn.click();

    // ─── 2. Košík → checkout ─────────────────────────────────────────────────
    await page.waitForTimeout(800);
    await page.getByTestId('header-cart-btn').filter({ visible: true }).first().click({ force: true });
    await page.getByTestId('cart-drawer-checkout-btn').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByTestId('cart-drawer-checkout-btn').click();
    await expect(page).toHaveURL(/.*checkout/, { timeout: 30000 });

    // ─── 3. Vyplnit údaje ────────────────────────────────────────────────────
    await page.fill('input[name="firstName"]', 'Sub');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+420 777 000 043');
    await page.fill('input[name="street"]', 'Testovací');
    await page.fill('input[name="houseNumber"]', '42');
    await page.fill('input[name="city"]', 'Praha');
    await page.fill('input[name="zip"]', '110 00');

    // ─── 4. Doprava ──────────────────────────────────────────────────────────
    const homeDelivery = page.getByTestId('checkout-shipping-home_delivery');
    const zasilkovna = page.getByTestId('checkout-shipping-zasilkovna');
    if (await homeDelivery.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homeDelivery.click();
    } else {
      await zasilkovna.click();
    }

    // ─── 5. Platba kartou (aktivuje Stripe) ──────────────────────────────────
    await page.getByTestId('checkout-payment-card').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('checkout-payment-card').click();

    // ─── 6. Odeslat → Stripe hosted checkout ─────────────────────────────────
    await page.getByTestId('checkout-terms').click(); // souhlas s VOP (povinné)
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await Promise.all([
      page.waitForURL(/checkout\.stripe\.com|stripe\.com\/pay/, { timeout: 30000 }),
      submitBtn.click(),
    ]);
    console.log(`✅ Přesměrováno na Stripe: ${page.url().substring(0, 80)}`);

    // ─── 7. Vyplnit + potvrdit platbu na Stripe ──────────────────────────────
    await fillStripeCheckout(page, testEmail);
    const stripePayBtn = page.locator([
      'button[type="submit"]:has-text("Pay")',
      'button[type="submit"]:has-text("Zaplatit")',
      'button[type="submit"]:has-text("Subscribe")',
      'button[type="submit"]:has-text("Předplatit")',
      'button[type="submit"]:has-text("Confirm")',
      '[data-testid="hosted-payment-submit-button"]',
      'button.SubmitButton',
    ].join(', ')).first();
    await expect(stripePayBtn).toBeEnabled({ timeout: 15000 });
    await stripePayBtn.click();
    await handleStripe3DS(page, true);

    // ─── 8. Zpět na /payment/success ─────────────────────────────────────────
    await waitForPaymentSuccess(page, baseURL, bypassSecret, 90000);
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    const orderNumber = new URL(page.url()).searchParams.get('orderNumber');
    expect(orderNumber, 'orderNumber musí být v success URL').toBeTruthy();
    console.log(`✅ Objednávka předplatného: ${orderNumber}`);

    // ─── 9. Počkat na webhook (checkout.session.completed → vytvoření předplatného) ──
    await page.waitForTimeout(8000);

    // ─── 10. Ověřit vznik záznamu + zrušit přes service-role API (deterministicky) ──
    // Voláme /api/subscription-cancel-public napřímo (běží pod service-role → obchází RLS,
    // předplatné patří zákazníkovi). Žádné UI = žádná flaky pole/tlačítka.
    // page.request neprochází page.route, takže Vercel bypass hlavičku přidáváme ručně
    // (bypassSecret je deklarovaný výše u waitForPaymentSuccess).
    const apiHeaders: Record<string, string> = bypassSecret
      ? { 'x-vercel-protection-bypass': bypassSecret, 'x-vercel-skip-toolbar': '1' }
      : {};

    // Webhook je asynchronní → lookup opakujeme, dokud předplatné neexistuje.
    await expect(async () => {
      const res = await page.request.post('/api/subscription-cancel-public', {
        data: { orderId: orderNumber, email: testEmail, action: 'lookup' },
        headers: apiHeaders,
      });
      expect(res.ok(), `lookup HTTP ${res.status()}`).toBeTruthy();
      const body = await res.json();
      expect(body.hasActiveSubscription, 'webhook musel vytvořit záznam předplatného').toBe(true);
    }).toPass({ timeout: 60000, intervals: [3000, 5000, 5000] });
    console.log(`✅ Předplatné pro ${testEmail} vytvořeno (ověřeno přes service-role lookup API)`);

    // ─── 11. Zrušit ke konci období ──────────────────────────────────────────
    const cancelRes = await page.request.post('/api/subscription-cancel-public', {
      data: { orderId: orderNumber, email: testEmail, action: 'cancel', immediate: false },
      headers: apiHeaders,
    });
    expect(cancelRes.ok(), `cancel HTTP ${cancelRes.status()}`).toBeTruthy();
    const cancelBody = await cancelRes.json();
    expect(cancelBody.ok, 'zrušení musí projít').toBe(true);
    console.log(`✅ Předplatné zrušeno: ${cancelBody.message}`);

    // ─── 12. Ověřit, že je zrušení naplánované (pendingCancel) ────────────────
    const verifyRes = await page.request.post('/api/subscription-cancel-public', {
      data: { orderId: orderNumber, email: testEmail, action: 'lookup' },
      headers: apiHeaders,
    });
    const verifyBody = await verifyRes.json();
    expect(verifyBody.pendingCancel, 'lookup musí po zrušení hlásit pendingCancel').toBe(true);
    console.log('✅ Zrušení potvrzeno (pendingCancel=true)');
  });
});
