import { test, expect } from './fixtures';

/**
 * Form Validation Tests – ověřuje správné chování validace formuláře na checkout stránce.
 *
 * Strategie: Pomocí localStorage předplníme košík tak, aby checkout stránka
 * měla co zobrazit, a poté testujeme validaci polí bez nutnosti vytvořit
 * skutečnou objednávku (žádný záznam se neodešle do databáze).
 */

/** Předvyplní košík v localStorage před navigací */
async function prefillCart(page: any) {
  await page.goto('/');
  await page.evaluate(() => {
    const testCart = [
      {
        id: 'test-lemon-12',
        name: 'BoostUp Lemon 12-pack',
        price: 990,
        quantity: 1,
        flavor: 'Lemon',
        pack: 12,
        flavorMode: 'single',
        image: '/bottle-lemon.webp',
      },
    ];
    localStorage.setItem('boostup_cart', JSON.stringify(testCart));
  });
}

test.describe('Validace formuláře – Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await prefillCart(page);
    await page.goto('/checkout');
    // Počkáme na zobrazení formuláře (nadpis sekce "Doprava a kontakt")
    await expect(page.locator('h1')).toBeVisible({ timeout: 20_000 });
  });

  test('Odeslání prázdného formuláře zobrazí chybový toast', async ({ page }) => {
    // Kliknutí na tlačítko "Závazně objednat"
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Toast s chybou musí být zobrazen
    const toast = page.locator('[role="region"]').filter({ hasText: /Chybějící|chyby/i })
      .or(page.locator('.toast, [data-state="open"]').filter({ hasText: /Chybějící|chyby/i }));

    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test('Pole Jméno je povinné – červený rámeček při prázdném odeslání', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    // Pole firstName musí mít chybový styl (border-destructive)
    const firstNameInput = page.locator('input[name="firstName"]');
    await expect(firstNameInput).toBeVisible();

    // Ověřujeme, že input má červený rámeček (třída border-destructive/50)
    const classList = await firstNameInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole Příjmení je povinné', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const lastNameInput = page.locator('input[name="lastName"]');
    await expect(lastNameInput).toBeVisible();
    const classList = await lastNameInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole Email je povinné', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    const classList = await emailInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole Telefon je povinné (nestačí jen prefix +420)', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    // Telefon má výchozí hodnotu '+420 ', což je považováno za prázdné
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible();
    const classList = await phoneInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole Číslo popisné je povinné', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const houseInput = page.locator('input[name="houseNumber"]');
    await expect(houseInput).toBeVisible();
    const classList = await houseInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole Město je povinné', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const cityInput = page.locator('input[name="city"]');
    await expect(cityInput).toBeVisible();
    const classList = await cityInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Pole PSČ je povinné', async ({ page }) => {
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const zipInput = page.locator('input[name="zip"]');
    await expect(zipInput).toBeVisible();
    const classList = await zipInput.getAttribute('class');
    expect(classList).toMatch(/border-destructive/);
  });

  test('Chyba zmizí po vyplnění pole', async ({ page }) => {
    // Nejprve odešleme prázdný formulář
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    const firstNameInput = page.locator('input[name="firstName"]');
    const classListBefore = await firstNameInput.getAttribute('class');
    expect(classListBefore).toMatch(/border-destructive/);

    // Vyplníme pole
    await firstNameInput.fill('Jan');

    // Po vyplnění by měla chyba zmizet (onChange handler čistí errors)
    const classListAfter = await firstNameInput.getAttribute('class');
    expect(classListAfter).not.toMatch(/border-destructive/);
  });

  test('Výběr způsobu platby je povinný', async ({ page }) => {
    // Vyplníme všechna ostatní povinná pole
    await page.locator('input[name="firstName"]').fill('Jan');
    await page.locator('input[name="lastName"]').fill('Novák');
    await page.locator('input[name="email"]').fill('jan.novak@test.cz');
    await page.locator('input[name="phone"]').fill('+420 777 888 999');
    await page.locator('input[name="houseNumber"]').fill('12');
    await page.locator('input[name="city"]').fill('Praha');
    await page.locator('input[name="zip"]').fill('110 00');

    // Odešleme bez výběru platby
    const submitBtn = page.locator('button', { hasText: /Závazně objednat/i });
    await submitBtn.click();

    // Toast musí stále zobrazit chybu (platba není vybrána)
    const toast = page.locator('[role="region"]').filter({ hasText: /Chybějící|chyby/i })
      .or(page.locator('.toast, [data-state="open"]').filter({ hasText: /Chybějící|chyby/i }));
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Přepínání způsobu doručení', () => {
  test.beforeEach(async ({ page }) => {
    await prefillCart(page);
    await page.goto('/checkout');
    await expect(page.locator('h1')).toBeVisible({ timeout: 20_000 });
  });

  test('Zásilkovna zobrazí widget pro výběr místa', async ({ page }) => {
    // Kliknout na tlačítko Zásilkovna
    const zasilkovnaBtn = page.locator('button', { hasText: /Zásilkovna/i }).first();
    await expect(zasilkovnaBtn).toBeVisible();
    await zasilkovnaBtn.click();

    // Po kliknutí by se měl zobrazit PacketaWidget nebo tlačítko pro výběr místa
    // Čekáme alespoň na vizuální změnu tlačítka (active stav)
    await expect(zasilkovnaBtn).toHaveClass(/border-primary/, { timeout: 5_000 });
  });

  test('Osobní vyzvednutí je výchozí volba', async ({ page }) => {
    const personalBtn = page.locator('button', { hasText: /Osobní vyzvednutí/i }).first();
    await expect(personalBtn).toBeVisible();
    // Výchozí stav by měl mít active třídu
    const classList = await personalBtn.getAttribute('class');
    expect(classList).toMatch(/border-primary/);
  });
});

test.describe('Přepínání způsobu platby', () => {
  test.beforeEach(async ({ page }) => {
    await prefillCart(page);
    await page.goto('/checkout');
    await expect(page.locator('h1')).toBeVisible({ timeout: 20_000 });
  });

  test('Kliknutí na Bankovní převod ho aktivuje', async ({ page }) => {
    const transferBtn = page.locator('button', { hasText: /Bankovní převod/i }).first();
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();
    // Aktivní tlačítko by mělo mít třídu border-primary
    await expect(transferBtn).toHaveClass(/border-primary/, { timeout: 5_000 });
  });

  test('Kliknutí na Platební karta ji aktivuje', async ({ page }) => {
    const cardBtn = page.locator('button', { hasText: /Platební karta/i }).first();
    await expect(cardBtn).toBeVisible();
    await cardBtn.click();
    await expect(cardBtn).toHaveClass(/border-primary/, { timeout: 5_000 });
  });
});
