import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    // Suppress global overlays (Cookie Consent & Discount Modal) to prevent pointer-event interception during tests
    await page.addInitScript(() => {
      window.localStorage.setItem('boostup_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true, preferences: true }));
      window.localStorage.setItem('boostup_discount_dismissed', 'true');

      // Bot evasion: Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Bot evasion: Overwrite chrome object
      // @ts-ignore
      window.chrome = { runtime: {} };

      // Bot evasion: Overwrite languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['cs-CZ', 'cs', 'en-US', 'en'],
      });

      // Bot evasion: Overwrite plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    await page.emulateMedia({ reducedMotion: 'reduce' });

    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypassSecret) {
      await page.route('**/*', (route, request) => {
        const url = new URL(request.url());
        const isTargetHost =
          (baseURL && url.hostname === new URL(baseURL).hostname) ||
          url.hostname.includes('vercel.app') ||
          url.hostname.includes('drinkboostup.cz') ||
          url.hostname === 'localhost';

        if (isTargetHost) {
          const headers = {
            ...route.request().headers(),
            'x-vercel-protection-bypass': bypassSecret,
            'x-vercel-skip-toolbar': '1',
          };
          route.continue({ headers });
        } else {
          route.continue();
        }
      });
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
