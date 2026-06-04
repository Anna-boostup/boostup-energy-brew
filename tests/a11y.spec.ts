import { test, expect } from '@playwright/test';
import { test as boostupTest } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility (A11y) Tests
 * Kontroluje, zda jsou na webu splněny základní předpoklady přístupnosti (dostatečný kontrast textů, správné nadpisy, aria atributy).
 */

const pathsToTest = [
  '/',
  '/products',
  '/checkout'
];

test.describe('Accessibility Tests', () => {
  for (const path of pathsToTest) {
    boostupTest(`Accessibility validation on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Vyloučíme případné widgety třetích stran (např. chat, cookie lišty), které nemáme plně pod kontrolou
      const accessibilityScanResults = await new AxeBuilder({ page })
        .exclude('.cc-window') // Příklad vyloučení cookie lišty
        .analyze();

      // Pokud axe-core najde nějaká porušení, test spadne a do logu se vypíše pole chyb
      if (accessibilityScanResults.violations.length > 0) {
        console.error(`A11y violations on ${path}:`, JSON.stringify(accessibilityScanResults.violations, null, 2));
      }

      expect(accessibilityScanResults.violations.length).toBe(0);
    });
  }
});
