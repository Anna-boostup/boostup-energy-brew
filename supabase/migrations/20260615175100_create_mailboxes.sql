-- Migration to create mailboxes and update messages for Email Client

-- Create mailboxes table
CREATE TABLE IF NOT EXISTS public.mailboxes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_address TEXT NOT NULL UNIQUE,
    imap_host TEXT NOT NULL,
    imap_port INTEGER NOT NULL DEFAULT 993,
    imap_user TEXT NOT NULL,
    imap_password TEXT NOT NULL, -- In production, consider encrypting this or using Supabase Vault
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 465,
    smtp_user TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'general' CHECK (purpose IN ('general', 'invoices')),
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for mailboxes
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage mailboxes" ON public.mailboxes;
CREATE POLICY "Admins can manage mailboxes" ON public.mailboxes 
    FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Update messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS mailbox_id UUID REFERENCES public.mailboxes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create Storage bucket for email attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email_attachments', 'email_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Admins can manage email attachments" ON storage.objects;
CREATE POLICY "Admins can manage email attachments"
ON storage.objects FOR ALL
USING (
  bucket_id = 'email_attachments' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can read email attachments" ON storage.objects;
CREATE POLICY "Admins can read email attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'email_attachments' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Also add an index to mailboxes
CREATE INDEX IF NOT EXISTS idx_mailboxes_purpose ON public.mailboxes(purpose);
