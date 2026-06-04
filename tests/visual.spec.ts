import { test, expect } from '@playwright/test';

// Které stránky chceme vizuálně hlídat
const PAGES_TO_TEST = [
  { name: 'homepage', path: '/' },
  { name: 'obchod', path: '/obchod' },
  { name: 'checkout', path: '/checkout' },
  { name: 'legal-obchodni-podminky', path: '/obchodni-podminky' },
];

test.describe('Vizuální Regresní Testy', () => {
  for (const pageTest of PAGES_TO_TEST) {
    test(`Vizuální kontrola: ${pageTest.name}`, async ({ page, isMobile }) => {
      // 1. Přejdeme na testovanou stránku
      await page.goto(pageTest.path, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Skryjeme případný cookielištu nebo notifikace, které by mohly test rozhodit
      await page.evaluate(() => {
        const style = document.createElement('style');
        // Zastavíme všechny animace, blikající kurzory a videa.
        // To už sice z velké části dělá Playwright (animations: 'disabled'),
        // ale pro jistotu přidáme i vlastní CSS úpravy
        style.innerHTML = `
          * {
            animation: none !important;
            transition: none !important;
            caret-color: transparent !important;
          }
          video {
            visibility: hidden !important;
          }
        `;
        document.head.appendChild(style);
      });

      // Ujistíme se, že se nenačítají obrázky na pozadí, dáme chvíli prostor
      await page.waitForTimeout(1000);

      // Uděláme full-page screenshot
      await expect(page).toHaveScreenshot(`${pageTest.name}-${isMobile ? 'mobile' : 'desktop'}.png`, {
        fullPage: true,
        // Pokud budete mít na webu elementy, které se mění (ID objednávek, aktuální datum atd.),
        // přidejte jim do HTML atribut data-testid="mask-visual" a zde je odmaskujte:
        // mask: [page.locator('[data-testid="mask-visual"]')],
      });
    });
  }

  // Příklad testování interakce – otevřený košík
  test('Vizuální kontrola: Otevřený košík', async ({ page, isMobile }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Klikneme na tlačítko košíku (header)
    const cartBtn = page.getByTestId('header-cart-btn').filter({ visible: true }).first();
    await cartBtn.click();
    
    // Počkáme až vyjede košík (drawer / sheet)
    await page.waitForTimeout(1000);

    // Snapshot pouze viditelné části (nikoliv full page, protože u otevřeného draweru to blbne)
    await expect(page).toHaveScreenshot(`cart-open-${isMobile ? 'mobile' : 'desktop'}.png`, {
      fullPage: false,
    });
  });
});
