-- Update the orders status constraint to support 'processing' and 'cancelled'
-- Run this in the Supabase SQL Editor
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check CHECK (
        status IN (
            'pending',
            'paid',
            'processing',
            'shipped',
            'cancelled'
        )
    );