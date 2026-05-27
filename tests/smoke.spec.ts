import { test, expect } from '@playwright/test';

/**
 * Smoke Tests – základní kontrola dostupnosti klíčových stránek.
 * Ověřuje, že aplikace je nasazena a zásadní routy vrací HTTP 200.
 */

test.describe('Smoke Tests – Dostupnost stránek', () => {
  test('Domovská stránka se načte', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/);
  });

  test('Checkout stránka se načte', async ({ page }) => {
    const response = await page.goto('/checkout');
    expect(response?.status()).toBe(200);
    // Stránka musí zobrazit nadpis – i při prázdném košíku
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  test('Login stránka se načte', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 15_000 });
  });

  test('Obchodní podmínky se načtou', async ({ page }) => {
    const response = await page.goto('/obchodni-podminky');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  test('Stránka 404 pro neexistující routu', async ({ page }) => {
    await page.goto('/tato-stranka-neexistuje-xyz');
    // Aplikace by měla vrátit 200 (SPA), ale zobrazit NotFound komponentu
    const body = await page.locator('body').textContent();
    // Alespoň nějaký obsah musí být viditelný
    expect(body?.length).toBeGreaterThan(10);
  });
});
