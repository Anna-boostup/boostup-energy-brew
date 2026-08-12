import { Stripe } from 'stripe';
import { calculateSecureOrderTotal } from './secure-calculator.js';
import { checkRateLimit } from './_rate-limit.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // Add a default API version to avoid warnings
});

export const config = {
    runtime: 'edge',
};

// Types corresponding to our frontend Order structure loosely
interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    sku?: string;
    mixConfiguration?: any;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // --- RATE LIMITING ---
    const { success: rateLimitSuccess } = await checkRateLimit(req, 'stripe-create');
    if (!rateLimitSuccess) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } 
        });
    }

    try {
        const body = await req.json();
        const { orderNumber, items, customerEmail, total, origin: bodyOrigin, customer: customerDetails } = body;

        console.log(`[Stripe Checkout] Creating session for order ${orderNumber}`);

        if (!orderNumber || !items) {
             return new Response(JSON.stringify({ error: 'Missing required order details' }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // --- BEZPEČNÝ PŘEPOČET CENY ---
        let finalTotal = total || 0;
        let secureItems = items;
        let sessionCurrency = 'czk';
        let allowedCountry = 'CZ';
        try {
            const secureData = await calculateSecureOrderTotal(orderNumber, items);
            finalTotal = secureData.finalTotal;
            secureItems = secureData.secureItems;
            sessionCurrency = secureData.currency;
            allowedCountry = secureData.country;
        } catch (err: any) {
             console.error('[Stripe Secure Calc Error]', err);
             return new Response(JSON.stringify({ error: 'Failed to validate order pricing' }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // Prefer origin sent by the browser (always correct), fall back to request headers
        const origin = bodyOrigin
            || req.headers.get('origin')
            || req.headers.get('referer')?.replace(/\/[^/]*$/, '')
            || 'https://drinkboostup.cz';

        // Obsahuje objednávka předplatné? (potřebujeme to už před test-mode bypassem)
        const isSubscription = secureItems.some((item: any) => item.subscriptionInterval);

        // TEST MODE BYPASS
        if (process.env.IS_TEST_MODE === 'true') {
            console.log(`[Stripe] TEST MODE ACTIVE. Bypassing gateway for order ${orderNumber}`);
            return new Response(JSON.stringify({ 
                url: `${origin}/payment/success?session_id=TEST_SESSION_${orderNumber}&orderNumber=${orderNumber}&amount=${total}&status=paid_test${isSubscription ? '&sub=1' : ''}`
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        // Map items to Stripe line_items
        const lineItems = secureItems.map((item: any) => {
            const isRecurring = !!item.subscriptionInterval;
            
            return {
                price_data: {
                    currency: sessionCurrency,
                    product_data: {
                        name: item.name + (isRecurring ? ` (Předplatné ${item.subscriptionInterval === 'monthly' ? 'měsíční' : 'dvouměsíční'})` : ''),
                        description: item.mixConfiguration ? 'Vlastní mix příchutí' : undefined,
                    },
                    unit_amount: Math.round(item.price * 100),
                    recurring: isRecurring ? {
                        interval: 'month',
                        interval_count: item.subscriptionInterval === 'monthly' ? 1 : 2,
                    } : undefined,
                },
                quantity: item.quantity,
            };
        });

        // Doprava. U předplatného ji účtujeme OPAKOVANĚ (stejný interval jako
        // předplatné), aby se počítala ke každé platbě — ne jen k první.
        const itemsTotal = secureItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        if (finalTotal > itemsTotal) {
            const subItem = secureItems.find((i: any) => i.subscriptionInterval);
            const subIntervalCount = subItem?.subscriptionInterval === 'monthly' ? 1 : 2;
            lineItems.push({
                price_data: {
                    currency: sessionCurrency,
                    product_data: {
                        name: 'Doprava',
                    },
                    unit_amount: Math.round((finalTotal - itemsTotal) * 100),
                    recurring: isSubscription ? {
                        interval: 'month',
                        interval_count: subIntervalCount,
                    } : undefined,
                },
                quantity: 1,
            });
        }

        // Předvyplnění Stripe Checkoutu jménem a adresou z našeho formuláře (přes Customer objekt)
        let stripeCustomerId: string | undefined;
        if (customerEmail) {
            try {
                const addr = customerDetails?.address ? {
                    line1: customerDetails.address.line1 || undefined,
                    city: customerDetails.address.city || undefined,
                    postal_code: customerDetails.address.postal_code || undefined,
                    country: customerDetails.address.country || allowedCountry,
                } : undefined;
                const custPayload: any = {
                    email: customerEmail,
                    name: customerDetails?.name || undefined,
                    phone: customerDetails?.phone || undefined,
                    address: addr,
                    shipping: (customerDetails?.name && addr?.line1) ? {
                        name: customerDetails.name,
                        phone: customerDetails?.phone || undefined,
                        address: addr,
                    } : undefined,
                };
                const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
                if (existing.data.length > 0) {
                    stripeCustomerId = existing.data[0].id;
                    await stripe.customers.update(stripeCustomerId, custPayload);
                } else {
                    const created = await stripe.customers.create(custPayload);
                    stripeCustomerId = created.id;
                }
            } catch (e: any) {
                console.error('[Stripe] customer prefill failed:', e?.message || e);
            }
        }

        const session = await stripe.checkout.sessions.create({
            // Removed hardcoded card restriction to allow Apple/Google Pay via Dashboard settings
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: [allowedCountry] as any,
            },
            ...(stripeCustomerId
                ? { customer: stripeCustomerId, customer_update: { name: 'auto', address: 'auto', shipping: 'auto' } }
                : { customer_email: customerEmail }),
            line_items: lineItems,
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}&amount=${finalTotal}${isSubscription ? '&sub=1' : ''}`,
            cancel_url: `${origin}/checkout`,
            metadata: {
                orderId: orderNumber,
                isSubscription: isSubscription ? 'true' : 'false'
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[Stripe Checkout Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
