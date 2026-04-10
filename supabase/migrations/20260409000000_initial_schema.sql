-- 20260409000000_initial_schema.sql
-- Consolidated Initial Schema Migration

-- 1. PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read promo codes" ON public.promo_codes;
CREATE POLICY "Public read promo codes" ON public.promo_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. MESSAGES (Contact Form)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_email TEXT NOT NULL,
    from_name TEXT,
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can insert messages" ON public.messages;
CREATE POLICY "Anon can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage messages" ON public.messages;
CREATE POLICY "Admins manage messages" ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can subscribe" ON public.newsletter_subscriptions;
CREATE POLICY "Anon can subscribe" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Admins manage newsletter" ON public.newsletter_subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. EMAIL TEMPLATES
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage templates" ON public.email_templates;
CREATE POLICY "Admins manage templates" ON public.email_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. MANUFACTURE INVENTORY
CREATE TABLE IF NOT EXISTS public.manufacture_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    min_quantity NUMERIC DEFAULT 0,
    warning_quantity NUMERIC DEFAULT 0,
    notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.manufacture_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage manufacture_inventory" ON public.manufacture_inventory;
CREATE POLICY "Admins can manage manufacture_inventory" ON public.manufacture_inventory FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. MANUFACTURE MOVEMENTS
CREATE TABLE IF NOT EXISTS public.manufacture_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID REFERENCES public.manufacture_inventory(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('restock', 'use', 'correction')),
    amount NUMERIC NOT NULL,
    note TEXT,
    user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.manufacture_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage manufacture_movements" ON public.manufacture_movements;
CREATE POLICY "Admins can manage manufacture_movements" ON public.manufacture_movements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. MANUFACTURE HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_manufacture_movement(
    p_material_id UUID,
    p_type TEXT,
    p_amount NUMERIC,
    p_note TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.profiles WHERE id = auth.uid();
    INSERT INTO public.manufacture_movements (material_id, type, amount, note, user_id)
    VALUES (p_material_id, p_type, p_amount, p_note, v_user_id);
    UPDATE public.manufacture_inventory
    SET quantity = quantity + p_amount
    WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. PROFILES EXTENSION
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'company'));
UPDATE public.profiles SET account_type = 'personal' WHERE account_type IS NULL;
