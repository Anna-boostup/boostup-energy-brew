-- Vytvoření tabulky pro zákaznické recenze
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_sku TEXT REFERENCES public.inventory(sku) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pro product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Všichni mohou číst schválené recenze"
    ON public.product_reviews
    FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Přihlášení mohou vkládat recenze"
    ON public.product_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admini vidí všechny recenze"
    ON public.product_reviews
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));


-- Vytvoření tabulky pro doporučovací program (referrals)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    discount_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    reward_amount NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pro referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uživatel vidí pouze svá doporučení"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Admini spravují všechna doporučení"
    ON public.referrals
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Výchozí hodnoty pro nová nastavení v app_settings
INSERT INTO public.app_settings (key, value)
VALUES 
    ('referrals_enabled', 'false'),
    ('reviews_enabled', 'false'),
    ('upsell_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
