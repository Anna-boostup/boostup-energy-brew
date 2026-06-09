-- Přidání sloupce restock_batch_size do tabulky inventory
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS restock_batch_size INTEGER DEFAULT 1000;

COMMENT ON COLUMN public.inventory.restock_batch_size IS 'Predefinované množství pro rychlé doskladnění várky.';
