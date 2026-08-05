import { test, expect } from './fixtures';

/**
 * E2E — Správa předplatného v zákaznickém účtu (mockovaný backend).
 *
 * Reálný prohlížeč + reálná aplikace + reálný login (storageState zákazníka),
 * ale data předplatného a endpoint /api/subscription-manage jsou zamockované,
 * takže test NEzávisí na Stripu a je deterministický.
 *
 * Ověřuje: zobrazení karty předplatného a proklik Přerušit → Obnovit → Zrušit,
 * včetně kontroly, že se na /api/subscription-manage odešle správná akce.
 *
 * Běží, když je nastaven TEST_BASIC_EMAIL (zákaznické přihlášení na preview).
 */

const RUN = !!process.env.TEST_BASIC_EMAIL;

test.describe('Správa předplatného (mock)', () => {
  test.skip(!RUN, 'Vyžaduje TEST_BASIC_EMAIL (zákaznický login) — běží na preview.');

  test('zobrazí předplatné a umožní přerušit, obnovit i zrušit', async ({ page }) => {
    let status: 'active' | 'paused' = 'active';
    let cancelPending = false;
    const manageCalls: any[] = [];

    const subRow = () => ({
      id: 'sub-row-1',
      user_id: 'cust',
      email: process.env.TEST_BASIC_EMAIL,
      status,
      interval: 'monthly',
      product_handle: 'boostup-lemon',
      quantity: 2,
      next_delivery_date: '2099-01-15',
      shipping_method: 'zasilkovna',
      shipping_price: 79,
      cancel_at_period_end: cancelPending,
      last_date_change_at: null,
      last_shipping_change_at: null,
    });

    // self-heal RPC → ok (204)
    await page.route('**/rest/v1/rpc/link_my_subscriptions', (r) => r.fulfill({ status: 204, body: '' }));

    // fetch předplatných → aktuální (mockovaný) stav
    await page.route('**/rest/v1/subscriptions*', (r) => {
      if (r.request().method() !== 'GET') return r.continue();
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([subRow()]) });
    });

    // endpoint správy → zaznamená akci a upraví mock stav
    await page.route('**/api/subscription-manage', (r) => {
      const body = JSON.parse(r.request().postData() || '{}');
      manageCalls.push(body);
      if (body.action === 'pause') status = 'paused';
      if (body.action === 'resume') status = 'active';
      if (body.action === 'cancel') cancelPending = true;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, message: 'OK' }) });
    });

    await page.goto('/account/subscriptions', { waitUntil: 'load', timeout: 60000 });

    // Karta předplatného + stav Aktivní
    await expect(page.getByText(/boostup/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Aktivní').first()).toBeVisible({ timeout: 15000 });

    // Přerušit → Pozastaveno
    await page.getByRole('button', { name: /Přerušit/i }).click();
    await expect(page.getByText('Pozastaveno').first()).toBeVisible({ timeout: 15000 });
    expect(manageCalls.some((c) => c.action === 'pause')).toBeTruthy();

    // Obnovit → Aktivní
    await page.getByRole('button', { name: /Obnovit/i }).click();
    await expect(page.getByText('Aktivní').first()).toBeVisible({ timeout: 15000 });
    expect(manageCalls.some((c) => c.action === 'resume')).toBeTruthy();

    // Zrušit (potvrdit dialog) → hláška o zrušení ke konci období
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /^Zrušit$/i }).click();
    await expect(page.getByText(/Zruší se ke konci/i)).toBeVisible({ timeout: 15000 });
    expect(manageCalls.some((c) => c.action === 'cancel')).toBeTruthy();
  });
});
