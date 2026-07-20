-- Vytvoření tabulky abandoned_carts (opuštěné košíky) + BEZPEČNÉ RLS.
-- Funkci řídí přepínač 'abandoned_carts_enabled' v app_settings (admin → Dashboard).
-- Ve výchozím stavu VYPNUTO. Tabulka musí existovat, aby šla funkce zapnout.
-- Zápis košíků běží přes serverovou routu /api/abandoned-cart (service_role, obchází RLS),
-- takže NEpřidáváme žádné anon politiky (na rozdíl od starého create_abandoned_carts_table.sql).

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

-- Index pro cron dotaz (pending + nenotifikované + podle času)
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status_updated
    ON public.abandoned_carts (status, notified_at, updated_at);

-- RLS: přístup má jen admin; zápis obstarává service_role serverovou routou.
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage abandoned_carts" ON public.abandoned_carts;
CREATE POLICY "Admins manage abandoned_carts" ON public.abandoned_carts
    FOR ALL USING ( public.is_admin() );

-- Přepínač funkce: výchozí VYPNUTO (nepřepíše, pokud už hodnota existuje).
INSERT INTO public.app_settings (key, value)
VALUES ('abandoned_carts_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
