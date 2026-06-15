-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    contact_person TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access to suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow admin insert to suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update to suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete to suppliers" ON public.suppliers FOR DELETE USING (true);


-- 2. Material Aliases Table
-- This table remembers how a supplier names a material, so AI mapping gets smarter
CREATE TABLE IF NOT EXISTS public.material_aliases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL, -- references manufacture_inventory(id) via application logic
    alias_name TEXT NOT NULL, -- The name used on the invoice by the supplier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, alias_name)
);

ALTER TABLE public.material_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access to material_aliases" ON public.material_aliases FOR SELECT USING (true);
CREATE POLICY "Allow admin insert to material_aliases" ON public.material_aliases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update to material_aliases" ON public.material_aliases FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete to material_aliases" ON public.material_aliases FOR DELETE USING (true);


-- 3. Invoices Table
-- Stores processed or pending invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    invoice_number TEXT,
    file_url TEXT, -- URL or path to the uploaded PDF/Image in Supabase Storage
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error', 'rejected')),
    parsed_data JSONB, -- The extracted items from AI: [{ name, quantity, unit, mapped_material_id }]
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access to invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow admin insert to invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update to invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete to invoices" ON public.invoices FOR DELETE USING (true);


-- Triggers for updated_at
CREATE TRIGGER set_timestamp_suppliers
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_material_aliases
BEFORE UPDATE ON public.material_aliases
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
