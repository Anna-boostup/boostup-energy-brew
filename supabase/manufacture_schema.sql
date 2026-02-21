-- tables for raw materials (ingredients, bottles, etc.)
create table if not exists public.manufacture_inventory (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    quantity numeric default 0,
    unit text not null,
    -- e.g. 'kg', 'l', 'ks'
    min_quantity numeric default 0,
    created_at timestamptz default now()
);
alter table public.manufacture_inventory enable row level security;
-- table for tracking raw material movements
create table if not exists public.manufacture_movements (
    id uuid default gen_random_uuid() primary key,
    material_id uuid references public.manufacture_inventory(id) on delete cascade,
    type text check (type in ('restock', 'use', 'correction')),
    amount numeric not null,
    note text,
    user_id uuid references public.profiles(id),
    created_at timestamptz default now()
);
alter table public.manufacture_movements enable row level security;
-- RLS policies
create policy "Admins can manage manufacture_inventory" on public.manufacture_inventory for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins can manage manufacture_movements" on public.manufacture_movements for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
-- RPC for atomic manufacture stock updates
create or replace function public.handle_manufacture_movement(
        p_material_id uuid,
        p_type text,
        p_amount numeric,
        p_note text default null
    ) returns void as $$
declare v_user_id uuid;
begin
select id into v_user_id
from public.profiles
where id = auth.uid();
insert into public.manufacture_movements (material_id, type, amount, note, user_id)
values (
        p_material_id,
        p_type,
        p_amount,
        p_note,
        v_user_id
    );
update public.manufacture_inventory
set quantity = quantity + p_amount
where id = p_material_id;
end;
$$ language plpgsql security definer;