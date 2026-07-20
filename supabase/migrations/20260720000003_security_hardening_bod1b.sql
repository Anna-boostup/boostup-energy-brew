-- BOD 1b: search_path na zbývající SECURITY DEFINER funkce.
-- Ověřeno: všechny plně kvalifikují odkazy (public.*, auth.uid()) → nulová změna chování.
ALTER FUNCTION public.handle_stock_movement(p_sku text, p_type text, p_amount integer, p_note text) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_manufacture_movement(p_material_id uuid, p_type text, p_amount numeric, p_note text) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
