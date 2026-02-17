-- 1. Create Products Table (Catalog)
CREATE TABLE products (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  is_pack BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Inventory Table (Current Stock)
CREATE TABLE inventory (
  sku TEXT PRIMARY KEY REFERENCES products(sku),
  quantity INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Stock Movements Table (History)
CREATE TYPE movement_type AS ENUM ('restock', 'sale', 'correction');

CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT REFERENCES products(sku),
  type movement_type NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- Using text to match current format, can be UUID
  customer_email TEXT,
  customer_name TEXT, -- Added for full name
  delivery_info JSONB, -- Added for address and shipping details
  total NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped
  items JSONB, -- Storing full cart items for simplicity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Enable Row Level Security (RLS) - Optional for now, but good practice
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to everyone (public catalog)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);

-- Policy: Allow anon insert for orders (checkout)
CREATE POLICY "Anon insert orders" ON orders FOR INSERT WITH CHECK (true);

-- 6. Initial Data Seeding (Based on current project)
INSERT INTO products (sku, name, is_pack) VALUES
('lemon', 'Lemon Blast (Single)', false),
('red', 'Red Rush (Single)', false),
('silky', 'Silky Leaf (Single)', false),
('lemon-3', 'Lemon Blast (3 Pack)', true),
('lemon-12', 'Lemon Blast (12 Pack)', true),
('lemon-21', 'Lemon Blast (21 Pack)', true),
('red-3', 'Red Rush (3 Pack)', true),
('red-12', 'Red Rush (12 Pack)', true),
('red-21', 'Red Rush (21 Pack)', true),
('silky-3', 'Silky Leaf (3 Pack)', true),
('silky-12', 'Silky Leaf (12 Pack)', true),
('silky-21', 'Silky Leaf (21 Pack)', true);

-- Initialize Inventory (approximate defaults)
-- 7. Stored Procedure for Atomic Stock Movements
CREATE OR REPLACE FUNCTION handle_stock_movement(
  p_sku TEXT,
  p_type movement_type,
  p_amount INTEGER,
  p_note TEXT
) RETURNS JSONB AS $$
DECLARE
  v_new_quantity INTEGER;
  v_current_quantity INTEGER;
BEGIN
  -- Get current quantity
  SELECT quantity INTO v_current_quantity FROM inventory WHERE sku = p_sku;
  
  -- Calculate new quantity
  IF p_type = 'correction' THEN
    v_new_quantity := p_amount;
  ELSE
    v_new_quantity := v_current_quantity + p_amount;
  END IF;

  -- Ensure non-negative (optional, but good safety)
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  -- Update Inventory
  UPDATE inventory SET quantity = v_new_quantity, last_updated = timezone('utc'::text, now()) WHERE sku = p_sku;

  -- Log Movement
  INSERT INTO stock_movements (sku, type, amount, note)
  VALUES (p_sku, p_type, p_amount, p_note);

  RETURN jsonb_build_object('success', true, 'new_quantity', v_new_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Explicit RLS Policy for Stock Movements (Fallback)
-- Allow anon users to INSERT into stock_movements (since we are using client-side calls)
CREATE POLICY "Enable insert for anon" ON stock_movements FOR INSERT WITH CHECK (true);



-- Initialize Inventory (approximate defaults)
INSERT INTO inventory (sku, quantity) VALUES
('lemon', 200), ('red', 200), ('silky', 200),
('lemon-3', 50), ('lemon-12', 30), ('lemon-21', 15),
('red-3', 50), ('red-12', 30), ('red-21', 20),
('silky-3', 50), ('silky-12', 30), ('silky-21', 20);

-- 11. PHASE 4: FINAL RLS HARDENING
-- Run this block to switch from "Public Admin" to "Secure Role-Based" access.

-- A) Drop temporary public policies
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public update orders" ON orders;
-- Keep products/inventory public read as they are catalog

-- B) SECURE ORDERS POLICIES

-- 1. INSERT: Allow Anon (for guest checkout) AND Authenticated
CREATE POLICY "Enable insert for all" ON orders FOR INSERT WITH CHECK (true);

-- 2. SELECT:
--    - Admin sees ALL
--    - Users see THEIR OWN (based on customer_email matching their auth email? Or add user_id column?)
--    *CRITICAL DESIGN DECISION*: We currently link orders by `customer_email`.
--    Ideally, we should add `user_id` column to orders.
--    Let's add `user_id` column if possible, otherwise fallback to email match.

DO $$ 
BEGIN 
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
EXCEPTION 
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; 
END $$;

-- Policy for Select:
CREATE POLICY "View orders" ON orders FOR SELECT USING (
  -- Admin sees everything
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  OR
  -- Users see their own (matched by ID or Email)
  (auth.uid() = user_id)
  OR
  (auth.jwt()->>'email' = customer_email)
);

-- 3. UPDATE:
--    - Only Admin can update status
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- C) SECURE INVENTORY/MOVEMENTS
--    - Only Admin can insert movements (restock) directly (though we use RPC)
--    - RPC is `SECURITY DEFINER`, so it bypasses RLS, but we should secure the RPC execution if possible?
--    - Standard Supabase RPCs satisfy RLS if not `SECURITY DEFINER`, but we need it for split update.
--    - We can leave public read on movements so users check history? No, usually internal.
DROP POLICY IF EXISTS "Public read movements" ON stock_movements;
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 12. PHASE 5: STOCK HISTORY USER TRACKING
-- Add user_id to stock movements and update RPC

-- A) Add column
DO $$ 
BEGIN 
    ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
EXCEPTION 
    WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; 
END $$;

-- B) Update RPC to capture auth.uid()
CREATE OR REPLACE FUNCTION handle_stock_movement(
  p_sku TEXT,
  p_type movement_type,
  p_amount INTEGER,
  p_note TEXT
) RETURNS JSONB AS $$
DECLARE
  v_new_quantity INTEGER;
  v_current_quantity INTEGER;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid(); -- Capture current user ID

  -- Get current quantity
  SELECT quantity INTO v_current_quantity FROM inventory WHERE sku = p_sku;
  
  -- Calculate new quantity
  IF p_type = 'correction' THEN
    v_new_quantity := p_amount;
  ELSE
    v_new_quantity := v_current_quantity + p_amount;
  END IF;

  -- Ensure non-negative
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  -- Update Inventory
  UPDATE inventory SET quantity = v_new_quantity, last_updated = timezone('utc'::text, now()) WHERE sku = p_sku;

  -- Log Movement
  INSERT INTO stock_movements (sku, type, amount, note, user_id)
  VALUES (p_sku, p_type, p_amount, p_note, v_user_id);

  RETURN jsonb_build_object('success', true, 'new_quantity', v_new_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
