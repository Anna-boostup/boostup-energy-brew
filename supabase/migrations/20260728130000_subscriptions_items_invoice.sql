-- Subscriptions — fáze 1b: položky pro přepočet skladu + idempotence obnov
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS items jsonb,
    ADD COLUMN IF NOT EXISTS last_invoice_id text;
