// Triggering deploy after Stripe key update - v6
import { Stripe } from 'stripe';
import { calculateSecureOrderTotal } from './secure-calculator.js';

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

        if (!orderNumber) {
             return new Response(JSON.stringify({ 
                 error: `Missing required order details: orderNumber`,
                 debug: { orderNumber } 
             }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // --- BEZPEČNÝ PŘEPOČET CENY ---
        let finalTotal = total || 0;
        try {
            const secureData = await calculateSecureOrderTotal(orderNumber);
            finalTotal = secureData.finalTotal;
        } catch (err: any) {
             console.error('[Stripe Secure Calc Error]', err);
             return new Response(JSON.stringify({ error: 'Failed to validate order pricing' }), {
                 status: 400,
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
        }

        // Amount must be in the smallest currency unit (cents/haléře)
        const amount = Math.round(finalTotal * 100);

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'czk',
            receipt_email: customerEmail,
            metadata: {
                orderId: orderNumber,
            },
            // Use automatic payment methods to allow Apple/Google Pay from Dashboard
            automatic_payment_methods: { enabled: true },
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
