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
        
        // Map items to Stripe line_items
        const lineItems = items.map((item: OrderItem) => {
            return {
                price_data: {
                    currency: 'czk',
                    product_data: {
                        name: item.name,
                        description: item.mixConfiguration ? 'Vlastní mix příchutí' : undefined,
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe expects amount in haléře (cents)
                },
                quantity: item.quantity,
            };
        });

        // Add shipping if there is a discrepancy between items total and final total (like Zásilkovna)
        const itemsTotal = items.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0);
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
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['CZ', 'SK'],
            },
            customer_email: customerEmail,
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}&amount=${total}`,
            cancel_url: `${origin}/kosik`, // Or error page
            metadata: {
                orderId: orderNumber,
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
