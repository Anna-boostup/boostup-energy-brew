import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Ochrana proti nechtěnému spouštění (stejně jako ostatní crony).
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 1. Check if the feature is enabled in app_settings
        const { data: settingsData, error: settingsError } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'abandoned_carts_enabled')
            .single();

        // If setting doesn't exist or is false, silently exit
        if (settingsError || !settingsData || settingsData.value !== true && settingsData.value !== 'true') {
            return res.status(200).json({ message: 'Abandoned carts feature is disabled.' });
        }

        // 2. Calculate time boundaries: older than 2 hours, newer than 24 hours
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
        
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // 3. Fetch pending carts
        const { data: carts, error: cartsError } = await supabaseAdmin
            .from('abandoned_carts')
            .select('*')
            .eq('status', 'pending')
            .is('notified_at', null)
            .lte('updated_at', twoHoursAgo.toISOString())
            .gte('updated_at', twentyFourHoursAgo.toISOString())
            .limit(50); // Process in batches to avoid Vercel timeouts

        if (cartsError) throw cartsError;
        
        if (!carts || carts.length === 0) {
            return res.status(200).json({ message: 'No abandoned carts to process.' });
        }

        let sentCount = 0;

        // 4. Send emails
        for (const cart of carts) {
            const { email, cart_data, total_price, id } = cart;
            
            // Minimal validation to ensure cart isn't empty
            if (!cart_data || cart_data.length === 0) continue;

            const BASE_URL = process.env.VITE_SITE_URL || 'https://drinkboostup.cz';
            const checkoutUrl = `${BASE_URL}/checkout`;

            // Simple HTML Template for the reminder
            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
                    <h2 style="color: #3a572c;">Nezapomněli jste na něco? ⚡</h2>
                    <p>Dobrý den,</p>
                    <p>všimli jsme si, že jste u nás v pokladně zanechali několik skvělých produktů. Byla by škoda o ně přijít!</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Váš košík na vás stále čeká:</h3>
                        <p style="font-weight: bold; font-size: 18px;">Celková hodnota: ${total_price} Kč</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${checkoutUrl}" style="background-color: #3a572c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Dokončit nákup</a>
                    </div>
                    <p style="font-size: 12px; color: #6b7280;">Pokud jste již nákup dokončili nebo zprávu dostali omylem, můžete ji ignorovat.</p>
                </div>
            `;

            try {
                await resend.emails.send({
                    from: 'BoostUp <info@drinkboostup.cz>',
                    to: email,
                    subject: 'Nezapomněli jste něco v košíku? 🛒',
                    html: htmlContent
                });

                // 5. Mark as notified
                await supabaseAdmin
                    .from('abandoned_carts')
                    .update({ notified_at: new Date().toISOString() })
                    .eq('id', id);

                sentCount++;
            } catch (err) {
                console.error(`Failed to send reminder to ${email}`, err);
            }
        }

        return res.status(200).json({ success: true, sent: sentCount });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
