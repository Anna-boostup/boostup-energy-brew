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

-- 4. Create Profiles Table (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  full_name TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- Using text to match current format
  customer_email TEXT,
  customer_name TEXT,
  delivery_info JSONB,
  total NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  user_id UUID REFERENCES auth.users(id) -- Linked to auth user if logged in
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Public Read for Catalog
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);

-- Orders:
-- Insert: Public (for checkout)
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
-- Select: Users see own, Admin sees all
CREATE POLICY "View orders" ON orders FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (auth.jwt()->>'email' = customer_email) OR
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);
-- Update: Only Admin
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles:
-- Read: Users see own, Admin sees all
CREATE POLICY "View profiles" ON profiles FOR SELECT USING (
  (auth.uid() = id) OR
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);
-- Update: Users update own
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Inventory & Movements:
-- Update/Insert: Only Admin
CREATE POLICY "Admin manage inventory" ON inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Allow viewing movements for Admin
CREATE POLICY "Admin view movements" ON stock_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Functions & Triggers

-- Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Handle Stock Movement (Atomic Update)
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
  v_user_id := auth.uid();

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

-- 9. Seed Initial Data (Products)
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

-- Seed Initial Inventory (Zero or Default)
INSERT INTO inventory (sku, quantity) VALUES
('lemon', 200), ('red', 200), ('silky', 200),
('lemon-3', 50), ('lemon-12', 30), ('lemon-21', 15),
('red-3', 50), ('red-12', 30), ('red-21', 20),
('silky-3', 50), ('silky-12', 30), ('silky-21', 20);
