import { Page, expect } from '@playwright/test';

// ─── Helper: fill Stripe hosted checkout card form ────────────────────────────
export async function fillStripeCheckout(page: Page, email: string, cardNumber: string = '4242424242424242') {
  // Wait for Stripe checkout page to fully load
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  // 1. Počkáme, až se na stránce objeví jakékoliv viditelné vstupní pole
  await page.locator('input:visible').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 1b. Zkontrolovat, zda je na stránce výběr platební metody "Card" (karta) a případně na ni kliknout.
  // V některých Stripe configurations může být platební metoda "Card" zobrazená jako radio button
  // nebo jako tabulátor. Pokud není vybraná, pole pro kartu se nezobrazí.
  const cardRadioSelectors = [
    'input[type="radio"][value="card"]',
    'input[type="radio"]#payment-method-accordion-item-title-card',
    'input[type="radio"]#payment-method-card',
    'label:has-text("Card")',
    'label:has-text("Karta")',
    'text=/^Card$|^Karta$|^Platební karta$/i'
  ];

  console.log('ℹ️ Kontroluji přítomnost výběru platební metody "Card"...');
  let paymentMethodSelected = false;
  for (const selector of cardRadioSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Zkontrolujeme, zda je radio button už označen (pokud je to input)
      const isChecked = await el.evaluate((node) => (node as HTMLInputElement).checked).catch(() => false);
      if (!isChecked) {
        console.log(`✅ Klikám na volbu platby kartou pomocí: ${selector}`);
        await el.click({ force: true });
        await page.waitForTimeout(2000); // Počkáme na načtení iframe pro kartu
      } else {
        console.log(`ℹ️ Volba platby kartou je již vybrána (${selector})`);
      }
      paymentMethodSelected = true;
      break;
    }
  }

  if (!paymentMethodSelected) {
    // Prohledáme i všechny frames, zda tam není volba platby kartou
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      for (const selector of cardRadioSelectors) {
        try {
          const el = frame.locator(selector).first();
          if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
            const isChecked = await el.evaluate((node) => (node as HTMLInputElement).checked).catch(() => false);
            if (!isChecked) {
              console.log(`✅ Klikám na volbu platby kartou v iframe pomocí: ${selector}`);
              await el.click({ force: true });
              await page.waitForTimeout(2000);
            }
            paymentMethodSelected = true;
            break;
          }
        } catch { /* ignore */ }
      }
      if (paymentMethodSelected) break;
    }
  }

  // 2. Vyplnit email (pokud je viditelný)
  const emailInput = page.locator('input[type="email"][name="email"], input[autocomplete="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.clear();
    await emailInput.fill(email);
    console.log('✅ Email vyplněn na Stripe Checkout');
  }

  // 3. Doručovací/billing adresa (Stripe Hosted Checkout může vyžadovat)
  await page.waitForTimeout(500);

  // 3b. Vynutit zemi CZ v rozevíracím seznamu (řeší defaultování na US/IE v CI na základě IP adresy běžícího runneru)
  const countrySelectors = [
    'select#shippingCountry',
    'select#billingCountry',
    'select[name="country"]',
    'select[name="shippingCountry"]',
    'select[name="billingCountry"]',
    'select[autocomplete="country"]',
    'select[autocomplete="shipping country"]',
    'select[autocomplete="billing country"]'
  ];
  for (const sel of countrySelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        const val = await el.inputValue().catch(() => '');
        if (val !== 'CZ') {
          await el.selectOption('CZ');
          console.log(`✅ Země nastavena na CZ přes: ${sel}`);
          await page.waitForTimeout(1500); // Počkat na překreslení formuláře
        } else {
          console.log(`ℹ️ Země je již nastavena na CZ (${sel})`);
        }
        break; // Vybereme pouze jednou a ukončíme loop pro zamezení vícenásobného reloadu
      } catch (err) {
        console.warn(`⚠️ Nepodařilo se vybrat CZ v ${sel}:`, err);
      }
    }
  }

  const addressLine1 = page.locator([
    'input[autocomplete*="address-line1" i]',
    'input[name*="AddressLine1" i]',
    'input[name*="address-line1" i]',
    'input[placeholder*="Address line 1" i]',
    'input[placeholder*="Adresa" i]'
  ].join(', ')).first();
  const hasShipping = await addressLine1.isVisible({ timeout: 4000 }).catch(() => false);
  if (hasShipping) {
    const shippingName = page.locator([
      'input[autocomplete*="name" i]',
      'input[name*="shippingName" i]',
      'input[name*="name" i]',
      'input[placeholder*="Name" i]',
      'input[placeholder*="Jméno" i]'
    ].join(', ')).first();
    if (await shippingName.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(async () => {
        await shippingName.fill('Stripe E2E Test');
        await expect(shippingName).toHaveValue('Stripe E2E Test', { timeout: 1000 });
      }).toPass({ timeout: 8000 });
    }

    await expect(async () => {
      await addressLine1.fill('Testovací 123');
      await expect(addressLine1).toHaveValue('Testovací 123', { timeout: 1000 });
    }).toPass({ timeout: 8000 });

    const cityInput = page.locator([
      'input[autocomplete*="address-level2" i]',
      'input[name*="city" i]',
      'input[name*="address-level2" i]',
      'input[placeholder*="City" i]',
      'input[placeholder*="Město" i]'
    ].join(', ')).first();
    if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(async () => {
        await cityInput.fill('Brno');
        await expect(cityInput).toHaveValue('Brno', { timeout: 1000 });
      }).toPass({ timeout: 8000 });
    }

    const postalInput = page.locator([
      'input[autocomplete*="postal-code" i]',
      'input[name*="postal" i]',
      'input[name*="zip" i]',
      'input[id*="postal" i]',
      'input[id*="zip" i]',
      'input[placeholder*="směrovací" i]',
      'input[placeholder*="postal" i]',
      'input[placeholder*="zip" i]',
      'input[placeholder*="PSČ" i]'
    ].join(', ')).first();
    if (await postalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(async () => {
        await postalInput.fill('62300');
        await expect(postalInput).toHaveValue('62300', { timeout: 1000 });
      }).toPass({ timeout: 10000 });
    }
    console.log('✅ Shipping adresa vyplněna na Stripe Checkout');
  }

  // 3c. Pokud se doručovací adresa nezobrazila, ale je přítomen samostatný billing PSČ input
  const billingZip = page.locator([
    'input[autocomplete*="postal-code" i]',
    'input[name*="postal" i]',
    'input[name*="zip" i]',
    'input[id*="postal" i]',
    'input[id*="zip" i]',
    'input[placeholder*="směrovací" i]',
    'input[placeholder*="postal" i]',
    'input[placeholder*="zip" i]',
    'input[placeholder*="PSČ" i]'
  ].join(', ')).first();
  if (await billingZip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(async () => {
      await billingZip.fill('11000');
      await expect(billingZip).toHaveValue('11000', { timeout: 1000 });
    }).toPass({ timeout: 8000 });
    console.log('✅ Billing PSČ vyplněno na Stripe Checkout');
  }

  // ── Karta ────────────────────────────────────────────────────────────────────
  // Stripe Hosted Checkout (nový design): jeden unifikovaný Payment Element iframe.
  // Starší Stripe Elements: 3 oddělené iframy pro číslo, datum, CVC.
  // Spolehlivé vyplnění probíhá přes type() (keyboard events), ne fill(),
  // protože cross-origin iframe musí přijmout input jako reálné keyeventy.

  await page.waitForTimeout(1000);

  // ── Strategie 1: Nový unifikovaný Payment Element (jeden iframe) ──────────
  // Znovu načteme seznam framů, abychom viděli nově načtený iframe pro kartu
  const allFrames = page.frames();
  let cardFilled = false;

  // Zkusíme všechny framy na stránce hledat pole pro číslo karty
  for (const frame of allFrames) {
    // Přeskočit hlavní frame
    if (frame === page.mainFrame()) continue;

    try {
      const cardInput = frame.locator(
        'input[name="cardnumber"], ' +
        'input[autocomplete="cc-number"], ' +
        'input[data-elements-stable-field-name="cardNumber"], ' +
        'input[placeholder*="1234" i], ' +
        'input[placeholder*="Card number" i], ' +
        'input[placeholder*="Číslo karty" i]'
      ).first();

      if (await cardInput.isVisible({ timeout: 1500 }).catch(() => false)) {
        await cardInput.click();
        await cardInput.type(cardNumber, { delay: 50 });
        console.log(`✅ Číslo karty vyplněno (frame: ${frame.url().substring(0, 60)})`);

        // Expiry
        const expiryInput = frame.locator(
          'input[name="exp-date"], input[autocomplete="cc-exp"], ' +
          'input[data-elements-stable-field-name="cardExpiry"], ' +
          'input[placeholder*="MM" i], input[placeholder*="Expiry" i]'
        ).first();
        if (await expiryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expiryInput.click();
          await expiryInput.type('1229', { delay: 50 });
          console.log('✅ Datum expirace vyplněno');
        }

        // CVC
        const cvcInput = frame.locator(
          'input[name="cvc"], input[autocomplete="cc-csc"], ' +
          'input[data-elements-stable-field-name="cardCvc"], ' +
          'input[placeholder*="CVC" i], input[placeholder*="CVV" i], input[placeholder*="Security" i]'
        ).first();
        if (await cvcInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cvcInput.click();
          await cvcInput.type('123', { delay: 50 });
          console.log('✅ CVC vyplněno');
        }

        // ZIP/Postal code inside iframe (případně vyžadovaný pro non-CZ lokace v Elements)
        const frameZipInput = frame.locator(
          'input[name="postal"], input[name="zip"], input[autocomplete="postal-code"], ' +
          'input[placeholder*="ZIP" i], input[placeholder*="Postcode" i], input[placeholder*="PSČ" i]'
        ).first();
        if (await frameZipInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await frameZipInput.click();
          await frameZipInput.type('11000', { delay: 50 });
          console.log('✅ PSČ vyplněno v iframe karty');
        }

        cardFilled = true;
        break;
      }
    } catch {
      // Tento frame neobsahuje karta pole, pokračujeme
    }
  }

  // ── Strategie 2: frameLocator selektory (fallback) ────────────────────────
  if (!cardFilled) {
    const frameSelectors = [
      'iframe[title="Secure card number input frame"]',
      'iframe[title*="card number" i]',
      'iframe[title*="Payment information" i]',
      'iframe[name*="privateStripeFrame"]',
      'iframe[src*="js.stripe.com"]',
    ];

    for (const sel of frameSelectors) {
      try {
        const frame = page.frameLocator(sel);
        const cardInput = frame.locator('input').first();
        if (await cardInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await cardInput.click();
          await cardInput.type(cardNumber, { delay: 50 });
          console.log(`✅ Číslo karty vyplněno přes frameLocator (${sel})`);
          cardFilled = true;
          break;
        }
      } catch { /* skip */ }
    }
  }

  // ── Strategie 3: Přímé inputy bez iframu (některé Stripe integrace) ───────
  if (!cardFilled) {
    const directCard = page.locator('input#cardNumber, input[name="cardNumber"], input[autocomplete="cc-number"]').first();
    if (await directCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await directCard.click({ force: true });
      await directCard.focus();
      await directCard.type(cardNumber, { delay: 80 });
      
      const directExpiry = page.locator('input#cardExpiry, input[name="cardExpiry"], input[autocomplete="cc-exp"]').first();
      if (await directExpiry.isVisible({ timeout: 2000 }).catch(() => false)) {
        await directExpiry.click({ force: true });
        await directExpiry.focus();
        await directExpiry.type('1229', { delay: 80 });
      }
      
      const directCvc = page.locator('input#cardCvc, input[name="cardCvc"], input[autocomplete="cc-csc"]').first();
      if (await directCvc.isVisible({ timeout: 2000 }).catch(() => false)) {
        await directCvc.click({ force: true });
        await directCvc.focus();
        await directCvc.type('123', { delay: 80 });
      }

      const directZip = page.locator('input#postalCode, input[name="postalCode"], input[autocomplete="postal-code"], input[name="postal"]').first();
      if (await directZip.isVisible({ timeout: 2000 }).catch(() => false)) {
        await directZip.click({ force: true });
        await directZip.focus();
        await directZip.type('11000', { delay: 80 });
      }
      cardFilled = true;
      console.log('✅ Číslo karty vyplněno přes přímý input');
    }
  }

  if (!cardFilled) {
    // Výpis všech framů pro debug
    const frameUrls = page.frames().map(f => f.url()).join('\n  ');
    throw new Error(
      `Nelze najít pole pro číslo karty na Stripe Checkout.\n` +
      `Dostupné framy:\n  ${frameUrls}\n` +
      `Pravděpodobně se změnilo UI Stripe.`
    );
  }

  // Cardholder name (některé Stripe šablony)
  const nameInput = page.locator('input[name="name"], input[autocomplete="cc-name"]').first();
  if (await nameInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    await nameInput.fill('Stripe E2E Test');
  }

  await page.waitForTimeout(500);
}




