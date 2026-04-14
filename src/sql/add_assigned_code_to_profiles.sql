-- Migration: Add assigned_promo_code to profiles
-- Description: Allows linking a specific promo code to a registered user for automatic application.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_promo_code TEXT DEFAULT NULL;

-- Optionally, add a comment for documentation
COMMENT ON COLUMN public.profiles.assigned_promo_code IS 'Promo code to be automatically applied for this user upon login.';
