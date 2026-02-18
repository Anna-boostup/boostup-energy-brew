-- RLS FIX v2: ROBUST RECURSION PREVENTION
-- This script replaces all potentially recursive policies with simplified, secure versions.

-- 1. Drop EVERYTHING related to problematic policies first
DROP POLICY IF EXISTS "View orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;
DROP POLICY IF EXISTS "View profiles" ON profiles;
DROP POLICY IF EXISTS "Admin manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admin view movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can see own profile" ON profiles; -- Previous attempt

-- 2. Create SECURE Function to Check Admin Role (Bypassing RLS Correctly)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Select directly without triggering RLS because of SECURITY DEFINER
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; -- Critical for Security!

-- 3. Re-create Policies (Using is_admin() function)

-- A) Profiles:
-- Allow users to see ONLY their own profile (simple ID check)
-- AND allow Admins via function (but separate policy to be safe)
CREATE POLICY "View own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow Admins to see all profiles (using the secure function)
CREATE POLICY "Admin view all profiles" ON profiles FOR SELECT USING (public.is_admin());

-- B) Orders:
-- Users see own orders + Admins see all
CREATE POLICY "View orders" ON orders FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (auth.jwt()->>'email' = customer_email) OR
  (public.is_admin())
);

-- Admins can update orders
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (
  public.is_admin()
);

-- C) Inventory:
-- Admins manage correct stock
CREATE POLICY "Admin manage inventory" ON inventory FOR ALL USING (
  public.is_admin()
);

-- D) Stock Movements:
-- Admins view history
CREATE POLICY "Admin view movements" ON stock_movements FOR SELECT USING (
  public.is_admin()
);
