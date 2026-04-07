import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Admin for database updates
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

    try {
        const { messageId, replyText, customerEmail, originalSubject, originalMessageId } = req.body;

        if (!messageId || !replyText || !customerEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Send the email via Resend
        const subject = originalSubject.startsWith('Re: ') ? originalSubject : `Re: ${originalSubject}`;
        
        const { data: emailData, error: sendError } = await resend.emails.send({
            from: 'BoostUp <info@drinkboostup.cz>',
            to: [customerEmail],
            subject: subject,
            text: replyText,
            // Add threading headers if we have the original message ID
            headers: originalMessageId ? {
                'In-Reply-To': originalMessageId,
                'References': originalMessageId
            } : undefined
        });

        if (sendError) {
            console.error('Resend error:', sendError);
            return res.status(500).json({ error: 'Failed to send email' });
        }

        // 2. Update the message record in Supabase
        const { error: dbError } = await supabaseAdmin
            .from('messages')
            .update({
                replied_at: new Date().toISOString(),
                reply_text: replyText,
                is_read: true // Mark as read when replied
            })
            .eq('id', messageId);

        if (dbError) {
            console.error('Supabase error:', dbError);
            // We don't return 500 here because the email was already sent
            return res.status(200).json({ 
                success: true, 
                warning: 'Email sent but failed to update database',
                emailId: emailData?.id 
            });
        }

        return res.status(200).json({ success: true, emailId: emailData?.id });
    } catch (error) {
        console.error('Send reply error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
