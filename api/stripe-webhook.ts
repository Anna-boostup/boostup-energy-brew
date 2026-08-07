import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createPacketaPacket } from './_packeta-helper.js';
import { isRenewalInvoice, applySubscriptionStatusEvent, applySubscriptionPaused, applySubscriptionDeleted, executeRenewal, buildSubscriptionRecord } from './_lib/subscriptionRules.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
// Edge runtime → Web Crypto pro ověření podpisu Stripe webhinu
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
    runtime: 'edge',
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
        let order: any = null;
        if (orderId) {
            const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
            order = data;
        }
        const row = buildSubscriptionRecord(sub, order, new Date().toISOString());
        const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'stripe_subscription_id' });
        if (error) console.error('[Stripe Webhook] subscription upsert error:', error.message);
        else console.log(`[Stripe Webhook] subscription ${sub.id} recorded (${row.interval}).`);
    } catch (e: any) {
        console.error('[Stripe Webhook] recordSubscription failed:', e?.message || e);
    }
}

/** Přepočet potřebných lahviček podle příchutí z položek objednávky (mix / flavor-pack). */
/** Zpracuje obnovu předplatného: odpis skladu + objednávka + štítek. Idempotentní dle invoice.id. */
async function processSubscriptionRenewal(subId: string, invoice: Stripe.Invoice) {
    try {
        const nowIso = new Date().toISOString();
        const orderNumber = `BUP${Math.floor(Date.now() / 1000)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const res = await executeRenewal({ supabase, stripe }, subId, invoice, nowIso, orderNumber);

        if (res.outcome === 'not_found') { console.warn(`[Stripe Webhook] renewal: subscription ${subId} not found`); return; }
        if (res.outcome === 'duplicate') { console.log(`[Stripe Webhook] renewal invoice ${invoice.id} already processed — skipping.`); return; }
        if (res.orderInserted) console.log(`[Stripe Webhook] renewal order ${orderNumber} created for subscription ${subId}.`);
        else console.error('[Stripe Webhook] renewal order insert failed.');

        // Zásilkovna – štítek (side-effect specifický pro webhook)
        const di: any = res.order?.delivery_info || {};
        if (res.orderInserted && di.deliveryMethod === 'zasilkovna' && di.packetaPointId) {
            try {
                const packet = await createPacketaPacket({
                    orderNumber, firstName: di.firstName, lastName: di.lastName,
                    email: (res.order as any)?.customer?.email, phone: di.phone, packetaPointId: di.packetaPointId, total: res.order?.total ?? 0,
                });
                await supabase.from('orders').update({ packeta_barcode: packet.barcode, packeta_packet_id: packet.packetId }).eq('id', orderNumber);
            } catch (err) { console.error('[Stripe Webhook] renewal Packeta failed:', err); }
        }
    } catch (e: any) {
        console.error('[Stripe Webhook] processSubscriptionRenewal failed:', e?.message || e);
    }
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // Raw tělo requestu pro ověření podpisu (edge runtime → Web Request)
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
            webhookSecret,
            undefined,
            cryptoProvider
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
            case 'customer.subscription.created': {
                const sub = event.data.object as Stripe.Subscription;
                // Autoritativní záznam (s objednávkou) vzniká přes checkout.session.completed.
                // Tady jen pojistka: když řádek ještě neexistuje, doplň ho (nepřepisuj existující položky).
                const { data: existing } = await supabase.from('subscriptions').select('id').eq('stripe_subscription_id', sub.id).maybeSingle();
                if (!existing) {
                    await upsertSubscriptionRecord(sub.id);
                    console.log(`[Stripe Webhook] subscription ${sub.id} created (fallback record)`);
                } else {
                    console.log(`[Stripe Webhook] subscription ${sub.id} created — record already exists, skipping`);
                }
                break;
            }
            case 'customer.subscription.paused': {
                const sub = event.data.object as Stripe.Subscription;
                await applySubscriptionPaused(supabase, sub.id, new Date().toISOString());
                console.log(`[Stripe Webhook] subscription ${sub.id} paused`);
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const upd = await applySubscriptionStatusEvent(supabase, sub, new Date().toISOString());
                console.log(`[Stripe Webhook] subscription ${sub.id} updated -> ${upd.status}`);
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                await applySubscriptionDeleted(supabase, sub.id, new Date().toISOString());
                console.log(`[Stripe Webhook] subscription ${sub.id} cancelled`);
                break;
            }
            case 'invoice.paid':
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as any)?.id;
                // Idempotentní (processSubscriptionRenewal hlídá last_invoice_id) — bezpečné i když přijdou oba eventy.
                if (isRenewalInvoice(invoice.billing_reason) && subId) {
                    await processSubscriptionRenewal(subId, invoice);
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as any)?.id;
                console.warn(`[Stripe Webhook] invoice.payment_failed pro předplatné ${subId || 'n/a'} (faktura ${invoice.id}) — automatický dunning zatím neřešíme.`);
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
