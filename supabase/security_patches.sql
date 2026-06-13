-- ============================================================
-- FIX: Zabezpečení RLS pro tabulku orders
-- Spustit v Supabase SQL editoru (test i produkce)
-- ============================================================

-- Původní pravidlo bylo příliš volné a umožňovalo komukoliv vytvořit
-- objednávku s libovolným statusem, např. 'paid', čímž by šlo
-- obejít platební bránu.

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Vytvoření nového a bezpečnějšího pravidla
CREATE POLICY "Anyone can insert pending orders" ON public.orders FOR
INSERT WITH CHECK (
  -- Uživatel může vložit objednávku pouze se statusem 'pending'
  -- (Zaplacení nebo změnu stavu pak řeší výhradně server-side Edge funkce s admin právy)
  status = 'pending'
);

-- Note: Zprávy (messages) a odběratelé newsletteru (newsletter_subscriptions)
-- jsou chráněné na úrovni aplikace, ale v budoucnu by bylo ideální
-- před ně přidat CAPTCHU a kontrolovat token v Supabase Edge funkci,
-- než umožnit přímý INSERT pro `Anon`.
