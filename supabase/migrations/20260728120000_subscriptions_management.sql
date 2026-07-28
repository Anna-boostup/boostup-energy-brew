-- =========================================================================
-- Subscriptions management — Fáze 1 (základ)
-- Rozšíření public.subscriptions o Stripe napojení, dopravu, expediční
-- datum a pole pro pravidla (změna 1×/kal. měsíc, min. 5 dní předem),
-- zrušení ke konci období a podporu předplatného hosta (bez profilu).
--
-- Aplikovat RUČNĚ v Supabase SQL editoru — NEJDŘÍV DEV, po ověření PROD.
-- Idempotentní (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =========================================================================

-- 0) Základní tabulka (kdyby ještě neexistovala)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
    interval text NOT NULL CHECK (interval IN ('monthly','bimonthly')),
    product_handle text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    next_delivery_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 1) Host bez profilu → user_id smí být NULL
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- 2) Nová pole
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS stripe_subscription_id  text,
    ADD COLUMN IF NOT EXISTS stripe_customer_id      text,
    ADD COLUMN IF NOT EXISTS email                   text,
    ADD COLUMN IF NOT EXISTS shipping_method         text,
    ADD COLUMN IF NOT EXISTS shipping_price          numeric(10,2),
    ADD COLUMN IF NOT EXISTS shipping_currency       text DEFAULT 'CZK',
    ADD COLUMN IF NOT EXISTS delivery_info           jsonb,
    ADD COLUMN IF NOT EXISTS uses_global_date        boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS current_period_end      timestamptz,
    ADD COLUMN IF NOT EXISTS cancel_at_period_end    boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS cancelled_at            timestamptz,
    ADD COLUMN IF NOT EXISTS last_shipping_change_at timestamptz,
    ADD COLUMN IF NOT EXISTS last_date_change_at     timestamptz;

-- 3) Indexy
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_sub_uidx
    ON public.subscriptions (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS subscriptions_email_idx  ON public.subscriptions (lower(email));
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx   ON public.subscriptions (user_id);

-- 4) RLS
-- Uživatel: jen svá předplatná (čtení + úpravy)
DROP POLICY IF EXISTS "Users can view own subscriptions"   ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"   ON public.subscriptions
    FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING ( auth.uid() = user_id );

-- Admin: plná správa všech (i hostů)
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
    FOR ALL USING ( (select public.is_admin()) ) WITH CHECK ( (select public.is_admin()) );

-- Pozn.: zakládání/aktualizaci předplatného dělá Stripe webhook přes service
-- role (obchází RLS). Uživatelský INSERT je proto odebrán.

-- 5) Komentáře
COMMENT ON COLUMN public.subscriptions.next_delivery_date   IS 'Datum odeslání zásilky (dispatch).';
COMMENT ON COLUMN public.subscriptions.uses_global_date     IS 'true = globální expediční den (admin); false = individuální datum zákazníka.';
COMMENT ON COLUMN public.subscriptions.shipping_price       IS 'Zamčená cena dopravy (grandfathering při zdražení).';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Zrušení naplánované ke konci aktuálního období.';
