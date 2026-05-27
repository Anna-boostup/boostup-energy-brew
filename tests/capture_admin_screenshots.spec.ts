import { test } from '@playwright/test';

// Použijeme existující admin session
test.use({ storageState: 'playwright/.auth/admin.json' });

const pagesToCapture = [
    { name: 'content-management', path: '/admin/content' },
    { name: 'blog', path: '/admin/blog' },
    { name: 'emails', path: '/admin/emails' },
    { name: 'messages', path: '/admin/messages' },
    { name: 'orders', path: '/admin/orders' },
    { name: 'inventory', path: '/admin/inventory' },
    { name: 'manufacture', path: '/admin/manufacture' },
    { name: 'pricing', path: '/admin/pricing' },
    { name: 'promo-codes', path: '/admin/promo-codes' },
    { name: 'users', path: '/admin/users' },
];

test('Capture Admin Screenshots', async ({ page }) => {
    // Rozlišení pro profesionální screenshoty
    await page.setViewportSize({ width: 1920, height: 1080 });

    for (const { name, path } of pagesToCapture) {
        console.log(`Navigating to ${path}...`);
        await page.goto(path);
        
        // Počkáme na zmizení loaderu a plné načtení dat
        await page.waitForSelector('[data-testid="admin-loader"]', { state: 'hidden', timeout: 30000 }).catch(() => {});
        
        // Extra čas pro usazení animací (např. framer-motion) a načtení obrázků z CDN
        await page.waitForTimeout(3000);
        
        // Uložení čistého screenshotu viewportu
        await page.screenshot({ 
            path: `public/admin-guide/${name}.png`, 
            fullPage: false 
        });
        console.log(`Successfully captured: ${name}.png`);
    }
});
