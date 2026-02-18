UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'firma_strict@test.com';
