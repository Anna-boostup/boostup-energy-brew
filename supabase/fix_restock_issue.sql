-- KOMPLETNÍ OPRAVA SKLADU A ADMINISTRACE (Production)
-- Tento skript zajistí, že všechny tabulky a funkce potřebné pro naskladnění existují a fungují.
-- 1. Vytvoření tabulky STOCK_MOVEMENTS, pokud chybí (historie skladu)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sku text REFERENCES public.inventory(sku) ON DELETE CASCADE,
    type text CHECK (type IN ('restock', 'sale', 'correction')),
    amount integer NOT NULL,
    note text,
    user_id uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now()
);
-- 2. Povolení RLS pro historii
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
-- 3. Zajištění, že profil existuje pro aktuálního uživatele
INSERT INTO public.profiles (id, email, role)
SELECT id,
    email,
    'admin'
FROM auth.users ON CONFLICT (id) DO
UPDATE
SET role = 'admin';
-- 4. Oprava NULL hodnot u množství
UPDATE public.inventory
SET quantity = 0
WHERE quantity IS NULL;
-- 5. Robustní SQL funkce pro naskladnění (opravená verze)
CREATE OR REPLACE FUNCTION public.handle_stock_movement(
        p_sku text,
        p_type text,
        p_amount integer,
        p_note text DEFAULT null
    ) RETURNS void AS $$
DECLARE v_user_id uuid;
BEGIN -- Zkusíme získat user_id, ale pokud profil neexistuje, zapíšeme aspoň pohyb bez něj
SELECT id INTO v_user_id
FROM public.profiles
WHERE id = auth.uid();
INSERT INTO public.stock_movements (sku, type, amount, note, user_id)
VALUES (p_sku, p_type, p_amount, p_note, v_user_id);
UPDATE public.inventory
SET quantity = COALESCE(quantity, 0) + p_amount
WHERE sku = p_sku;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 6. Oprávnění pro adminy (pokud by chyběla)
DROP POLICY IF EXISTS "Admins can manage stock_movements" ON public.stock_movements;
CREATE POLICY "Admins can manage stock_movements" ON public.stock_movements FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);