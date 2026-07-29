import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { resolveShippingCountry, shippingForMethod, convertToCurrency } from './secure-calculator.js';
import { totalBottles, checkModifiable, checkDateChange, checkShippingChange } from './_lib/subscriptionRules.js';

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
        // Společná pravidla: nezrušené, napojené na platby, min. 5 dní před odesláním.
        const modGuard = checkModifiable(sub);
        if (!modGuard.ok) return json({ error: modGuard.error }, modGuard.status);

        const nowIso = new Date().toISOString();

        if (action === 'cancel') {
            await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
            await admin.from('subscriptions').update({ cancel_at_period_end: true, updated_at: nowIso }).eq('id', sub.id);
            return json({ ok: true, message: 'Předplatné bude zrušeno ke konci aktuálního období.' });
        }

        if (action === 'change_date') {
            const newDate: string = payload?.date;
            const dateGuard = checkDateChange(sub, newDate);
            if (!dateGuard.ok) return json({ error: dateGuard.error }, dateGuard.status);
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
            const method = payload?.method;
            const shipGuard = checkShippingChange(sub, method);
            if (!shipGuard.ok) return json({ error: shipGuard.error }, shipGuard.status);
            const cfg: any = await resolveShippingCountry({ delivery_info: sub.delivery_info });
            const items: any[] = Array.isArray(sub.items) ? sub.items : [];
            const bottles = totalBottles(items);
            const subtotalCzk = items.reduce((a: number, it: any) => a + Number(it.price) * Number(it.quantity), 0);
            const subtotalCur = convertToCurrency(subtotalCzk, cfg);
            const tiers = cfg?.methods ? cfg.methods[method] : undefined;
            if (!Array.isArray(tiers) || tiers.length === 0) {
                return json({ error: 'Tento způsob dopravy není pro danou zemi dostupný.' }, 400);
            }
            const shipCur = shippingForMethod(cfg, method, bottles, subtotalCur, false);
            const currency = (cfg?.stripeCurrency || 'czk');
            const intervalCount = sub.interval === 'bimonthly' ? 2 : 1;

            const full = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, { expand: ['items.data.price.product'] });
            const shipItem = full.items.data.find((it: any) => {
                const prod: any = it?.price?.product;
                return prod && typeof prod === 'object' && prod.name === 'Doprava';
            });

            if (shipCur > 0) {
                const priceData: any = { currency, product_data: { name: 'Doprava' }, unit_amount: Math.round(shipCur * 100), recurring: { interval: 'month', interval_count: intervalCount } };
                if (shipItem) {
                    await stripe.subscriptions.update(sub.stripe_subscription_id, { items: [{ id: shipItem.id, price_data: priceData }], proration_behavior: 'none' });
                } else {
                    await stripe.subscriptions.update(sub.stripe_subscription_id, { items: [{ price_data: priceData }], proration_behavior: 'none' });
                }
            } else if (shipItem) {
                await stripe.subscriptions.update(sub.stripe_subscription_id, { items: [{ id: shipItem.id, deleted: true }], proration_behavior: 'none' });
            }

            await admin.from('subscriptions').update({
                shipping_method: method,
                shipping_price: shipCur,
                shipping_currency: currency,
                last_shipping_change_at: nowIso,
                updated_at: nowIso,
            }).eq('id', sub.id);
            return json({ ok: true, message: 'Způsob dopravy byl změněn.' });
        }

        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-manage] error:', e?.message || e);
        return json({ error: e?.message || 'Server error' }, 500);
    }
}