// Helper pro zpracování Stripe 3D Secure (SCA) výzvy
// Poznámka: karta 4242424242424242 3DS nevyžaduje. Tento helper slouží jako fallback pro jiné karty.
export async function handleStripe3DS(page: Page, approve: boolean = true) {
  // Čekáme krátce na případný redirect/modal
  await page.waitForTimeout(2000);
  
  // Stripe Hosted Checkout - 3DS může být prezentováno jako:
  // 1. iframe[name="challengeFrame"] (Stripe Elements)
  // 2. Celostránkový redirect (Hosted Checkout automaticky zpracovává)
  // 3. Modal s tlačítky Complete/Fail (Stripe test mode)
  
  const completeSelector = '#test-source-authorize-3ds, button#challenge-complete, button:has-text("Complete"), button:has-text("Autorizovat"), button:has-text("Schválit"), [data-testid="3ds-authorize"]';
  const failSelector = '#test-source-fail-3ds, button#challenge-fail, button:has-text("Fail"), button:has-text("Odmítnout"), [data-testid="3ds-fail"]';
  
  // Zkontrolujeme, zda se zobrazil challengeFrame
  const challengeFrame = page.locator('iframe[name="challengeFrame"]').first();
  const is3dsVisible = await challengeFrame.isVisible({ timeout: 6000 }).catch(() => false);
  
  if (is3dsVisible) {
    console.log('ℹ️ Detekován Stripe 3D Secure challengeFrame, provádím autorizaci...');
    const frame = page.frameLocator('iframe[name="challengeFrame"]');
    
    // 3DS challenge může mít vnořený iframe
    const innerFrame = frame.frameLocator('iframe').first();
    
    const targetSelector = approve ? completeSelector : failSelector;
    
    // Zkusíme nejprve přímý frame, pak vnořený
    let clicked = false;
    
    const directBtn = frame.locator(targetSelector).first();
    if (await directBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await directBtn.click({ force: true });
      clicked = true;
      console.log(`✅ Kliknuto na 3DS tlačítko v challengeFrame (schválit=${approve})`);
    }
    
    if (!clicked) {
      const innerBtn = innerFrame.locator(targetSelector).first();
      if (await innerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await innerBtn.click({ force: true });
        clicked = true;
        console.log(`✅ Kliknuto na 3DS tlačítko ve vnořeném iframe (schválit=${approve})`);
      }
    }
    
    if (!clicked) {
      // Zkusíme všechny frames
      for (const f of page.frames()) {
        if (f.url().includes('3d-secure') || f.url().includes('stripe') || f.name().includes('challenge')) {
          const btn = f.locator(targetSelector).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click({ force: true });
            clicked = true;
            console.log(`✅ 3DS tlačítko kliknuto v frame: ${f.url()} (schválit=${approve})`);
            break;
          }
        }
      }
    }
    
    if (!clicked) {
      console.log('⚠️ 3DS challengeFrame nalezen, ale nepodařilo se najít a kliknout na tlačítko.');
    }
    
    await page.waitForTimeout(3000);
  } else {
    // Zkontrolujeme všechny frames pro případ, že 3DS je v jiném iframe
    let clicked = false;
    for (const f of page.frames()) {
      if (f.url().includes('3d-secure')) {
        const targetSelector = approve ? completeSelector : failSelector;
        const btn = f.locator(targetSelector).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click({ force: true });
          clicked = true;
          console.log(`✅ 3DS tlačítko kliknuto v frame URL: ${f.url()}`);
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
    if (!clicked) {
      console.log('ℹ️ Stripe 3D Secure nebyl vyžadován (karta ho nepotřebuje).');
    }
  }
}

/**
 * Robust helper: čeká na přesměrování na /payment/success po Stripe platbě.
 *
 * V CI (preview.drinkboostup.cz s Vercel Protection) může nastat:
 *   A) Přímé přesměrování na /payment/success ✔
 *   B) Vercel interceptuje redirect → přesměrovává na /_vercel/auth?redirect=/payment/success
 *
 * Tento helper detekuje obě možnosti a v případě B manuálně naviguje na cíl.
 */
export async function waitForPaymentSuccess(
  page: Page,
  baseURL: string,
  _bypassSecret: string,
  timeoutMs: number = 90000
): Promise<string> {
  const start = Date.now();
  const ourOrigin = new URL(baseURL).origin;

  console.log(`⏳ Čekám na redirect na /payment/success (max ${timeoutMs / 1000}s)...`);

  while (Date.now() - start < timeoutMs) {
    const currentUrl = page.url();

    // A) Úspěch - jsme na success stránce
    if (/payment\/success/i.test(currentUrl)) {
      console.log(`✅ Dosažena success URL: ${currentUrl.substring(0, 120)}`);
      return currentUrl;
    }

    // B) Vercel auth redirect - manuálně obejdeme
    if (currentUrl.includes('_vercel/auth')) {
      try {
        const parsed = new URL(currentUrl);
        const redirectParam = decodeURIComponent(parsed.searchParams.get('redirect') || '');
        if (redirectParam) {
          const targetUrl = `${ourOrigin}${redirectParam}`;
          console.log(`⚠️ Vercel auth redirect! Manuálně naviguji na: ${targetUrl.substring(0, 120)}`);
          await page.goto(targetUrl, { waitUntil: 'commit', timeout: 30000 });
          continue;
        }
      } catch { /* ignore */ }
    }

    // Log každých ~10s pro debug
    const elapsed = Date.now() - start;
    if (elapsed > 5000 && elapsed % 10000 < 1500) {
      console.log(`⏳ ${Math.round(elapsed / 1000)}s: čekám na success URL, aktuální: ${currentUrl.substring(0, 100)}`);
    }

    await page.waitForTimeout(1500);
  }

  const finalUrl = page.url();
  throw new Error(
    `Timeout ${timeoutMs / 1000}s při čekání na /payment/success.\nFinální URL: ${finalUrl}`
  );
}
