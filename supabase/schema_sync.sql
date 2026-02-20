-- Důležité: Tento skript vytvoří strukturu tabulek pro čisté prostředí (Test).
-- Pokud v Testu již nějaké tabulky máte, 'if not exists' zajistí, že se nepřepíšou.
-- 1. PROFILES (Základní uživatelská data)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    full_name text,
    role text default 'user' check (role in ('admin', 'user')),
    account_type text default 'personal' check (account_type in ('personal', 'company', 'admin')),
    address jsonb,
    updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
-- 2. INVENTORY (Produkty a skladové zásoby)
create table if not exists public.inventory (
    sku text primary key,
    name text not null,
    quantity integer default 0,
    price numeric not null,
    image_url text,
    description text,
    ingredients text,
    tooltip text,
    is_on_sale boolean default false,
    created_at timestamptz default now()
);
alter table public.inventory enable row level security;
-- 3. STOCK MOVEMENTS (Historie změn skladu)
create table if not exists public.stock_movements (
    id uuid default gen_random_uuid() primary key,
    sku text references public.inventory(sku) on delete cascade,
    type text check (type in ('restock', 'sale', 'correction')),
    amount integer not null,
    note text,
    user_id uuid references public.profiles(id),
    created_at timestamptz default now()
);
alter table public.stock_movements enable row level security;
-- 4. ORDERS (Objednávky)
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    customer_email text not null,
    total numeric not null,
    status text default 'pending' check (status in ('pending', 'paid', 'shipped')),
    items jsonb not null,
    delivery_info jsonb,
    is_subscription_order boolean default false,
    created_at timestamptz default now()
);
alter table public.orders enable row level security;
-- 5. SITE CONTENT (Dynamické texty webu - CMS)
create table if not exists public.site_content (
    id text primary key,
    content jsonb not null,
    updated_at timestamptz default now()
);
alter table public.site_content enable row level security;
--------------------------------------------------------------------------------
-- RLS POLICIES (Oprávnění)
--------------------------------------------------------------------------------
-- Profiles
create policy "Users can view their own profile" on public.profiles for
select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for
update using (auth.uid() = id);
-- Inventory & Stock Movements
create policy "Public can read inventory" on public.inventory for
select using (true);
create policy "Admins can manage inventory" on public.inventory for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins can manage stock_movements" on public.stock_movements for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
-- Orders
create policy "Admins can manage orders" on public.orders for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
-- Site Content
create policy "Public can read site content" on public.site_content for
select using (true);
create policy "Admins can manage site content" on public.site_content for all using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
--------------------------------------------------------------------------------
-- AUTOMATIZACE (Triggery)
--------------------------------------------------------------------------------
-- Funkce pro vytvoření profilu při signup
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, email, full_name, role)
values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        'user'
    );
return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- Funkce pro update skladu pomocí RPC (volitelné pro InventoryContext)
create or replace function public.handle_stock_movement(
        p_sku text,
        p_type text,
        p_amount integer,
        p_note text default null
    ) returns void as $$ begin
insert into public.stock_movements (sku, type, amount, note, user_id)
values (p_sku, p_type, p_amount, p_note, auth.uid());
update public.inventory
set quantity = quantity + p_amount
where sku = p_sku;
end;
$$ language plpgsql security definer;