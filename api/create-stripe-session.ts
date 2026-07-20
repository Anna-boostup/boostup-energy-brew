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
        const { orderNumber, items, customerEmail, total, origin: bodyOrigin } = body;

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

        // TEST MODE BYPASS
        if (process.env.IS_TEST_MODE === 'true') {
            console.log(`[Stripe] TEST MODE ACTIVE. Bypassing gateway for order ${orderNumber}`);
            return new Response(JSON.stringify({ 
                url: `${origin}/payment/success?session_id=TEST_SESSION_${orderNumber}&orderNumber=${orderNumber}&amount=${total}&status=paid_test`
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        // Check if there is a subscription item
        const isSubscription = secureItems.some((item: any) => item.subscriptionInterval);
        
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

        // Add shipping for one-time payments if needed
        // Note: For pure subscriptions, Stripe handles shipping differently if it's recurring.
        // For simplicity, we add it as a one-time line item in the first invoice.
        const itemsTotal = secureItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        if (finalTotal > itemsTotal) {
            lineItems.push({
                price_data: {
                    currency: sessionCurrency,
                    product_data: {
                        name: 'Doprava',
                    },
                    unit_amount: Math.round((finalTotal - itemsTotal) * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            // Removed hardcoded card restriction to allow Apple/Google Pay via Dashboard settings
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: [allowedCountry] as any,
            },
            customer_email: customerEmail,
            line_items: lineItems,
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}&amount=${finalTotal}`,
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
