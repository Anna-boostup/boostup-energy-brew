-- Oprava: webhook upsert selhával s
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- protože unique index na stripe_subscription_id byl PARTIÁLNÍ (WHERE ... IS NOT NULL),
-- a ON CONFLICT (stripe_subscription_id) partiální index nematchuje bez stejného predikátu.
-- Nahrazujeme plným unique indexem. NULL hodnoty jsou v Postgresu i tak distinct,
-- takže víc řádků bez stripe_subscription_id zůstává povolených; uniqueness platí jen pro non-NULL.

DROP INDEX IF EXISTS public.subscriptions_stripe_sub_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_sub_uidx
    ON public.subscriptions (stripe_subscription_id);
