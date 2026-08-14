import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildInvoicePdf } from './_lib/invoicePdf.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// Ověří volajícího z bearer tokenu: vrátí jeho e-mail + zda je admin. null = nepřihlášený.
async function getCaller(token: string): Promise<{ email: string | null; isAdmin: boolean } | null> {
    const uc = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await uc.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return null;
    const { data: prof } = await admin.from('profiles').select('role').eq('id', uid).maybeSingle();
    return { email: data.user?.email ?? null, isAdmin: (prof as any)?.role === 'admin' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const orderId = req.query.orderId as string;
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    // Autentizace: jen přihlášený admin nebo vlastník objednávky (shoda e-mailu).
    const token = String(req.headers.authorization || '').replace('Bearer ', '').trim();
    const caller = token ? await getCaller(token) : null;
    if (!caller) return res.status(401).json({ error: 'Přihlaste se prosím.' });

    try {
        const { data: order, error } = await admin.from('orders').select('*').eq('id', orderId).single();
        if (error || !order) return res.status(404).json({ error: 'Order not found' });

        const ownerEmail = String(order.customer_email || '').toLowerCase();
        if (!caller.isAdmin && (!caller.email || caller.email.toLowerCase() !== ownerEmail)) {
            return res.status(403).json({ error: 'Nemáte oprávnění k této faktuře.' });
        }

        const pdfBytes = await buildInvoicePdf(order);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="faktura-${order.id}.pdf"`);
        return res.status(200).send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
