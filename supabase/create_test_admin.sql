-- CREATE TEST ADMIN USER
-- Run this in the Supabase SQL Editor

-- 1. Create the user in Auth
-- This uses the built-in Supabase Auth function
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin-test@drinkboostup.cz',
    crypt('BoostUpAdminTest2026!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Admin","account_type":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
ON CONFLICT (email) DO NOTHING;

-- 2. Ensure the profile exists and has admin role
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin-test@drinkboostup.cz';
    
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, account_type, created_at)
        VALUES (
            target_user_id,
            'admin-test@drinkboostup.cz',
            'Test Admin',
            'admin',
            'admin',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            account_type = 'admin';
    END IF;
END $$;
