import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Missing subscription ID' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            console.error('Database error during unsubscription:', error);
            return res.status(500).json({ error: 'Failed to update subscription' });
        }

        return res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
    } catch (err) {
        console.error('Unsubscribe error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
