import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    // 5. Doprava
    const hasPack21 = itemsToProcess.some((i: any) => i.sku.endsWith('-21') || i.pack === 21);
    const isFreeShipping = cartTotal >= 1500 || hasPack21;
    
    let shippingCost = 0;
    if (order.delivery_info?.deliveryMethod === 'zasilkovna' && !isFreeShipping) {
        shippingCost = 79;
    }

    return {
        cartTotal: parseFloat(cartTotal.toFixed(2)),
        shippingCost,
        finalTotal: parseFloat((cartTotal + shippingCost).toFixed(2)),
        secureItems,
        order
    };
}
