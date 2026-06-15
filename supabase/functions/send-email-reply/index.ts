import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import nodemailer from "npm:nodemailer";

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
    }

    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { messageId, replyText } = await req.json();

        if (!messageId || !replyText) {
            return new Response(JSON.stringify({ error: 'Missing messageId or replyText' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Fetch original message
        const { data: message, error: messageError } = await supabaseClient
            .from('messages')
            .select('*, mailboxes(*)')
            .eq('id', messageId)
            .single();

        if (messageError || !message) throw new Error('Message not found');

        const mailbox = message.mailboxes;
        if (!mailbox || !mailbox.smtp_host) {
            throw new Error('Mailbox not found or SMTP not configured');
        }

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            host: mailbox.smtp_host,
            port: mailbox.smtp_port,
            secure: mailbox.smtp_port === 465,
            auth: {
                user: mailbox.smtp_user,
                pass: mailbox.smtp_password,
            },
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"${mailbox.email_address}" <${mailbox.email_address}>`,
            to: message.email,
            subject: `Re: ${message.subject}`,
            text: replyText,
            html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${replyText}</div>`,
            inReplyTo: message.message_id_header,
        });

        // Update database to mark as replied
        await supabaseClient
            .from('messages')
            .update({ status: 'replied' }) // Assuming there is a status column, or we can just append the reply to the conversation history. For now just update 'status' to 'replied' or similar if it exists.
            .eq('id', messageId);

        // For a full client, we would insert the sent message into the DB as well,
        // but for now updating the status is enough to show it was replied to.

        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
