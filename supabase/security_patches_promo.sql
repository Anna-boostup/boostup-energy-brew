-- ============================================================
-- FIX: Zabezpečení RLS pro tabulku promo_codes
-- Spustit v Supabase SQL editoru (test i produkce)
-- ============================================================

-- Původní pravidlo umožňovalo komukoliv (anonymním uživatelům)
-- přečíst kompletně celou tabulku slevových kódů.
DROP POLICY IF EXISTS "Public read promo codes" ON public.promo_codes;

-- Nové pravidlo: Nepřihlášený uživatel si může ověřit (přečíst)
-- pouze ty kódy, které jsou aktivní, nevyčerpané a nevypršené.
-- (Neuvidí tedy např. připravované kódy pro influencery, které ještě nejsou is_active = true)
CREATE POLICY "Public read active promo codes" ON public.promo_codes FOR SELECT USING (
    is_active = true 
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (valid_until IS NULL OR valid_until > now())
);
