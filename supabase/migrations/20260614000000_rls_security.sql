-- Bezpečnostní RLS politiky pro hlavní tabulky a oprava infinite recursion

-- Pomocná funkce pro bezpečné zjištění role uživatele bez spuštění zacyklených RLS kontrol
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. Tabulka profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING ( public.is_admin() );

-- 2. Tabulka orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Nepřihlášení uživatelé a zákazníci mohou vytvořit objednávku (Guest checkout apod.)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL USING ( public.is_admin() );

-- 3. Tabulka app_settings a site_content
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings" ON public.app_settings FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins manage site content" ON public.site_content;
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL USING ( public.is_admin() );

-- 4. Oprava všech starších tabulek (Zamezení zacyklení a zrychlení DB dotazů)
DROP POLICY IF EXISTS "Admins manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins manage messages" ON public.messages;
CREATE POLICY "Admins manage messages" ON public.messages FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins manage newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Admins manage newsletter" ON public.newsletter_subscriptions FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins manage templates" ON public.email_templates;
CREATE POLICY "Admins manage templates" ON public.email_templates FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage manufacture_inventory" ON public.manufacture_inventory;
CREATE POLICY "Admins can manage manufacture_inventory" ON public.manufacture_inventory FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage manufacture_movements" ON public.manufacture_movements;
CREATE POLICY "Admins can manage manufacture_movements" ON public.manufacture_movements FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage packaging rules" ON public.packaging_rules;
CREATE POLICY "Admins can manage packaging rules" ON public.packaging_rules FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING ( public.is_admin() );
