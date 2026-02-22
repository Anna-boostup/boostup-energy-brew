-- Add notifications_enabled and multi-level thresholds to manufacture_inventory
alter table public.manufacture_inventory
add column if not exists notifications_enabled boolean default false;
-- warning_quantity: yellow / varovná úroveň (zásoby brzy dojdou)
-- min_quantity already exists: red / kritická úroveň (zásoby téměř vyčerpány)
alter table public.manufacture_inventory
add column if not exists warning_quantity numeric default 0;