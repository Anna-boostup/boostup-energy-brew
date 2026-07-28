import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createPacketaPacket } from './_packeta-helper.js';

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

/**
 * Zapíše/aktualizuje záznam předplatného v tabulce `subscriptions` z dat
 * Stripe subscription + původní objednávky (delivery_info, doprava, e-mail).
 * Idempotentní (upsert dle stripe_subscription_id). Běží pod service role.
 */
async function upsertSubscriptionRecord(stripeSubId: string, orderId?: string | null) {
    try {
        const sub = await stripe.subscriptions.retrieve(stripeSubId);
        const firstItem = sub.items?.data?.[0];
        const intervalCount = firstItem?.price?.recurring?.interval_count || 1;
        const interval = intervalCount >= 2 ? 'bimonthly' : 'monthly';
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

        let order: any = null;
        if (orderId) {
            const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
            order = data;
        }
        const items: any[] = Array.isArray(order?.items) ? order.items : [];
        const itemsTotal = items.reduce((a, it) => a + (Number(it.price) * Number(it.quantity)), 0);
        const shippingPrice = order ? Math.max(0, Number(order.total) - itemsTotal) : null;

        const row: any = {
            stripe_subscription_id: sub.id,
            stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
            email: order?.customer?.email || null,
            user_id: order?.user_id ?? null,
            status: sub.status === 'canceled' ? 'cancelled' : (sub.pause_collection ? 'paused' : 'active'),
            interval,
            product_handle: items[0]?.sku || items[0]?.name || 'subscription',
            quantity: items[0]?.quantity || 1,
            shipping_method: order?.delivery_info?.deliveryMethod || null,
            shipping_price: shippingPrice,
            shipping_currency: 'CZK',
            delivery_info: order?.delivery_info || null,
            current_period_end: periodEnd ? periodEnd.toISOString() : null,
            next_delivery_date: periodEnd ? periodEnd.toISOString().slice(0, 10) : null,
            cancel_at_period_end: !!sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'stripe_subscription_id' });
        if (error) console.error('[Stripe Webhook] subscription upsert error:', error.message);
        else console.log(`[Stripe Webhook] subscription ${sub.id} recorded (${interval}).`);
    } catch (e: any) {
        console.error('[Stripe Webhook] recordSubscription failed:', e?.message || e);
    }
}

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
                if (session.mode === 'subscription' && session.subscription) {
                    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
                    await upsertSubscriptionRecord(subId, orderId);
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
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const status = sub.status === 'canceled' ? 'cancelled' : (sub.pause_collection ? 'paused' : 'active');
                await supabase.from('subscriptions').update({
                    status,
                    cancel_at_period_end: !!sub.cancel_at_period_end,
                    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                    updated_at: new Date().toISOString(),
                }).eq('stripe_subscription_id', sub.id);
                console.log(`[Stripe Webhook] subscription ${sub.id} updated -> ${status}`);
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                await supabase.from('subscriptions').update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }).eq('stripe_subscription_id', sub.id);
                console.log(`[Stripe Webhook] subscription ${sub.id} cancelled`);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as any)?.id;
                if (invoice.billing_reason === 'subscription_cycle' && subId) {
                    try {
                        const sub = await stripe.subscriptions.retrieve(subId);
                        await supabase.from('subscriptions').update({
                            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                            updated_at: new Date().toISOString(),
                        }).eq('stripe_subscription_id', subId);
                    } catch (e: any) { console.error('[Stripe Webhook] invoice.paid refresh failed:', e?.message || e); }
                    // TODO(fáze 1b): vytvořit objednávku obnovy + odpis zásob.
                    console.log(`[Stripe Webhook] renewal for ${subId} — order+stock creation is a follow-up step.`);
                }
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
