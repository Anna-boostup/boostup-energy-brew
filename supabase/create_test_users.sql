-- CONSOLIDATED TEST USER INITIALIZATION
-- Run this in the Supabase SQL Editor

DO $$
DECLARE
    admin_id UUID;
    company_id UUID;
    basic_id UUID;
BEGIN
    -- 1. ADMIN TEST ACCOUNT (admin-test@drinkboostup.cz / BoostUpAdminTest2026!)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin-test@drinkboostup.cz') THEN
        admin_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
        VALUES (admin_id, 'admin-test@drinkboostup.cz', crypt('BoostUpAdminTest2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Admin","account_type":"personal"}', 'authenticated', 'authenticated', NOW(), NOW());
    ELSE
        SELECT id INTO admin_id FROM auth.users WHERE email = 'admin-test@drinkboostup.cz';
    END IF;

    -- Update Admin Profile
    INSERT INTO public.profiles (id, email, full_name, role, account_type, created_at)
    VALUES (admin_id, 'admin-test@drinkboostup.cz', 'Test Admin', 'admin', 'personal', NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'admin', account_type = 'personal';


    -- 2. COMPANY TEST ACCOUNT (company-test@drinkboostup.cz / BoostUpCompanyTest2026!)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'company-test@drinkboostup.cz') THEN
        company_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
        VALUES (company_id, 'company-test@drinkboostup.cz', crypt('BoostUpCompanyTest2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Company","account_type":"company"}', 'authenticated', 'authenticated', NOW(), NOW());
    ELSE
        SELECT id INTO company_id FROM auth.users WHERE email = 'company-test@drinkboostup.cz';
    END IF;

    -- Update Company Profile with B2B details
    INSERT INTO public.profiles (id, email, full_name, role, account_type, address, created_at)
    VALUES (
        company_id, 
        'company-test@drinkboostup.cz', 
        'Test Company', 
        'user', 
        'company', 
        '{"billing": {"ico": "12345678", "dic": "CZ12345678", "companyName": "Test Business s.r.o.", "isCompany": true}}'::jsonb,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET role = 'user', account_type = 'company';


    -- 3. BASIC TEST ACCOUNT (basic-test@drinkboostup.cz / BoostUpBasicTest2026!)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'basic-test@drinkboostup.cz') THEN
        basic_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
        VALUES (basic_id, 'basic-test@drinkboostup.cz', crypt('BoostUpBasicTest2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Basic","account_type":"personal"}', 'authenticated', 'authenticated', NOW(), NOW());
    ELSE
        SELECT id INTO basic_id FROM auth.users WHERE email = 'basic-test@drinkboostup.cz';
    END IF;

    -- Update Basic Profile
    INSERT INTO public.profiles (id, email, full_name, role, account_type, created_at)
    VALUES (basic_id, 'basic-test@drinkboostup.cz', 'Test Basic', 'user', 'personal', NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'user', account_type = 'personal';

END $$;
