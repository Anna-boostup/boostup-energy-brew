-- Migration: Create packaging_rules table and insert default materials/rules
-- Date: 2026-06-05

-- 1. Create packaging_rules table
CREATE TABLE IF NOT EXISTS public.packaging_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pack_size INTEGER NOT NULL, -- e.g. 1 (singles), 3, 12, 21
    material_id UUID REFERENCES public.manufacture_inventory(id) ON DELETE CASCADE,
    quantity_required NUMERIC NOT NULL DEFAULT 1 CHECK (quantity_required > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(pack_size, material_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.packaging_rules ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Anyone can view packaging rules" ON public.packaging_rules;
CREATE POLICY "Anyone can view packaging rules" ON public.packaging_rules
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage packaging rules" ON public.packaging_rules;
CREATE POLICY "Admins can manage packaging rules" ON public.packaging_rules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Seed default materials and matching packaging rules using robust PL/pgSQL block
DO $$
DECLARE
    v_box3_id UUID;
    v_box12_id UUID;
    v_box21_id UUID;
    v_envelope_id UUID;
BEGIN
    -- Check or Insert 'Krabice pro 3 ks'
    IF NOT EXISTS (SELECT 1 FROM public.manufacture_inventory WHERE name = 'Krabice pro 3 ks') THEN
        INSERT INTO public.manufacture_inventory (name, quantity, unit, min_quantity, warning_quantity, notifications_enabled)
        VALUES ('Krabice pro 3 ks', 100, 'ks', 10, 25, true)
        RETURNING id INTO v_box3_id;
    ELSE
        SELECT id INTO v_box3_id FROM public.manufacture_inventory WHERE name = 'Krabice pro 3 ks';
    END IF;

    -- Check or Insert 'Krabice pro 12 ks'
    IF NOT EXISTS (SELECT 1 FROM public.manufacture_inventory WHERE name = 'Krabice pro 12 ks') THEN
        INSERT INTO public.manufacture_inventory (name, quantity, unit, min_quantity, warning_quantity, notifications_enabled)
        VALUES ('Krabice pro 12 ks', 100, 'ks', 10, 25, true)
        RETURNING id INTO v_box12_id;
    ELSE
        SELECT id INTO v_box12_id FROM public.manufacture_inventory WHERE name = 'Krabice pro 12 ks';
    END IF;

    -- Check or Insert 'Krabice pro 21 ks'
    IF NOT EXISTS (SELECT 1 FROM public.manufacture_inventory WHERE name = 'Krabice pro 21 ks') THEN
        INSERT INTO public.manufacture_inventory (name, quantity, unit, min_quantity, warning_quantity, notifications_enabled)
        VALUES ('Krabice pro 21 ks', 100, 'ks', 5, 15, true)
        RETURNING id INTO v_box21_id;
    ELSE
        SELECT id INTO v_box21_id FROM public.manufacture_inventory WHERE name = 'Krabice pro 21 ks';
    END IF;

    -- Check or Insert 'Bublinková obálka (1 ks)'
    IF NOT EXISTS (SELECT 1 FROM public.manufacture_inventory WHERE name = 'Bublinková obálka (1 ks)') THEN
        INSERT INTO public.manufacture_inventory (name, quantity, unit, min_quantity, warning_quantity, notifications_enabled)
        VALUES ('Bublinková obálka (1 ks)', 200, 'ks', 20, 50, true)
        RETURNING id INTO v_envelope_id;
    ELSE
        SELECT id INTO v_envelope_id FROM public.manufacture_inventory WHERE name = 'Bublinková obálka (1 ks)';
    END IF;

    -- Insert default rules mapping pack_size to material
    INSERT INTO public.packaging_rules (pack_size, material_id, quantity_required)
    VALUES 
        (1, v_envelope_id, 1),
        (3, v_box3_id, 1),
        (12, v_box12_id, 1),
        (21, v_box21_id, 1)
    ON CONFLICT (pack_size, material_id) DO NOTHING;
END $$;
