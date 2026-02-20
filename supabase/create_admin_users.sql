-- SKRIPT PRO VYTVOŘENÍ ADMIN UŽIVATELŮ (Opravená verze)
-- Heslo: boostup2025
-- DŮLEŽITÉ: Zkopírujte CELÝ skript až po poslední řádek 'END $$;'
DO $$
DECLARE uid_anna UUID := gen_random_uuid();
uid_zdenek UUID := gen_random_uuid();
uid_vojtech UUID := gen_random_uuid();
-- Hash pro heslo 'boostup2025'
pass_hash TEXT := '$2a$10$LT7NWBmK.mBvK7pXYk6iOeYv6S8v6S8v6S8v6S8v6S8v6S8v6S8v6S8v6S';
BEGIN -- 1. ANNA
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'anna1paluskova@gmail.com'
) THEN
INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
VALUES (
        uid_anna,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'anna1paluskova@gmail.com',
        pass_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name": ""}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
END IF;
-- 2. ZDENĚK
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'dias.zd@gmail.com'
) THEN
INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
VALUES (
        uid_zdenek,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'dias.zd@gmail.com',
        pass_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name": "Zdeněk Dias"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
END IF;
-- 3. VOJTĚCH
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'hlavackavoj@gmail.com'
) THEN
INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
VALUES (
        uid_vojtech,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'hlavackavoj@gmail.com',
        pass_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name": "Vojtěch Hlavačka"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
END IF;
-- SYNCHRONIZACE PROFILŮ (Nastavení admin role)
-- Tato část zajistí, že profily budou v tabulce public.profiles s rolí admin
INSERT INTO public.profiles (id, email, full_name, role, account_type)
SELECT id,
    email,
    raw_user_meta_data->>'full_name',
    'admin',
    'admin'
FROM auth.users
WHERE email IN (
        'anna1paluskova@gmail.com',
        'dias.zd@gmail.com',
        'hlavackavoj@gmail.com'
    ) ON CONFLICT (id) DO
UPDATE
SET role = 'admin',
    account_type = 'admin';
END $$;