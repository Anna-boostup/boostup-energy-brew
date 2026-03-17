import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
    // Vercel edge functions do not support raw body parsing easily for Stripe Webhooks, 
    // we need runtime: 'nodejs' for standard request streams, but 'edge' might work with text()
    runtime: 'edge', 
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        console.error('Missing stripe signature or webhook secret');
        return new Response('Webhook Error: Missing configuration', { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event;

    try {
        event = await stripe.webhooks.constructEventAsync(
            payload,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed. ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.orderId;
                
                console.log(`[Stripe Webhook] Payment successful for order ${orderId}`);

                if (orderId) {
                    // Update order status in Supabase
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: 'paid' })
                        .eq('id', orderId);

                    if (error) {
                         console.error(`Failed to update order status for ${orderId}:`, error);
                         return new Response('Database Error', { status: 500, headers: corsHeaders });
                    }
                    
                    console.log(`[Stripe Webhook] Order ${orderId} marked as paid.`);
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                 // Option to handle failures (e.g., mark as failed or cancelled)
                 const intent = event.data.object as Stripe.PaymentIntent;
                 console.log(`[Stripe Webhook] Payment intent failed: ${intent.id}`);
                 break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error('Error handling webhook event:', error);
        return new Response('Webhook Handler Error', { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
