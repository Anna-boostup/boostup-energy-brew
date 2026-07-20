-- BOD 3 (dev): storage bucket hardening. Cíl: dev gmbxcqqmnlsjvqghaxmu.
-- Řeší public_bucket_allows_listing (blog-images, product-images) a utěsňuje
-- zápis do product-images jen na adminy. Veřejné zobrazení obrázků přes
-- getPublicUrl (veřejný bucket) funguje DÁL – nevyžaduje SELECT politiku.

-- blog-images: široký public SELECT (listing) → admin-gated SELECT
DROP POLICY IF EXISTS "Public allow view" ON storage.objects;
CREATE POLICY "Admins can list blog-images" ON storage.objects
    FOR SELECT TO authenticated
    USING ( bucket_id = 'blog-images' AND (select public.is_admin()) );

-- product-images: široký authenticated SELECT (listing) → admin-gated SELECT
DROP POLICY IF EXISTS "Allow all for admins 16wiy3a_1" ON storage.objects;
CREATE POLICY "Admins can list product-images" ON storage.objects
    FOR SELECT TO authenticated
    USING ( bucket_id = 'product-images' AND (select public.is_admin()) );

-- product-images: utěsnit zápis jen na adminy (dosud jakýkoli authenticated)
DROP POLICY IF EXISTS "Allow all for admins 16wiy3a_0" ON storage.objects;
CREATE POLICY "Admins can upload product-images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'product-images' AND (select public.is_admin()) );

DROP POLICY IF EXISTS "Allow all for admins 16wiy3a_2" ON storage.objects;
CREATE POLICY "Admins can update product-images" ON storage.objects
    FOR UPDATE TO authenticated
    USING ( bucket_id = 'product-images' AND (select public.is_admin()) )
    WITH CHECK ( bucket_id = 'product-images' AND (select public.is_admin()) );

DROP POLICY IF EXISTS "Allow all for admins 16wiy3a_3" ON storage.objects;
CREATE POLICY "Admins can delete product-images" ON storage.objects
    FOR DELETE TO authenticated
    USING ( bucket_id = 'product-images' AND (select public.is_admin()) );
