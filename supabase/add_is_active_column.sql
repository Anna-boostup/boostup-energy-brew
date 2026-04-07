-- Přidání sloupce is_active do tabulky inventory
-- Tento sloupec umožňuje úplné zastavení prodeje konkrétní příchutě/produktu

ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Komentář k novému sloupci
COMMENT ON COLUMN public.inventory.is_active IS 'Určuje, zda je produkt/příchuť aktivně nabízena k prodeji na storefrontu.';
