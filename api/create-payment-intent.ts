// Triggering final deploy after env variable update
import { Stripe } from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';
// Diagnostic log outside was only on init

const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16', // Add a default API version to avoid warnings
});

export const config = {
    runtime: 'edge',
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { orderNumber, total, customerEmail } = body;
 
        console.log(`[Stripe PaymentIntent] Creating intent for order ${orderNumber} using key type: ${secretKey.startsWith('sk_test') ? 'sk_test_***' : secretKey.startsWith('sk_live') ? 'sk_live_***' : 'unknown/missing'}`);

        if (!orderNumber || !total) {
             const missingFields = [];
             if (!orderNumber) missingFields.push('orderNumber');
             if (!total) missingFields.push('total');

             return new Response(JSON.stringify({ 
                 error: `Missing required order details: ${missingFields.join(', ')}`,
                 debug: { orderNumber, total } 
             }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // Amount must be in the smallest currency unit (cents/haléře)
        const amount = Math.round(total * 100);

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'czk',
            receipt_email: customerEmail,
            metadata: {
                orderId: orderNumber,
            },
            // Restrict to card only to avoid Apple Pay domain verification issues on test domains
            payment_method_types: ['card'],
        });

        // Return the client_secret which the frontend needs to render the Elements form
        return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[Stripe PaymentIntent Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
