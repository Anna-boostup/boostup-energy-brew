-- RLS hardening: analytics_events + abandoned_carts
-- Vytvořeno 2026-07-20. Idempotentní a ODOLNÉ vůči chybějícím tabulkám
-- (každá část se aplikuje jen když daná tabulka existuje).

-- =========================================================
-- 1) analytics_events — zapnout RLS, anon jen insert, admin read
-- =========================================================
DO $$
BEGIN
    IF to_regclass('public.analytics_events') IS NOT NULL THEN
        ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Anon can insert analytics" ON public.analytics_events;
        CREATE POLICY "Anon can insert analytics"
            ON public.analytics_events
            FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Admins can read analytics" ON public.analytics_events;
        CREATE POLICY "Admins can read analytics"
            ON public.analytics_events
            FOR SELECT USING ( public.is_admin() );
    END IF;
END $$;

-- =========================================================
-- 2) abandoned_carts — odebrat příliš široké anon politiky
--    (jen pokud tabulka existuje; zápis běží přes service_role)
-- =========================================================
DO $$
BEGIN
    IF to_regclass('public.abandoned_carts') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Anon can insert abandoned_carts" ON public.abandoned_carts;
        DROP POLICY IF EXISTS "Anon can update abandoned_carts" ON public.abandoned_carts;
        ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
