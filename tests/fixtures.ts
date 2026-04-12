import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    // Suppress global overlays (Cookie Consent & Discount Modal) to prevent pointer-event interception during tests
    await page.addInitScript(() => {
      window.localStorage.setItem('boostup_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true, preferences: true }));
      window.localStorage.setItem('boostup_discount_dismissed', 'true');
      
      // Inject CSS to disable animations and transitions for test stability
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          transition: none !important;
          animation: none !important;
          transition-duration: 0s !important;
          animation-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });

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
          const headers = route.request().headers();
          headers['x-vercel-protection-bypass'] = bypassSecret;
          headers['x-vercel-skip-toolbar'] = '1';
          route.continue({ headers });
        } else {
          // Do not inject headers for third-party scripts like Stripe
          route.continue();
        }
      });
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
