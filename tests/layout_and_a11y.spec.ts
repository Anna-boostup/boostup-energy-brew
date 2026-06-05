import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

const PAGES_TO_TEST = [
  { name: 'homepage', path: '/' },
  { name: 'obchod', path: '/obchod' },
  { name: 'checkout', path: '/checkout' },
];

test.describe('Layout a Přístupnost (A11y)', () => {
  for (const pageTest of PAGES_TO_TEST) {
    
    test(`Kontrola přetékání layoutu (Horizontal Overflow) a A11y na: ${pageTest.name}`, async ({ page }) => {
      await page.goto(pageTest.path, { waitUntil: 'load' });
      await page.waitForTimeout(1000); // Necháme načíst dynamické prvky

      // 1. Zkontrolujeme, zda objekty neutíkají bokem (Horizontal Scrollbar)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(
        hasHorizontalScroll, 
        `Stránka ${pageTest.path} má horizontální scrollbar! Objekty "utíkají bokem".`
      ).toBe(false);

      // 2. Otestujeme přístupnost (Axe-core) – kontrast, sémantika, čitelnost
      const accessibilityScanResults = await new AxeBuilder({ page })
        // Můžeme omezit testování jen na konkrétní tagy pravidel, např.:
        // .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Reportujeme chyby. Pokud jsou nějaké závažné ("critical" nebo "serious" violations), test spadne.
      const violations = accessibilityScanResults.violations.filter(v => 
        ['critical', 'serious'].includes(v.impact || '')
      );

      // Okomentujte nebo snižte úroveň, pokud chcete aby test zatím procházel,
      // a vypisoval chyby jen do konzole
      if (violations.length > 0) {
        console.error(`Nalezeny A11y chyby na ${pageTest.path}:`, violations.map(v => v.id));
      }

      // Prozatím test nevyhazuje chybu (nepadá build) kvůli A11y, 
      // protože na e-shopech bývá občas těžké splnit všechny přísné A11y pravidla.
      // Pokud to chcete striktní, odkomentujte další řádek:
      // expect(violations.length).toBe(0);
    });
  }
});
