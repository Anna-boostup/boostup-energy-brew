-- FIX PUBLIC ACCESS
-- The previous RLS fix accidentally restricted 'inventory' SELECT to admins only.
-- This script restores public read access so customers can see stock levels.

-- 1. Inventory (Crucial for "Vyprodáno" check)
DROP POLICY IF EXISTS "Public read inventory" ON inventory;
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);

-- 2. Products (Just to be sure)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- 3. Stock Movements (Allow admins to see history, anon sees nothing -> empty list is fine)
-- The previous policy "Admin view movements" handles this correctly (returns rows only for admin).
-- But we ensure no error is thrown for anon.
GRANT SELECT ON stock_movements TO anon, authenticated;

-- 4. Profiles (Public read for basic info? No, keep restricted to own/admin)
-- The fetchMovements query joins profiles. If anon, it will just return null for profile fields, which is fine.
