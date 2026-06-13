import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, cart, total, action = 'upsert' } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        if (action === 'recover') {
            // Mark cart as recovered
            const { error } = await supabaseAdmin
                .from('abandoned_carts')
                .update({ 
                    status: 'recovered',
                    updated_at: new Date().toISOString()
                })
                .eq('email', email)
                .eq('status', 'pending');

            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Cart recovered' });
        } 
        
        if (action === 'upsert') {
            // Upsert the cart (Create if not exists, or update if pending)
            // We only want to update if it's pending, but Supabase upsert requires primary key or unique constraint.
            // Since email is UNIQUE, upsert will overwrite the existing record.
            // If they had a recovered cart in the past and they start a new one, we need to reset status to pending.
            const { error } = await supabaseAdmin
                .from('abandoned_carts')
                .upsert({
                    email,
                    cart_data: cart || [],
                    total_price: total || 0,
                    status: 'pending',
                    notified_at: null, // reset notification timestamp if they update their cart
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' });

            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Cart tracked' });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error: any) {
        console.error('Error tracking abandoned cart:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
