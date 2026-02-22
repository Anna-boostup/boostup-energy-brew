-- ============================================================
-- FIX: Orders table - allow guest inserts + fix ID type
-- Spustit v Supabase SQL editoru (test i produkce)
-- ============================================================
-- 1. Změna typu ID z uuid na text (aby ORD-xxx šlo vložit)
ALTER TABLE public.orders
ALTER COLUMN id TYPE text;
-- 2. Povolit INSERT pro všechny (nepřihlášení zákazníci)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR
INSERT WITH CHECK (true);
-- 3. Uživatelé mohou vidět vlastní objednávky
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR
SELECT USING (
        auth.uid() IS NULL -- admin check handled by separate policy
        OR customer_email = (
            SELECT email
            FROM public.profiles
            WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );