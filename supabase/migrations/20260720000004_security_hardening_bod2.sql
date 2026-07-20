-- BOD 2 (dev security): search_path na crypto funkce, EXECUTE revoke na trigger
-- SECURITY DEFINER funkce, deduplikace veřejných INSERT politik.
-- Cíl: dev projekt gmbxcqqmnlsjvqghaxmu.
-- Objednávek/checkoutu se NEDOTÝKÁ: handle_stock_movement (anon guest checkout)
-- a is_admin (RLS) ponechány BEZE ZMĚNY.

-- =========================================================
-- 1) search_path na 4 crypto/decrypt funkce
--    (plně kvalifikují public.*, pgcrypto je v public → nulová změna chování)
-- =========================================================
ALTER FUNCTION public.encrypt_mailbox_password()        SET search_path = public, pg_temp;
ALTER FUNCTION public.get_decrypted_mailboxes()         SET search_path = public, pg_temp;
ALTER FUNCTION public.encrypt_system_settings_keys()    SET search_path = public, pg_temp;
ALTER FUNCTION public.get_decrypted_ai_settings()       SET search_path = public, pg_temp;

-- =========================================================
-- 2) EXECUTE revoke na SECURITY DEFINER trigger funkce.
--    Triggery se spouští bez EXECUTE práva volajícího → nerozbije to
--    šifrování schránek/AI klíčů ani registraci uživatele.
-- =========================================================
REVOKE ALL ON FUNCTION public.encrypt_mailbox_password()     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.encrypt_system_settings_keys() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user()              FROM PUBLIC, anon, authenticated;

-- handle_manufacture_movement: volá admin (authenticated) přes RPC → anon nepotřebuje.
-- Ponecháváme authenticated, odebíráme jen anon + public.
REVOKE ALL ON FUNCTION public.handle_manufacture_movement(uuid, text, numeric, text) FROM PUBLIC, anon;

-- =========================================================
-- 3) Deduplikace veřejných INSERT politik (zdvojené always-true).
--    Necháváme vždy JEDNU anon-insert politiku (analytics tracking, newsletter).
-- =========================================================
-- analytics_events: bod 1 už vytvořil "Anon can insert analytics" → smazat starou zdvojenou
DROP POLICY IF EXISTS "Allow public insert for analytics" ON public.analytics_events;

-- optimalizace admin read (obalit is_admin do select → řeší i budoucí auth_rls_initplan)
DROP POLICY IF EXISTS "Admins can read analytics" ON public.analytics_events;
CREATE POLICY "Admins can read analytics" ON public.analytics_events
    FOR SELECT USING ( (select public.is_admin()) );

-- newsletter_subscriptions: ponechat "Anon can subscribe", smazat zdvojenou
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.newsletter_subscriptions;
