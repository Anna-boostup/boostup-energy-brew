export const config = {
    runtime: 'edge',
};

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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
