-- ============================================================
-- Packeta Integration: add barcode/packet ID to orders
-- Spustit v Supabase SQL editoru (test i produkce)
-- ============================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS packeta_barcode text,
    ADD COLUMN IF NOT EXISTS packeta_packet_id text;