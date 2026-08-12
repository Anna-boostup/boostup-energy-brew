import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const admin = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export const config = { runtime: 'edge' };

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: any, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

/**
 * Veřejné zrušení předplatného přes číslo objednávky + e-mail (pro hosty bez účtu).
 * Ověření vlastnictví = shoda e-mailu s objednávkou. Nevrací peníze (to řeší admin).
 */
export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

    try {
        const body: any = await req.json().catch(() => ({}));
        const orderId = String(body?.orderId || '').trim();
        const email = String(body?.email || '').trim().toLowerCase();
        const action = body?.action;
        const immediate = !!body?.immediate;
        if (!orderId || !email) return json({ error: 'Zadejte číslo objednávky i e-mail.' }, 400);

        const { data: order, error: orderErr } = await admin.from('orders').select('id, customer_email, is_subscription_order').eq('id', orderId).maybeSingle();
        if (orderErr) console.error('[subscription-cancel-public] order read error:', orderErr.message);
        if (!order) return json({ found: false, error: 'Objednávka nenalezena. Zkontrolujte číslo objednávky.' }, 404);
        const orderEmail = String((order as any)?.customer_email || '').toLowerCase();
        if (!orderEmail || orderEmail !== email) return json({ found: false, error: 'E-mail nesouhlasí s objednávkou.' }, 403);

        const { data: subs } = await admin.from('subscriptions').select('*').ilike('email', orderEmail).neq('status', 'cancelled').order('created_at', { ascending: false });
        const sub: any = subs && subs[0];

        if (action === 'lookup') {
            return json({
                found: true,
                isSubscriptionOrder: !!(order as any).is_subscription_order,
                hasActiveSubscription: !!sub,
                nextDate: sub?.next_delivery_date || null,
                pendingCancel: !!sub?.cancel_at_period_end,
            });
        }

        if (action === 'cancel') {
            if (!sub || !sub.stripe_subscription_id) return json({ error: 'K této objednávce nebylo nalezeno aktivní předplatné.' }, 400);
            const nowIso = new Date().toISOString();
            if (immediate) {
                try { await stripe.subscriptions.cancel(sub.stripe_subscription_id); }
                catch (e: any) { return json({ error: 'Zrušení se nezdařilo: ' + (e?.message || '') }, 500); }
                await admin.from('subscriptions').update({ status: 'cancelled', cancelled_at: nowIso, cancel_at_period_end: false, updated_at: nowIso }).eq('id', sub.id);
                return json({ ok: true, message: 'Předplatné bylo zrušeno.' });
            }
            try { await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true }); }
            catch (e: any) { return json({ error: 'Zrušení se nezdařilo: ' + (e?.message || '') }, 500); }
            await admin.from('subscriptions').update({ cancel_at_period_end: true, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Předplatné bude zrušeno ke konci aktuálního období.' });
        }

        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-cancel-public] error:', e?.message || e);
        return json({ error: e?.message || 'Server error' }, 500);
    }
}
