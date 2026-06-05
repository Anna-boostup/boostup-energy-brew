import { test, expect } from './fixtures';

/**
 * Layout Overflow Tests
 * Zkontroluje, zda na stránce nevzniká horizontální posuvník (zda prvky neutíkají bokem mimo obrazovku).
 */

const pathsToTest = [
  '/',
  '/products',
  '/checkout',
  '/blog',
  '/contact'
];

test.describe('Layout Overflow Tests', () => {
  for (const path of pathsToTest) {
    test(`No horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      
      // Počkáme, až se stránka plně načte
      await page.waitForLoadState('networkidle');
      
      // Provedeme evaluaci JavaScriptu přímo v prohlížeči, abychom zjistili, 
      // jestli má stránka širší obsah, než je šířka okna (viewportu).
      const hasHorizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScrollbar) {
        // Pokud test najde horizontální scroll, vypíše elementy, které způsobují přetékání
        const overflowingElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const badElements = [];
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const rect = el.getBoundingClientRect();
            // Pokud prvek přesahuje šířku těla dokumentu
            if (rect.right > document.documentElement.clientWidth) {
              badElements.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                right: rect.right,
                viewportWidth: document.documentElement.clientWidth
              });
            }
          }
          return badElements;
        });
        console.error(`Overflowing elements on ${path}:`, overflowingElements);
      }
      
      expect(hasHorizontalScrollbar, `Stránka ${path} by neměla mít horizontální posuvník!`).toBe(false);
    });
  }
});
