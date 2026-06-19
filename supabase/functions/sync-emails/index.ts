import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ImapFlow } from "npm:imapflow";
import { simpleParser } from "npm:mailparser";

serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Requires service role to read passwords
            { global: { headers: { Authorization: authHeader } } }
        );

        // Fetch active mailboxes with decrypted passwords securely
        const { data: mailboxes, error: mailboxesError } = await supabaseClient
            .rpc('get_decrypted_mailboxes');

        if (mailboxesError) throw mailboxesError;

        let processedCount = 0;

        for (const mailbox of mailboxes) {
            console.log(`Syncing mailbox: ${mailbox.email_address}`);
            
            const client = new ImapFlow({
                host: mailbox.imap_host,
                port: mailbox.imap_port,
                secure: mailbox.imap_port === 993,
                auth: {
                    user: mailbox.imap_user,
                    pass: mailbox.imap_password
                },
                logger: false
            });

            try {
                await client.connect();
                const lock = await client.getMailboxLock('INBOX');
                
                try {
                    // Fetch unseen messages
                    const messages = client.fetch({ seen: false }, { source: true, uid: true });
                    
                    for await (const msg of messages) {
                        const parsed = await simpleParser(msg.source);
                        
                        // Handle attachments
                        const savedAttachments = [];
                        for (const att of parsed.attachments) {
                            const fileName = `${mailbox.id}/${Date.now()}_${att.filename}`;
                            
                            const { error: uploadError } = await supabaseClient
                                .storage
                                .from('email_attachments')
                                .upload(fileName, att.content, {
                                    contentType: att.contentType
                                });
                                
                            if (!uploadError) {
                                const { data: urlData } = supabaseClient
                                    .storage
                                    .from('email_attachments')
                                    .getPublicUrl(fileName);
                                    
                                savedAttachments.push({
                                    filename: att.filename,
                                    url: urlData.publicUrl,
                                    contentType: att.contentType
                                });
                            }
                        }

                        // Save message to DB
                        const { error: insertError } = await supabaseClient
                            .from('messages')
                            .insert({
                                mailbox_id: mailbox.id,
                                email: parsed.from?.value[0]?.address,
                                name: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address,
                                subject: parsed.subject || 'Bez předmětu',
                                message: parsed.text || parsed.html || '',
                                attachments: savedAttachments,
                                created_at: parsed.date || new Date().toISOString(),
                            });

                        if (!insertError) {
                            // Mark as seen
                            await client.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
                            processedCount++;
                        }
                    }
                } finally {
                    lock.release();
                }
                
                // Update last synced
                await supabaseClient
                    .from('mailboxes')
                    .update({ last_synced_at: new Date().toISOString() })
                    .eq('id', mailbox.id);
                    
            } catch (err) {
                console.error(`Error syncing mailbox ${mailbox.email_address}:`, err);
            } finally {
                await client.logout();
            }
        }

        return new Response(JSON.stringify({ success: true, processed: processedCount }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
