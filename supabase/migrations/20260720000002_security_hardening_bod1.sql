-- BOD 1 (bezpečná verze): RLS hardening admin tabulek + 2 bezpečné trigger funkce.
-- Cíl: dev projekt gmbxcqqmnlsjvqghaxmu. Objednávek/checkoutu se NEdotýká.
-- Funkce handle_stock_movement / handle_manufacture_movement / handle_new_user se řeší zvlášť (bod 1b).

DROP POLICY IF EXISTS "Allow public write access on app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public update access on app_settings" ON public.app_settings;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin delete to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin insert to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin update to invoices" ON public.invoices;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
CREATE POLICY "Admins manage invoices" ON public.invoices
    FOR ALL USING ( (select public.is_admin()) ) WITH CHECK ( (select public.is_admin()) );

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Allow admin delete to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow admin insert to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow admin update to suppliers" ON public.suppliers;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage suppliers" ON public.suppliers;
CREATE POLICY "Admins manage suppliers" ON public.suppliers
    FOR ALL USING ( (select public.is_admin()) ) WITH CHECK ( (select public.is_admin()) );

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.material_aliases;
DROP POLICY IF EXISTS "Allow admin delete to material_aliases" ON public.material_aliases;
DROP POLICY IF EXISTS "Allow admin insert to material_aliases" ON public.material_aliases;
DROP POLICY IF EXISTS "Allow admin update to material_aliases" ON public.material_aliases;
ALTER TABLE public.material_aliases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage material_aliases" ON public.material_aliases;
CREATE POLICY "Admins manage material_aliases" ON public.material_aliases
    FOR ALL USING ( (select public.is_admin()) ) WITH CHECK ( (select public.is_admin()) );

DROP POLICY IF EXISTS "Allow authenticated access to messages" ON public.messages;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage messages" ON public.messages;
CREATE POLICY "Admins manage messages" ON public.messages
    FOR ALL USING ( (select public.is_admin()) ) WITH CHECK ( (select public.is_admin()) );
DROP POLICY IF EXISTS "Anon can insert messages" ON public.messages;
CREATE POLICY "Anon can insert messages" ON public.messages
    FOR INSERT WITH CHECK (true);

ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.trigger_set_timestamp() SET search_path = public, pg_temp;
