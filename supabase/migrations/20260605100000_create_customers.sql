-- Migration: Create customers table and insert default B2B customers
-- Date: 2026-06-05

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    ico TEXT NOT NULL UNIQUE,
    dic TEXT,
    email TEXT,
    phone TEXT,
    street TEXT,
    city TEXT,
    zip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for admins
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Seed default test customer JIC (Jihomoravské inovační centrum)
INSERT INTO public.customers (company_name, ico, dic, email, phone, street, city, zip)
VALUES (
    'JIC (Jihomoravské inovační centrum, zájmové sdružení právnických osob)',
    '26955768',
    'CZ26955768',
    'info@jic.cz',
    '+420511205310',
    'Purkyňova 649/127',
    'Brno - Medlánky',
    '61200'
) ON CONFLICT (ico) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    dic = EXCLUDED.dic,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    street = EXCLUDED.street,
    city = EXCLUDED.city,
    zip = EXCLUDED.zip;
