import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { resolveShippingCountry, shippingForMethod, convertToCurrency } from './secure-calculator.js';
import { checkModifiable, performPauseResume, performCancel, performChangeDate, performChangeShipping } from './_lib/subscriptionRules.js';

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


function json(body: any, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

        // Přerušení / obnovení předplatného — vratné akce, bez pravidla „5 dní předem".
        if (action === 'pause' || action === 'resume') {
            const r = await performPauseResume(stripe, admin, sub, action, new Date().toISOString());
            return json(r.body, r.status);
        }

        // Společná pravidla: nezrušené, napojené na platby, min. 5 dní před odesláním.
        const modGuard = checkModifiable(sub);
        if (!modGuard.ok) return json({ error: modGuard.error }, modGuard.status);

        const nowIso = new Date().toISOString();

        if (action === 'cancel') {
            const r = await performCancel(stripe, admin, sub, nowIso);
            return json(r.body, r.status);
        }

        if (action === 'change_date') {
            const r = await performChangeDate(stripe, admin, sub, payload?.date, nowIso);
            return json(r.body, r.status);
        }

        if (action === 'change_shipping') {
            const r = await performChangeShipping({ stripe, admin, resolveShippingCountry, shippingForMethod, convertToCurrency }, sub, payload?.method, nowIso);
            return json(r.body, r.status);
        }

        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-manage] error:', e?.message || e);
        return json({ error: e?.message || 'Server error' }, 500);
    }
}
