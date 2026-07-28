import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const admin = createClient(supabaseUrl, serviceKey);

export const config = { runtime: 'nodejs' };

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MIN_DAYS_BEFORE = 5;

function json(body: any, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function daysUntil(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((d.getTime() - Date.now()) / 86400000);
}
function changedThisMonth(iso: string | null | undefined): boolean {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

    try {
        const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
        if (!token) return json({ error: 'Unauthorized' }, 401);

        const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
        const { data: userData, error: userErr } = await userClient.auth.getUser();
        const user = userData?.user;
        if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

        const body: any = await req.json().catch(() => ({}));
        const { subscriptionId, action, payload } = body || {};
        if (!subscriptionId || !action) return json({ error: 'Missing subscriptionId/action' }, 400);

        const { data: sub } = await admin.from('subscriptions').select('*').eq('id', subscriptionId).maybeSingle();
        if (!sub) return json({ error: 'Subscription not found' }, 404);
        if (sub.user_id !== user.id) return json({ error: 'Forbidden' }, 403);
        if (sub.status === 'cancelled') return json({ error: 'Předplatné je již zrušené.' }, 400);
        if (!sub.stripe_subscription_id) return json({ error: 'Předplatné nemá napojení na platby.' }, 400);

        // Pravidlo společné pro všechny změny: nejpozději 5 dní před odesláním.
        const dleft = daysUntil(sub.next_delivery_date);
        if (dleft !== null && dleft < MIN_DAYS_BEFORE) {
            return json({ error: `Změny lze provést nejpozději ${MIN_DAYS_BEFORE} dní před odesláním.` }, 400);
        }

        const nowIso = new Date().toISOString();

        if (action === 'cancel') {
            await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
            await admin.from('subscriptions').update({ cancel_at_period_end: true, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Předplatné bude zrušeno ke konci aktuálního období.' });
        }

        if (action === 'change_date') {
            if (changedThisMonth(sub.last_date_change_at)) {
                return json({ error: 'Datum odeslání lze změnit jen jednou za kalendářní měsíc.' }, 400);
            }
            const newDate: string = payload?.date;
            const nd = daysUntil(newDate);
            if (nd === null || nd < MIN_DAYS_BEFORE) {
                return json({ error: `Nové datum musí být alespoň ${MIN_DAYS_BEFORE} dní od dneška.` }, 400);
            }
            const anchor = Math.floor(new Date(newDate + 'T00:00:00').getTime() / 1000);
            // Posun dalšího stržení na nové datum (svázané) — trial_end přeplánuje fakturaci.
            await stripe.subscriptions.update(sub.stripe_subscription_id, { trial_end: anchor, proration_behavior: 'none' });
            await admin.from('subscriptions').update({
                next_delivery_date: newDate,
                uses_global_date: false,
                last_date_change_at: nowIso,
                updated_at: nowIso,
            }).eq('id', sub.id);
            return json({ ok: true, message: 'Datum odeslání i platby bylo přesunuto.' });
        }

        if (action === 'change_shipping') {
            // Implementace v navazujícím kroku (přepočet ceny + úprava položky ve Stripe).
            return json({ error: 'Změna dopravy bude dostupná brzy.' }, 501);
        }

        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-manage] error:', e?.message || e);
        return json({ error: e?.message || 'Server error' }, 500);
    }
}
