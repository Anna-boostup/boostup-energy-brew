import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Admin for system-level operations
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

/**
 * Resend Inbound Webhook Handler
 * Documentation: https://resend.com/docs/dashboard/webhooks/inbound-emails
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;

        // Resend sends a webhook with type "email.received"
        if (payload.type !== 'email.received') {
            return res.status(200).json({ status: 'ignored', message: 'Not an inbound email event' });
        }

        const { email_id, from, subject } = payload.data;

        if (!email_id) {
            return res.status(400).json({ error: 'Missing email_id' });
        }

        // 1. Fetch the full email content from Resend API
        // This is necessary because the webhook payload only contains metadata
        const { data: emailData, error: fetchError } = await resend.emails.get(email_id);

        if (fetchError || !emailData) {
            console.error('Error fetching email data from Resend:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch email content' });
        }

        // 2. Parse details
        const fromEmail = emailData.from || from || 'unknown@sender.com';
        const fromName = fromEmail.split('<')[0]?.trim() || '';
        const mailSubject = emailData.subject || subject || '(Bez předmětu)';
        const bodyText = emailData.text || '';
        const bodyHtml = emailData.html || '';

        // 3. Store in Supabase
        const { error: dbError } = await supabaseAdmin
            .from('messages')
            .insert([
                {
                    from_email: fromEmail,
                    from_name: fromName,
                    subject: mailSubject,
                    body_text: bodyText,
                    body_html: bodyHtml,
                    is_read: false,
                    metadata: {
                        resend_email_id: email_id,
                        to: emailData.to,
                        created_at: payload.created_at
                    }
                }
            ]);

        if (dbError) {
            console.error('Supabase error saving message:', dbError);
            return res.status(500).json({ error: 'Failed to save message to database' });
        }

        return res.status(200).json({ status: 'success', message: 'Email received and stored via Resend' });
    } catch (error) {
        console.error('Resend inbound webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
