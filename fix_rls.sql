-- 1. Create a Secure Function to Check Admin Role (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This function runs as the creator (postgres/service_role), so it can read profiles without hitting RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop Problematic Recursive Policies
DROP POLICY IF EXISTS "View orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;
DROP POLICY IF EXISTS "View profiles" ON profiles;
DROP POLICY IF EXISTS "Admin manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admin view movements" ON stock_movements;


-- 3. Re-create Optimized Policies (Using is_admin() function)

-- Orders:
CREATE POLICY "View orders" ON orders FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (auth.jwt()->>'email' = customer_email) OR
  (public.is_admin())
);

CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (
  public.is_admin()
);

-- Profiles:
-- Avoid recursion by checking user ID directly OR admin function
CREATE POLICY "View profiles" ON profiles FOR SELECT USING (
  (auth.uid() = id) OR
  (public.is_admin())
);

-- Inventory:
CREATE POLICY "Admin manage inventory" ON inventory FOR ALL USING (
  public.is_admin()
);

-- Stock Movements:
CREATE POLICY "Admin view movements" ON stock_movements FOR SELECT USING (
  public.is_admin()
);
