import { test, expect } from './fixtures';

test.describe('Odstoupení od smlouvy - Elektronické podání', () => {
  test('Předvyplnění formuláře přes URL parametry', async ({ page }) => {
    // Navigace s parametry
    await page.goto('/odstoupeni-od-smlouvy?orderId=TEST-123&email=test@example.com&name=Jan%20Novák&date=24.12.2025');

    // Kontrola nadpisu
    await expect(page.locator('h1').filter({ hasText: 'Oznámení o odstoupení' })).toBeVisible();

    // Kontrola předvyplněných hodnot
    const nameInput = page.locator('input[value="Jan Novák"]');
    await expect(nameInput).toBeVisible();

    const emailInput = page.locator('input[value="test@example.com"]');
    await expect(emailInput).toBeVisible();

    const orderIdInput = page.locator('input[value="TEST-123"]');
    await expect(orderIdInput).toBeVisible();
    
    const dateInput = page.locator('input[value="24.12.2025"]');
    await expect(dateInput).toBeVisible();
  });

  test('Úspěšné elektronické odeslání formuláře (mockované API)', async ({ page }) => {
    await page.goto('/odstoupeni-od-smlouvy');

    // Mock API volání
    await page.route('/api/send-email', async (route) => {
      const request = route.request();
      expect(request.method()).toBe('POST');
      
      const postData = request.postDataJSON();
      expect(postData.type).toBe('withdrawal_request');
      expect(postData.customerName).toBe('Karel Testovací');
      expect(postData.bankAccount).toBe('123456789/0100');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success' }),
      });
    });

    // Vyplnění povinných polí
    await page.locator('textarea[placeholder="Doplňte název zboží, případně množství..."]').fill('BoostUp Lemon 12-pack');
    
    // Pro vstupy nemáme id, takže použijeme okolní text
    await page.locator('input').nth(0).fill('01.01.2026'); // orderDate
    await page.locator('input').nth(1).fill('ORDER-999'); // orderId
    await page.locator('input').nth(2).fill('03.01.2026'); // receiveDate
    await page.locator('input').nth(3).fill('Karel Testovací'); // name
    await page.locator('input').nth(4).fill('Testovací 123, 100 00 Praha'); // address
    await page.locator('input').nth(5).fill('karel@testovaci.cz'); // email
    await page.locator('input').nth(6).fill('123456789/0100'); // bank
    await page.locator('input').nth(7).fill('V Praze'); // loc
    await page.locator('input').nth(8).fill('04.01.2026'); // date

    // Kliknutí na odeslat
    const submitBtn = page.locator('button', { hasText: 'Odeslat elektronicky' });
    await submitBtn.click();

    // Ověření success toastu
    const toast = page.locator('.toast, [data-state="open"]').filter({ hasText: /Formulář odeslán/i });
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Ověření, že se formulář vyčistil
    await expect(page.locator('input').nth(3)).toHaveValue('');
    await expect(page.locator('input').nth(6)).toHaveValue('');
  });

  test('Zobrazení chybového hlášení při selhání API', async ({ page }) => {
    await page.goto('/odstoupeni-od-smlouvy');

    // Mock API volání - chyba 500
    await page.route('/api/send-email', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.locator('textarea[placeholder="Doplňte název zboží, případně množství..."]').fill('Test zboží');
    await page.locator('input').nth(0).fill('01.01.2026');
    await page.locator('input').nth(1).fill('ORDER-999');
    await page.locator('input').nth(2).fill('03.01.2026');
    await page.locator('input').nth(3).fill('Karel Testovací');
    await page.locator('input').nth(4).fill('Testovací 123');
    await page.locator('input').nth(5).fill('karel@testovaci.cz');
    await page.locator('input').nth(6).fill('123456789/0100');
    await page.locator('input').nth(7).fill('Praha');
    await page.locator('input').nth(8).fill('04.01.2026');

    const submitBtn = page.locator('button', { hasText: 'Odeslat elektronicky' });
    await submitBtn.click();

    // Ověření chybového toastu
    const toast = page.locator('.toast, [data-state="open"]').filter({ hasText: /Chyba při odesílání/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
