import { Page } from '@playwright/test';
import { test, expect } from './fixtures';

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
async function fillGoPayCheckout(page: Page, cardNumber: string = '4444444444444448') {
  // Wait for GoPay checkout page to start rendering (wait for first visible input)
  await page.locator('input:visible').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500); // Nechat chvíli na vykreslení okolních textů

  // 1. Zkontrolujeme, zda GoPay vyžaduje zadání e-mailu na první obrazovce (nové chování sandboxu)
  const isEmailScreenVisible = await page.locator('text=/Zadejte váš e-mail|email/i').first().isVisible().catch(() => false);
  
  if (isEmailScreenVisible) {
    // Použijeme specifičtější selektor pro emailový input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="e-mail" i], input:visible').first();
    await emailInput.fill('gopay-test@drinkboostup.cz');
    
    // Tlačítko pokračovat nesmí obsahovat obecné button:visible, abychom neklikli na "Zavřít"
    const continueBtn = page.locator('button:has-text("Pokračovat"), button:has-text("Continue"), button[type="submit"]').first();
    await continueBtn.click({ force: true });
    
    // Počkáme, až se emailová obrazovka skryje
    await page.waitForTimeout(1000);
    const stillVisible = await page.locator('text=/Zadejte váš e-mail|email/i').first().isVisible().catch(() => false);
    if (stillVisible) {
      // Pokud se stále zobrazuje, zkusíme najít tlačítko explicitně přes textový filtr
      await page.locator('button').filter({ hasText: /Pokračovat|Continue/i }).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // 2. Někdy je potřeba nejdříve kliknout na platební metodu "Karta"
  const cardMethodBtn = page.locator('button:has-text("Karta"), button:has-text("Platební karta"), .payment-method-card').first();
  if (await cardMethodBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cardMethodBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Robustní vyhledání a vyplnění formuláře karty (zkoušíme jak direct inputs, tak prohledávání všech asynchronně načtených iframů)
  const cardInput = page.locator('input[name="cardNumber"], input[autocomplete="cc-number"], input[id*="card-number"]').first();
  let cardFilled = false;

  await expect(async () => {
    // A. Direct input v hlavním okně
    if (await cardInput.isVisible().catch(() => false)) {
      await cardInput.click();
      await (cardInput.pressSequentially ? cardInput.pressSequentially(cardNumber, { delay: 30 }) : cardInput.type(cardNumber, { delay: 30 }));
      
      const expInput = page.locator('input[name="expiryDate"], input[autocomplete="cc-exp"]').first();
      if (await expInput.isVisible().catch(() => false)) {
        await expInput.click();
        await (expInput.pressSequentially ? expInput.pressSequentially('1229', { delay: 30 }) : expInput.type('1229', { delay: 30 }));
      }
      
      const cvcInput = page.locator('input[name="cvv"], input[autocomplete="cc-csc"], input[name="cvc"]').first();
      if (await cvcInput.isVisible().catch(() => false)) {
        await cvcInput.click();
        await (cvcInput.pressSequentially ? cvcInput.pressSequentially('123', { delay: 30 }) : cvcInput.type('123', { delay: 30 }));
      }
      cardFilled = true;
      return;
    }
    
    // B. Prohledání všech iframů (GoPay inline iframe se může načíst asynchronně, toPass zajistí aktualizaci seznamu frames)
    const frames = page.frames();
    for (const frame of frames) {
      const fCardInput = frame.locator('input[name="cardNumber"], input[autocomplete="cc-number"]');
      if (await fCardInput.isVisible().catch(() => false)) {
        await fCardInput.click();
        await (fCardInput.pressSequentially ? fCardInput.pressSequentially(cardNumber, { delay: 30 }) : fCardInput.type(cardNumber, { delay: 30 }));
        
        const fExpInput = frame.locator('input[name="expiryDate"], input[autocomplete="cc-exp"]');
        if (await fExpInput.isVisible().catch(() => false)) {
          await fExpInput.click();
          await (fExpInput.pressSequentially ? fExpInput.pressSequentially('1229', { delay: 30 }) : fExpInput.type('1229', { delay: 30 }));
        }
        
        const fCvcInput = frame.locator('input[name="cvv"], input[autocomplete="cc-csc"], input[name="cvc"]');
        if (await fCvcInput.isVisible().catch(() => false)) {
          await fCvcInput.click();
          await (fCvcInput.pressSequentially ? fCvcInput.pressSequentially('123', { delay: 30 }) : fCvcInput.type('123', { delay: 30 }));
        }
        cardFilled = true;
        return;
      }
    }
    
    throw new Error('GoPay card inputs not visible yet');
  }).toPass({
    intervals: [1000, 2000],
    timeout: 20000
  });

  if (!cardFilled) {
    throw new Error('Could not find GoPay card number input after timeout.');
  }

  // 4. Kliknout na tlačítko odeslání platby na GoPay
  const gopayPayBtn = page.locator(
    'button[type="submit"]:has-text("Zaplatit"), ' +
    'button[type="submit"]:has-text("Pay"), ' +
    '.pay-button, ' +
    'button:has-text("Zaplatit")'
  ).first();
  
  if (await gopayPayBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
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
  test('Úspěšná platba — karta 4444 (GoPay Test Mode)', async ({ page }) => {
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
    await page.getByTestId('checkout-terms').click(); // souhlas s VOP (povinné)
    const submitBtn = page.getByTestId('checkout-submit-btn');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    // Zachytit URL GoPay po přesměrování
    const [gopayResponse] = await Promise.all([
      page.waitForURL(/sandbox\.gopay\.com|gw\.gopay\.cz/, { timeout: 30000 }),
      submitBtn.click(),
    ]);

    console.log(`✅ Přesměrováno na GoPay: ${page.url()}`);

    // 7. Vyplnit platební formulář na GoPay
    await fillGoPayCheckout(page, '4444444444444448');

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
