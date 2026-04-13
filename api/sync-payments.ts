import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

async function getGoPayToken() {
    const baseUrl = (process.env.GOPAY_API_URL || 'https://gate.gopay.cz/api').replace(/\/$/, '');
    const clientId = process.env.GOPAY_CLIENT_ID;
    const clientSecret = process.env.GOPAY_CLIENT_SECRET;
    const auth = btoa(`${clientId}:${clientSecret}`);

    const res = await fetch(`${baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials&scope=payment-all'
    });

    if (!res.ok) throw new Error('Failed to get GoPay token');
    const data = await res.json();
    return data.access_token;
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        console.log('[Sync Payments] Starting synchronization logic...');
        
        // 1. Fetch all pending orders
        const { data: pendingOrders, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .limit(50); // Peace of mind limit

        if (fetchError) throw fetchError;
        if (!pendingOrders || pendingOrders.length === 0) {
            return new Response(JSON.stringify({ message: 'No pending orders to sync', synced: 0 }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`[Sync Payments] Found ${pendingOrders.length} pending orders.`);
        
        let syncedCount = 0;
        let gopayToken = '';

        for (const order of pendingOrders) {
            const method = order.delivery_info?.paymentMethod;
            let isPaid = false;

            try {
                // --- STRIPE SYNC ---
                if (method === 'stripe' || order.is_subscription_order) {
                    // Search for successful checkout sessions or payment intents with this orderId
                    const sessions = await stripe.checkout.sessions.list({
                        limit: 5,
                    });
                    
                    // Note: We can also search by metadata if we use a more expensive search, 
                    // but usually direct check is safer if we store the session ID.
                    // For now, let's search sessions for the orderId in metadata
                    const matchingSession = sessions.data.find(s => s.metadata?.orderId === order.id);
                    
                    if (matchingSession && matchingSession.payment_status === 'paid') {
                        isPaid = true;
                        console.log(`[Sync Payments] Order ${order.id} found PAID on Stripe.`);
                    }
                } 
                // --- GOPAY SYNC ---
                else if (method === 'card' || method === 'gopay') {
                    const paymentId = order.delivery_info?.gopayPaymentId;
                    
                    if (paymentId) {
                        if (!gopayToken) gopayToken = await getGoPayToken();
                        const baseUrl = (process.env.GOPAY_API_URL || 'https://gate.gopay.cz/api').replace(/\/$/, '');
                        
                        const statusRes = await fetch(`${baseUrl}/payments/payment/${paymentId}`, {
                            headers: {
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${gopayToken}`
                            }
                        });
                        
                        if (statusRes.ok) {
                            const paymentData = await statusRes.json();
                            if (paymentData.state === 'PAID') {
                                isPaid = true;
                                console.log(`[Sync Payments] Order ${order.id} found PAID on GoPay.`);
                            }
                        }
                    }
                }

                // 2. Perform Update if paid
                if (isPaid) {
                    const { error: updateError } = await supabaseAdmin
                        .from('orders')
                        .update({ status: 'paid' })
                        .eq('id', order.id);
                    
                    if (!updateError) {
                        syncedCount++;
                        // Also log in messages like webhooks do?
                        // (Optional, maybe too spammy for batch sync)
                    }
                }
            } catch (err) {
                console.error(`[Sync Payments] Error checking order ${order.id}:`, err);
            }
        }

        return new Response(JSON.stringify({ 
            message: `Sync complete. Synced ${syncedCount} orders.`, 
            synced: syncedCount 
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[Sync Payments Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
