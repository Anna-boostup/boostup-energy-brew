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
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: any, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function isAdmin(token: string): Promise<boolean> {
    const uc = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data } = await uc.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return false;
    const { data: prof } = await admin.from('profiles').select('role').eq('id', uid).maybeSingle();
    return (prof as any)?.role === 'admin';
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);
    try {
        const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
        if (!token || !(await isAdmin(token))) return json({ error: 'Forbidden' }, 403);

        const body: any = await req.json().catch(() => ({}));
        const { subscriptionId, action } = body || {};
        const { data: sub } = await admin.from('subscriptions').select('*').eq('id', subscriptionId).maybeSingle();
        if (!sub) return json({ error: 'Předplatné nenalezeno.' }, 404);
        if (!sub.stripe_subscription_id) return json({ error: 'Bez napojení na Stripe.' }, 400);
        const nowIso = new Date().toISOString();

        if (action === 'cancel') {
            await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
            await admin.from('subscriptions').update({ cancel_at_period_end: true, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Zrušení naplánováno ke konci období.' });
        }
        if (action === 'cancel_now') {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id);
            await admin.from('subscriptions').update({ status: 'cancelled', cancelled_at: nowIso, cancel_at_period_end: false, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Předplatné bylo zrušeno.' });
        }
        if (action === 'resume') {
            await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: false });
            await admin.from('subscriptions').update({ cancel_at_period_end: false, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Zrušení zrušeno — předplatné pokračuje.' });
        }
        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-admin] error:', e?.message || e);
        return json({ error: e?.message || 'Server error' }, 500);
    }
}
