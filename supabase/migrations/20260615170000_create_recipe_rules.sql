-- Migration: Create recipe_rules table
-- Date: 2026-06-15

-- 1. Create recipe_rules table
CREATE TABLE IF NOT EXISTS public.recipe_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_sku TEXT NOT NULL, -- e.g., 'lemon', 'red', 'silky'
    material_id UUID REFERENCES public.manufacture_inventory(id) ON DELETE CASCADE,
    quantity_required NUMERIC NOT NULL DEFAULT 0.1 CHECK (quantity_required > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(product_sku, material_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.recipe_rules ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Anyone can view recipe rules" ON public.recipe_rules;
CREATE POLICY "Anyone can view recipe rules" ON public.recipe_rules
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage recipe rules" ON public.recipe_rules;
CREATE POLICY "Admins can manage recipe rules" ON public.recipe_rules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
