import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createPacketaPacket } from './_packeta-helper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
    runtime: 'nodejs', 
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

    // Use ArrayBuffer to prevent UTF-8 string encoding from corrupting the raw payload bytes
    const arrayBuffer = await req.arrayBuffer();
    const payload = Buffer.from(arrayBuffer);
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
                
                console.log(`[Stripe Webhook] Checkout session completed for order ${orderId}`);

                if (orderId) {
                    const { data: currentOrder, error: fetchError } = await supabase
                        .from('orders')
                        .select('status')
                        .eq('id', orderId)
                        .single();

                    if (!fetchError && currentOrder) {
                        if (currentOrder.status !== 'pending') {
                            console.log(`[Stripe Webhook] Order ${orderId} is already ${currentOrder.status}. Skipping update.`);
                        } else {
                            const { error } = await supabase
                                .from('orders')
                                .update({ status: 'paid' })
                                .eq('id', orderId);

                            if (error) {
                                 console.error(`Failed to update order status for ${orderId}:`, error);
                                 return new Response('Database Error', { status: 500, headers: corsHeaders });
                            }
                            console.log(`[Stripe Webhook] Order ${orderId} marked as paid (Checkout).`);

                            // Zásilkovna - create packet
                            const { data: fullOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();
                            if (fullOrder?.delivery_info?.deliveryMethod === 'zasilkovna' && fullOrder?.delivery_info?.packetaPointId && !fullOrder?.packeta_barcode) {
                                try {
                                    const packet = await createPacketaPacket({
                                        orderNumber: fullOrder.id,
                                        firstName: fullOrder.delivery_info.firstName,
                                        lastName: fullOrder.delivery_info.lastName,
                                        email: fullOrder.customer.email,
                                        phone: fullOrder.delivery_info.phone,
                                        packetaPointId: fullOrder.delivery_info.packetaPointId,
                                        total: fullOrder.total,
                                    });
                                    await supabase.from('orders').update({
                                        packeta_barcode: packet.barcode,
                                        packeta_packet_id: packet.packetId
                                    }).eq('id', orderId);
                                    console.log(`[Stripe Webhook] Packeta packet created for order ${orderId}`);
                                } catch (err) {
                                    console.error(`[Stripe Webhook] Packeta packet creation failed for order ${orderId}:`, err);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 'payment_intent.succeeded': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata?.orderId;
                
                console.log(`[Stripe Webhook] Payment successful for order ${orderId}`);

                if (orderId) {
                    const { data: currentOrder, error: fetchError } = await supabase
                        .from('orders')
                        .select('status')
                        .eq('id', orderId)
                        .single();

                    if (!fetchError && currentOrder) {
                        if (currentOrder.status !== 'pending') {
                            console.log(`[Stripe Webhook] Order ${orderId} is already ${currentOrder.status}. Skipping update.`);
                        } else {
                            const { error } = await supabase
                                .from('orders')
                                .update({ status: 'paid' })
                                .eq('id', orderId);

                            if (error) {
                                 console.error(`Failed to update order status for ${orderId}:`, error);
                                 return new Response('Database Error', { status: 500, headers: corsHeaders });
                            }
                            console.log(`[Stripe Webhook] Order ${orderId} marked as paid (Intent).`);

                            // Zásilkovna - create packet
                            const { data: fullOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();
                            if (fullOrder?.delivery_info?.deliveryMethod === 'zasilkovna' && fullOrder?.delivery_info?.packetaPointId && !fullOrder?.packeta_barcode) {
                                try {
                                    const packet = await createPacketaPacket({
                                        orderNumber: fullOrder.id,
                                        firstName: fullOrder.delivery_info.firstName,
                                        lastName: fullOrder.delivery_info.lastName,
                                        email: fullOrder.customer.email,
                                        phone: fullOrder.delivery_info.phone,
                                        packetaPointId: fullOrder.delivery_info.packetaPointId,
                                        total: fullOrder.total,
                                    });
                                    await supabase.from('orders').update({
                                        packeta_barcode: packet.barcode,
                                        packeta_packet_id: packet.packetId
                                    }).eq('id', orderId);
                                    console.log(`[Stripe Webhook] Packeta packet created for order ${orderId}`);
                                } catch (err) {
                                    console.error(`[Stripe Webhook] Packeta packet creation failed for order ${orderId}:`, err);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
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
