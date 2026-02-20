-- ⚠️ VAROVÁNÍ: Tento skript maže data z tabulky uživatelů. 
-- Před spuštěním se ujistěte, že máte zálohu a že jste ve správném projektu (Produkce).
-- 1. Identifikace a smazání uživatelů z auth.users
-- Mažeme všechny, kteří v tabulce profiles NEMÁJÍ roli 'admin'.
-- Díky 'on delete cascade' se automaticky smažou i jejich řádky v public.profiles, orders atd. (pokud jsou tak nastaveny FK).
delete from auth.users
where id not in (
        select id
        from public.profiles
        where role = 'admin'
    );
-- POZNÁMKA: Pokud příkaz výše selže kvůli oprávněním (časté v Supabase SQL Editoru), 
-- je to proto, že schéma 'auth' je chráněné. V takovém případě musíte uživatele smazat 
-- ručně v sekci Authentication -> Users v Dashboardu, nebo použít Management API.
-- Pokud chcete smazat i uživatele, kteří nemají vůbec vytvořený profil (a tedy nejsou admini):
-- delete from auth.users where id not in (select id from public.profiles where role = 'admin');
-- (To je stejný příkaz jako výše, pojistka pro ty bez profilu).