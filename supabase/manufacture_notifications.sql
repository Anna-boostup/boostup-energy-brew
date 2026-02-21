-- Add notifications_enabled column to manufacture_inventory
alter table public.manufacture_inventory
add column if not exists notifications_enabled boolean default false;