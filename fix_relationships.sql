-- FIX RELATIONSHIPS
-- This script ensures the foreign key between stock_movements and profiles is correctly set for API access.

-- 1. Ensure column exists
DO $$ 
BEGIN 
    ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
EXCEPTION 
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; 
END $$;

-- 2. Explicitly recreate the Foreign Key Constraint
-- This forces PostgREST to recognize the relationship for joins (e.g. select=*,profiles(*))
ALTER TABLE stock_movements 
  DROP CONSTRAINT IF EXISTS stock_movements_user_id_fkey;

ALTER TABLE stock_movements 
  ADD CONSTRAINT stock_movements_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id);

-- 3. Just in case, grant access to ensure it's visible
GRANT SELECT ON profiles TO anon, authenticated, service_role;
GRANT SELECT ON stock_movements TO anon, authenticated, service_role;
