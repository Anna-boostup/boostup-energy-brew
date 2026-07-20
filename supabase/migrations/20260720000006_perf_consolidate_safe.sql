BEGIN;

-- BOD 4 (dev, bezpečné tabulky): konsolidace RLS politik.
-- Odstraní nasbírané duplicitní politiky (multiple_permissive) a obalí auth/is_admin
-- do (select ...) (auth_rls_initplan). U každé tabulky dynamicky smaže VŠECHNY
-- existující politiky a založí jednu čistou sadu.
-- Cíl: dev gmbxcqqmnlsjvqghaxmu. NEDOTÝKÁ se orders/promo/skladu/recenzí/profiles.
-- Bonus: zavírá únik veřejného čtení u invoices/suppliers/material_aliases.

CREATE OR REPLACE FUNCTION public._drop_all_policies(tbl text)
RETURNS void AS $fn$
DECLARE r record;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename=tbl LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, tbl);
    END LOOP;
END;
$fn$ LANGUAGE plpgsql;

-- ========== analytics_events (anon insert + admin read) ==========
SELECT public._drop_all_policies('analytics_events');
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_insert" ON public.analytics_events
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "analytics_admin_read" ON public.analytics_events
    FOR SELECT TO authenticated USING ((select public.is_admin()));

-- ========== app_settings (public read + admin write) ==========
SELECT public._drop_all_policies('app_settings');
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings_public_read" ON public.app_settings
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "app_settings_admin_insert" ON public.app_settings
    FOR INSERT TO authenticated WITH CHECK ((select public.is_admin()));
CREATE POLICY "app_settings_admin_update" ON public.app_settings
    FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "app_settings_admin_delete" ON public.app_settings
    FOR DELETE TO authenticated USING ((select public.is_admin()));

-- ========== site_content (public read + admin write) ==========
SELECT public._drop_all_policies('site_content');
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content_public_read" ON public.site_content
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_content_admin_insert" ON public.site_content
    FOR INSERT TO authenticated WITH CHECK ((select public.is_admin()));
CREATE POLICY "site_content_admin_update" ON public.site_content
    FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "site_content_admin_delete" ON public.site_content
    FOR DELETE TO authenticated USING ((select public.is_admin()));

-- ========== blog_categories (public read + admin write) ==========
SELECT public._drop_all_policies('blog_categories');
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_categories_public_read" ON public.blog_categories
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "blog_categories_admin_insert" ON public.blog_categories
    FOR INSERT TO authenticated WITH CHECK ((select public.is_admin()));
CREATE POLICY "blog_categories_admin_update" ON public.blog_categories
    FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "blog_categories_admin_delete" ON public.blog_categories
    FOR DELETE TO authenticated USING ((select public.is_admin()));

-- ========== blog_posts (public read published + admin write) ==========
SELECT public._drop_all_policies('blog_posts');
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts_public_read" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING ( status = 'published' OR (select public.is_admin()) );
CREATE POLICY "blog_posts_admin_insert" ON public.blog_posts
    FOR INSERT TO authenticated WITH CHECK ((select public.is_admin()));
CREATE POLICY "blog_posts_admin_update" ON public.blog_posts
    FOR UPDATE TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));
CREATE POLICY "blog_posts_admin_delete" ON public.blog_posts
    FOR DELETE TO authenticated USING ((select public.is_admin()));

-- ========== email_templates (jen admin) ==========
SELECT public._drop_all_policies('email_templates');
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_admin_all" ON public.email_templates
    FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

-- ========== material_aliases (jen admin – zavírá veřejné čtení) ==========
SELECT public._drop_all_policies('material_aliases');
ALTER TABLE public.material_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_aliases_admin_all" ON public.material_aliases
    FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

-- ========== suppliers (jen admin – zavírá veřejné čtení) ==========
SELECT public._drop_all_policies('suppliers');
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_admin_all" ON public.suppliers
    FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

-- ========== invoices (jen admin – zavírá veřejné čtení) ==========
SELECT public._drop_all_policies('invoices');
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_admin_all" ON public.invoices
    FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

-- ========== mailboxes (jen admin) ==========
SELECT public._drop_all_policies('mailboxes');
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mailboxes_admin_all" ON public.mailboxes
    FOR ALL TO authenticated USING ((select public.is_admin())) WITH CHECK ((select public.is_admin()));

DROP FUNCTION public._drop_all_policies(text);

COMMIT;
