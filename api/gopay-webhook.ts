export const config = {
    runtime: 'edge',
};

import { createClient } from '@supabase/supabase-js';
import { createPacketaPacket } from './_packeta-helper.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // GoPay sends GET with query params on notification
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('id');
    const parentId = url.searchParams.get('parent_id');

    console.log('[GoPay Webhook] Received notification', { paymentId, parentId });

    if (!paymentId) {
        console.warn('[GoPay Webhook] Missing payment id');
        return new Response('Missing payment id', { status: 400, headers: corsHeaders });
    }

    // Verify payment status with GoPay API
    try {
        const baseUrl = (process.env.GOPAY_API_URL || 'https://gate.gopay.cz/api').replace(/\/$/, '');

        const clientId = process.env.GOPAY_CLIENT_ID;
        const clientSecret = process.env.GOPAY_CLIENT_SECRET;
        const auth = btoa(`${clientId}:${clientSecret}`);

        // Get token
        const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            },
            body: 'grant_type=client_credentials&scope=payment-all'
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Get payment status
        const statusRes = await fetch(`${baseUrl}/payments/payment/${paymentId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const paymentData = await statusRes.json();
        console.log('[GoPay Webhook] Payment status:', paymentData.state, '| Order:', paymentData.order_number);

        if (paymentData.state === 'PAID') {
            const orderNumber = paymentData.order_number;

            // 0. Zjistit aktuální stav objednávky
            const { data: currentOrder, error: fetchError } = await supabaseAdmin
                .from('orders')
                .select('status')
                .eq('id', orderNumber)
                .single();
            
            if (fetchError || !currentOrder) {
                console.error('[GoPay Webhook] Could not fetch order:', fetchError);
                throw new Error('Order not found or DB error');
            }

            if (currentOrder.status !== 'pending') {
                console.log(`[GoPay Webhook] Order ${orderNumber} is already ${currentOrder.status}. Skipping update to avoid downgrading status.`);
                return new Response('OK', { status: 200, headers: corsHeaders });
            }

            // 1. Update status in DB
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ status: 'paid' })
                .eq('id', orderNumber);

            if (updateError) {
                console.error('[GoPay Webhook] DB Update Error:', updateError);
                throw updateError; // Trigger catch to allow GoPay retry
            } else {
                console.log(`[GoPay Webhook] Order ${orderNumber} updated to PAID`);

                // 2. Log payment in message center for admin notification
                try {
                    await supabaseAdmin.from('messages').insert({
                        from_email: paymentData.payer?.contact?.email || 'gopay@boostup.cz',
                        from_name: 'GoPay Platební Brána',
                        subject: `💳 Platba přijata: Objednávka ${orderNumber}`,
                        body_text: `Platba pro objednávku ${orderNumber} byla úspěšně přijata přes GoPay.\nID platby: ${paymentId}\nČástka: ${paymentData.amount / 100} ${paymentData.currency}`,
                        body_html: `<div style="font-family:sans-serif;padding:20px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0">
                            <h2 style="color:#166534;margin-top:0">💳 Platba přijata</h2>
                            <p>Platba pro objednávku <strong>${orderNumber}</strong> byla úspěšně potvrzena.</p>
                            <ul style="list-style:none;padding:0">
                                <li><strong>ID platby:</strong> ${paymentId}</li>
                                <li><strong>Částka:</strong> ${paymentData.amount / 100} ${paymentData.currency}</li>
                                <li><strong>Stav:</strong> PAID</li>
                            </ul>
                        </div>`,
                        is_read: false,
                        metadata: { type: 'payment_received', orderNumber, paymentId, amount: paymentData.amount / 100 }
                    });
                } catch (msgErr) {
                    console.error('[GoPay Webhook] Failed to log message:', msgErr);
                    // Don't throw here, the order status was already updated
                }

                // 3. Zásilkovna - create packet
                const { data: fullOrder } = await supabaseAdmin.from('orders').select('*').eq('id', orderNumber).single();
                if (fullOrder?.delivery_info?.deliveryMethod === 'zasilkovna' && fullOrder?.delivery_info?.packetaPointId && !fullOrder?.packeta_barcode) {
                    try {
                        const packet = await createPacketaPacket({
                            orderNumber: fullOrder.id,
                            firstName: fullOrder.delivery_info.firstName,
                            lastName: fullOrder.delivery_info.lastName,
                            email: fullOrder.customer_email,
                            phone: fullOrder.delivery_info.phone,
                            packetaPointId: fullOrder.delivery_info.packetaPointId,
                            total: fullOrder.total,
                        });
                        await supabaseAdmin.from('orders').update({
                            packeta_barcode: packet.barcode,
                            packeta_packet_id: packet.packetId
                        }).eq('id', orderNumber);
                        console.log(`[GoPay Webhook] Packeta packet created for order ${orderNumber}`);
                    } catch (err) {
                        console.error(`[GoPay Webhook] Packeta packet creation failed for order ${orderNumber}:`, err);
                    }
                }
            }
        }

        // HTTP 200 required by GoPay to confirm successful notification receipt
        return new Response('OK', { status: 200, headers: corsHeaders });

    } catch (err: any) {
        console.error('[GoPay Webhook Error]', err.message);
        // Return 500 to allow GoPay to retry if it's a transient error
        return new Response(`Error: ${err.message}`, { status: 500, headers: corsHeaders });
    }
}
