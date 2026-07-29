import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Doručovací země / měny (přepočet na serveru, zdroj pravdy je CZK) ---
const DEFAULT_COUNTRIES: any[] = [
    { code: 'CZ', currency: 'CZK', stripeCurrency: 'czk', rate: 1, rounding: 1, freeShippingThreshold: 1500, methods: { personal: [{ maxBottles: null, price: 0 }], zasilkovna: [{ maxBottles: 12, price: 79 }, { maxBottles: 36, price: 109 }, { maxBottles: null, price: 139 }], courier: [{ maxBottles: 6, price: 99 }, { maxBottles: 24, price: 139 }, { maxBottles: null, price: 189 }] } },
    { code: 'SK', currency: 'EUR', stripeCurrency: 'eur', rate: 0.040, rounding: 0.10, freeShippingThreshold: 60, methods: { zasilkovna: [{ maxBottles: 12, price: 3.90 }, { maxBottles: 36, price: 5.90 }, { maxBottles: null, price: 7.90 }], courier: [{ maxBottles: 6, price: 4.90 }, { maxBottles: 24, price: 6.90 }, { maxBottles: null, price: 8.90 }] } },
];
const defaultCountry = (code: string) => DEFAULT_COUNTRIES.find(x => x.code === code) || DEFAULT_COUNTRIES[0];

export function convertToCurrency(czk: number, cfg: any): number {
    const step = cfg.rounding > 0 ? cfg.rounding : 1;
    const rounded = Math.round((czk * cfg.rate) / step) * step;
    return Math.round(rounded * 100) / 100;
}

function tierPrice(tiers: any[], bottles: number): number {
    if (!Array.isArray(tiers) || tiers.length === 0) return 0;
    const sorted = [...tiers].sort((a, b) => (a.maxBottles ?? Infinity) - (b.maxBottles ?? Infinity));
    for (const t of sorted) {
        if (t.maxBottles === null || bottles <= t.maxBottles) return t.price;
    }
    return sorted[sorted.length - 1].price;
}

export function shippingForMethod(cfg: any, method: string, totalBottles: number, subtotalInCurrency: number, freeByRule: boolean): number {
    const tiers = cfg.methods ? cfg.methods[method] : undefined;
    if (!Array.isArray(tiers) || tiers.length === 0) return 0;
    const base = tierPrice(tiers, totalBottles);
    if (base === 0) return 0;
    const freeByThreshold = cfg.freeShippingThreshold !== null && cfg.freeShippingThreshold !== undefined && subtotalInCurrency >= cfg.freeShippingThreshold;
    if (freeByRule || freeByThreshold) return 0;
    return base;
}

export async function resolveShippingCountry(order: any) {
    const code = String(order?.delivery_info?.country || 'CZ').toUpperCase();
    try {
        const { data } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'shipping_countries')
            .maybeSingle();
        if (data?.value) {
            const arr = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            if (Array.isArray(arr)) {
                const found = arr.find((x: any) => x && x.code === code);
                if (found) return found;
            }
        }
    } catch (e) {
        console.error('[secure-calculator] shipping config load failed:', e);
    }
    return defaultCountry(code);
}

export async function calculateSecureOrderTotal(orderId: string, itemsFromFrontend?: any[]) {
    // 1. Zjistit objednávku z DB (obsahuje delivery_info)
    const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    
    if (orderError || !order) {
        throw new Error('Order not found in database');
    }

    // 2. Načíst skutečné ceny z databáze (ne z frontendu)
    const { data: contentRow } = await supabaseAdmin
        .from('site_content')
        .select('content')
        .eq('id', 'main')
        .single();
    
    const pricing = contentRow?.content?.pricing || { pack3: 229, pack12: 849, pack21: 1399 };

    // 3. Načíst slevový kód, pokud byl použit
    let discountPercent = 0;
    const promoCode = order.delivery_info?.promoCode;
    if (promoCode) {
        const { data: promo } = await supabaseAdmin
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode)
            .eq('is_active', true)
            .single();
        if (promo) {
            discountPercent = promo.discount_percent;
        }
    }

    // 4. Přepočítat cenu košíku
    let cartTotal = 0;
    const secureItems = [];
    const itemsToProcess = itemsFromFrontend && itemsFromFrontend.length > 0 ? itemsFromFrontend : order.items;

    for (const item of itemsToProcess) {
        let basePrice = 0;
        
        // Zjistit základní cenu dle velikosti balení z DB
        if (item.sku.endsWith('-3')) basePrice = pricing.pack3;
        else if (item.sku.endsWith('-12')) basePrice = pricing.pack12;
        else if (item.sku.endsWith('-21')) basePrice = pricing.pack21;
        else {
            // Pokusit se detekovat číslo packu ze sku nebo fallback
            const match = item.sku.match(/-(\d+)$/);
            if (match) {
                const size = match[1];
                basePrice = pricing[`pack${size}` as keyof typeof pricing] || item.price;
            } else {
                basePrice = item.price; 
            }
        }

        // Zohlednit předplatné vs slevový kód
        const isSubscriptionItem = !!item.subscriptionInterval;
        let finalItemPrice = basePrice;
        
        if (isSubscriptionItem) {
            finalItemPrice = basePrice * 0.85; // Sleva 15% pro předplatné
        } else if (discountPercent > 0) {
            finalItemPrice = basePrice * ((100 - discountPercent) / 100);
        }

        const quantity = item.quantity || 1;
        cartTotal += finalItemPrice * quantity;

        secureItems.push({
            ...item,
            price: parseFloat(finalItemPrice.toFixed(2)) // Přepisujeme cenu na bezpečnou
        });
    }

    // 5. Země, měna a doprava (přepočet z CZK do měny země; CZK = rate 1)
    const countryCfg = await resolveShippingCountry(order);
    const method = order.delivery_info?.deliveryMethod || 'zasilkovna';
    const hasPack21 = itemsToProcess.some((i: any) => i.sku.endsWith('-21') || i.pack === 21);
    const freeByRule = hasPack21;
    const totalBottles = itemsToProcess.reduce((n: number, it: any) => {
        const m = String(it.sku || '').match(/-(\d+)$/);
        const pack = it.pack || (m ? parseInt(m[1], 10) : 1);
        return n + pack * (it.quantity || 1);
    }, 0);

    const convertedItems = secureItems.map((it: any) => ({
        ...it,
        price: convertToCurrency(it.price, countryCfg),
    }));
    const cartTotalCurrency = convertedItems.reduce((acc: number, it: any) => acc + it.price * (it.quantity || 1), 0);
    const shippingCost = shippingForMethod(countryCfg, method, totalBottles, cartTotalCurrency, freeByRule);
    const finalTotal = parseFloat((cartTotalCurrency + shippingCost).toFixed(2));

    return {
        cartTotal: parseFloat(cartTotalCurrency.toFixed(2)),
        shippingCost,
        finalTotal,
        secureItems: convertedItems,
        currency: countryCfg.stripeCurrency,
        currencyCode: countryCfg.currency,
        country: countryCfg.code,
        order
    };
}
