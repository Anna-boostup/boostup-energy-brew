-- Povolení rozšíření
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Vytvoření cron jobu pro spouštění kontroly emailů každých 10 minut
-- POZOR: PŘED SPUŠTĚNÍM V SQL EDITORU NA PRODUKCI NAHRAĎTE:
-- 1. <PROJECT_REF> za ID vašeho Supabase projektu (např. abcdxyz123)
-- 2. <ANON_KEY> za váš Supabase anon key (nebo service_role key)
SELECT cron.schedule(
    'sync-emails-every-10-mins',
    '*/10 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://<PROJECT_REF>.supabase.co/functions/v1/sync-emails',
        headers := '{"Authorization": "Bearer <ANON_KEY>"}'::jsonb,
        timeout_milliseconds := 10000
    )
    $$
);

-- Poznámka: Pokud byste chtěli job zrušit, použijte:
-- SELECT cron.unschedule('sync-emails-every-10-mins');
