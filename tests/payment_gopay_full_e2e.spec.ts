import { test, expect, Page } from '@playwright/test';
import { test as boostupTest } from './fixtures';

/**
 * FULL E2E GoPay Payment Test
 *
 * Tento test projde celým platebním řetězcem:
 *   Košík → Checkout → GoPay hosted checkout → Platba testovací kartou
 *   → GoPay přesměrování zpět → /payment/success
 *
 * PREREKVIZITY (nastavit ve Vercelu pro Preview prostředí):
 *   IS_TEST_MODE = false      ← vypnout bypass
 *
 * Spuštění:
 *   GOPAY_FULL_E2E=true PLAYWRIGHT_TEST_BASE_URL=https://test.drinkboostup.cz \
 *     npx playwright test --project=payment-e2e-gopay
 *
 * Testovací karta GoPay Sandbox:
 *   Číslo: 4000 0000 0000 0000 (nebo 0002 pro zamítnutí)
 *   Datum: 12/29
 *   CVC:   123
 */

const RUN = process.env.GOPAY_FULL_E2E === 'true';

// ─── Helper: fill GoPay hosted checkout card form ─────────────────────────────
async function fillGoPayCheckout(page: Page, cardNumber: string = '4000000000000000') {
  // Wait for GoPay checkout page to fully load
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Sometimes GoPay requires selecting the card payment method first
  const cardMethodBtn = page.locator('button:has-text("Karta"), button:has-text("Platební karta"), .payment-method-card').first();
  if (await cardMethodBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cardMethodBtn.click();
  }

  // ── Card number ──────────────────────────────────────────────────────────────
  const cardInput = page.locator('input[name="cardNumber"], input[autocomplete="cc-number"], input[id*="card-number"]').first();
  if (await cardInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await cardInput.fill(cardNumber);
  } else {
    // Look inside iframe if GoPay uses one
    const frames = page.frames();
    let filled = false;
    for (const frame of frames) {
      const fCardInput = frame.locator('input[name="cardNumber"], input[autocomplete="cc-number"]');
      if (await fCardInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fCardInput.fill(cardNumber);
        filled = true;
        
        // Fill expiry and cvc in the same frame if possible
        const fExpInput = frame.locator('input[name="expiryDate"], input[autocomplete="cc-exp"]');
        if (await fExpInput.isVisible().catch(() => false)) {
          await fExpInput.fill('1229');
        }
        
        const fCvcInput = frame.locator('input[name="cvv"], input[autocomplete="cc-csc"], input[name="cvc"]');
        if (await fCvcInput.isVisible().catch(() => false)) {
          await fCvcInput.fill('123');
        }
        break;
      }
    }
    
    if (!filled) {
      throw new Error('Could not find GoPay card number input.');
    }
  }

  // ── Expiry (if not in iframe) ────────────────────────────────────────────────
  const expInput = page.locator('input[name="expiryDate"], input[autocomplete="cc-exp"]').first();
  if (await expInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expInput.fill('1229');
  }

  // ── CVC (if not in iframe) ───────────────────────────────────────────────────
  const cvcInput = page.locator('input[name="cvv"], input[autocomplete="cc-csc"], input[name="cvc"]').first();
  if (await cvcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cvcInput.fill('123');
  }

  // GoPay sometimes has an explicit "Zaplatit" / "Pay" button on the card form
  const gopayPayBtn = page.locator(
    'button[type="submit"]:has-text("Zaplatit"), ' +
    'button[type="submit"]:has-text("Pay"), ' +
    '.pay-button'
  ).first();
  
  if (await gopayPayBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gopayPayBtn.click();
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
test.describe('Full GoPay E2E — Real Gateway', () => {

  test.beforeEach(async () => {
    if (!RUN) {
      test.skip(true, [
        'Přeskočeno. Pro spuštění nastav:',
        '  GOPAY_FULL_E2E=true',
        '  IS_TEST_MODE=false (ve Vercelu pro Preview)',
      ].join('\n'));
    }
  });

  // ── Test 1: Úspěšná platba testovací kartou ──────────────────────────────────
  boostupTest('Úspěšná platba — karta 4000 (GoPay Test Mode)', async ({ page }) => {
    const testEmail = `gopay-e2e-${Date.now()}@test.drinkboostup.cz`;

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
    await page.fill('input[name="firstName"]', 'GoPay');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+420 777 000 043');
    await page.fill('input[name="street"]', 'GoPayová');
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

    // 5. Vybrat platbu kartou (pro jednorázové platby by to měl být GoPay)
    await page.getByTestId('checkout-payment-card').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('checkout-payment-card').click();

    // 6. Odeslat objednávku → přesměrování na GoPay
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    // Zachytit URL GoPay po přesměrování
    const [gopayResponse] = await Promise.all([
      page.waitForURL(/sandbox\.gopay\.com|gw\.gopay\.cz/, { timeout: 30000 }),
      submitBtn.click(),
    ]);

    console.log(`✅ Přesměrováno na GoPay: ${page.url()}`);

    // 7. Vyplnit platební formulář na GoPay
    await fillGoPayCheckout(page, '4000000000000000');

    // 8. Počkat na přesměrování zpět na náš web (matches any environment success url)
    // U GoPay se přesměrovává hned po úspěšné platbě (nečeká na webhook pro redirect).
    await page.waitForURL(/.*payment\/success/, { timeout: 60000 });
    console.log(`✅ Platba úspěšná, URL: ${page.url()}`);

    // 9. Ověřit obsah success stránky
    await expect(page.locator('body')).toContainText(/děkujeme|úspěšn|BUP-/i, { timeout: 15000 });

    const url = new URL(page.url());
    const orderNumber = url.searchParams.get('orderNumber');
    expect(orderNumber).toBeTruthy();
    console.log(`✅ Číslo objednávky: ${orderNumber}`);
  });
});
