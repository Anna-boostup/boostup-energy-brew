import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const admin = createClient(supabaseUrl, serviceKey);

export const config = { runtime: 'edge' };
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: any, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function getAdmin(token: string): Promise<{ id: string; email: string | null } | null> {
    const uc = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data } = await uc.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return null;
    const { data: prof } = await admin.from('profiles').select('role').eq('id', uid).maybeSingle();
    if ((prof as any)?.role !== 'admin') return null;
    return { id: uid, email: data?.user?.email ?? null };
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);
    try {
        const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
        const adminUser = token ? await getAdmin(token) : null;
        if (!adminUser) return json({ error: 'Forbidden' }, 403);

        const body: any = await req.json().catch(() => ({}));
        const { subscriptionId, action, reason } = body || {};
        const { data: sub } = await admin.from('subscriptions').select('*').eq('id', subscriptionId).maybeSingle();
        if (!sub) return json({ error: 'Předplatné nenalezeno.' }, 404);
        if (!sub.stripe_subscription_id) return json({ error: 'Bez napojení na Stripe.' }, 400);
        const nowIso = new Date().toISOString();

        // Auditní záznam adminské akce (kdo / kdy / co / komu / proč). Best-effort — nesmí shodit akci.
        const logAction = async (act: string) => {
            try {
                await admin.from('subscription_admin_log').insert({
                    admin_id: adminUser.id,
                    admin_email: adminUser.email,
                    action: act,
                    subscription_id: sub.id,
                    stripe_subscription_id: sub.stripe_subscription_id,
                    customer_email: sub.email ?? null,
                    reason: (typeof reason === 'string' && reason.trim()) ? reason.trim() : null,
                });
            } catch (e: any) {
                console.error('[subscription-admin] audit log failed:', e?.message || e);
            }
        };

        // Stripe nedovolí zrušit (ani naplánovat zrušení) předplatné, které má ještě OTEVŘENOU
        // checkout session (stav incomplete — typicky nedokončený/roztestovaný nákup). Správné
        // řešení dle Stripu je tu session expirovat; tím se incomplete předplatné zruší.
        const isCheckoutBlock = (m: string) => /checkout session|incomplete/i.test(m || '');
        const clearIncomplete = async () => {
            const sessions = await stripe.checkout.sessions.list({ subscription: sub.stripe_subscription_id, status: 'open', limit: 20 });
            for (const cs of sessions.data) { try { await stripe.checkout.sessions.expire(cs.id); } catch { /* ignore */ } }
            try { await stripe.subscriptions.cancel(sub.stripe_subscription_id); } catch { /* po expiraci už je fakticky zrušené */ }
        };
        const markCancelled = () => admin.from('subscriptions')
            .update({ status: 'cancelled', cancelled_at: nowIso, cancel_at_period_end: false, updated_at: nowIso })
            .eq('id', sub.id);

        if (action === 'cancel') {
            try {
                await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
                await admin.from('subscriptions').update({ cancel_at_period_end: true, updated_at: nowIso }).eq('id', sub.id);
                await logAction('cancel');
                return json({ ok: true, message: 'Zrušení naplánováno ke konci období.' });
            } catch (err: any) {
                if (!isCheckoutBlock(String(err?.message || ''))) throw err;
                await clearIncomplete();
                await markCancelled();
                await logAction('cancel_incomplete');
                return json({ ok: true, message: 'Předplatné nemělo dokončenou platbu — zrušeno okamžitě.' });
            }
        }
        if (action === 'cancel_now') {
            try {
                await stripe.subscriptions.cancel(sub.stripe_subscription_id);
            } catch (err: any) {
                if (!isCheckoutBlock(String(err?.message || ''))) throw err;
                await clearIncomplete();
            }
            await markCancelled();
            await logAction('cancel_now');
            return json({ ok: true, message: 'Předplatné bylo zrušeno.' });
        }
        if (action === 'resume') {
            await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: false });
            await admin.from('subscriptions').update({ cancel_at_period_end: false, updated_at: nowIso }).eq('id', sub.id);
            await logAction('resume');
            return json({ ok: true, message: 'Zrušení zrušeno — předplatné pokračuje.' });
        }
        return json({ error: 'Neznámá akce.' }, 400);
    } catch (e: any) {
        console.error('[subscription-admin] error:', e?.message || e);
        return json({ error: 'Akci se nepodařilo dokončit. Zkuste to prosím znovu, nebo ji proveďte přímo ve Stripe.' }, 500);
    }
}
