-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
    interval text NOT NULL CHECK (interval IN ('monthly', 'bimonthly')),
    product_handle text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    next_delivery_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add is_subscription_order to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_subscription_order boolean DEFAULT false;
