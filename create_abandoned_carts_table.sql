-- create_abandoned_carts_table.sql

-- 1. Create app_settings table for global toggles
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default setting for abandoned carts
INSERT INTO public.app_settings (key, value)
VALUES ('abandoned_carts_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage app_settings" ON public.app_settings;
CREATE POLICY "Admins manage app_settings" ON public.app_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 2. Create abandoned_carts table
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    cart_data JSONB NOT NULL,
    total_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'lost')),
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and updates (from the API route where we use service_role or anon)
-- Actually, the API route will use the Anon Key or Service Role Key. 
-- Let's make it so anyone can insert/update their own cart by email if they use the API, but to be safe,
-- we'll rely on the serverless function (which uses Anon or Service Role key) to handle the logic.
DROP POLICY IF EXISTS "Anon can insert abandoned_carts" ON public.abandoned_carts;
CREATE POLICY "Anon can insert abandoned_carts" ON public.abandoned_carts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update abandoned_carts" ON public.abandoned_carts;
CREATE POLICY "Anon can update abandoned_carts" ON public.abandoned_carts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins manage abandoned_carts" ON public.abandoned_carts;
CREATE POLICY "Admins manage abandoned_carts" ON public.abandoned_carts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
