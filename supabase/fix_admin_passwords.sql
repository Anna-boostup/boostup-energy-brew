-- OPRAVNÝ SKRIPT PRO HESLA (Používá vnitřní šifrování Supabase)
-- Heslo: boostup2025
-- 1. Ujistíme se, že máme rozšíření pgcrypto (obvykle už v Supabase je)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- 2. Aktualizace hesla pro všechny 3 adminy
-- Tento způsob je 100% spolehlivý, protože hash vytvoří přímo databáze
UPDATE auth.users
SET encrypted_password = extensions.crypt('boostup2025', extensions.gen_salt('bf'))
WHERE email IN (
        'anna1paluskova@gmail.com',
        'dias.zd@gmail.com',
        'hlavackavoj@gmail.com'
    );
-- 3. Jistota, že mají roli admin v profiles
UPDATE public.profiles
SET role = 'admin',
    account_type = 'admin'
WHERE email IN (
        'anna1paluskova@gmail.com',
        'dias.zd@gmail.com',
        'hlavackavoj@gmail.com'
    );