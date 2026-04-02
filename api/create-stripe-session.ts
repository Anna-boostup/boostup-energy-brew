import { Stripe } from 'stripe';

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

    try {
        const body = await req.json();
        const { orderNumber, items, customerEmail, total } = body;

        console.log(`[Stripe Checkout] Creating session for order ${orderNumber}`);

        if (!orderNumber || !items || !total) {
             return new Response(JSON.stringify({ error: 'Missing required order details' }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        const origin = req.headers.get('origin') || 'https://drinkboostup.cz';
        
        // Check if there is a subscription item
        const isSubscription = items.some((item: any) => item.subscriptionInterval);
        
        // Map items to Stripe line_items
        const lineItems = items.map((item: any) => {
            const isRecurring = !!item.subscriptionInterval;
            
            return {
                price_data: {
                    currency: 'czk',
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
        const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        if (total > itemsTotal) {
            lineItems.push({
                price_data: {
                    currency: 'czk',
                    product_data: {
                        name: 'Doprava',
                    },
                    unit_amount: Math.round((total - itemsTotal) * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            // Removed hardcoded card restriction to allow Apple/Google Pay via Dashboard settings
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['CZ', 'SK'],
            },
            customer_email: customerEmail,
            line_items: lineItems,
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}&amount=${total}`,
            cancel_url: `${origin}/kosik`,
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
