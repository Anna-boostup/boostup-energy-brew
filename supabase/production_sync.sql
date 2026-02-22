-- PRODUKČNÍ SYNCHRONIZAČNÍ SKRIPT (v2 - Robustní)
-- Tento skript zajistí, že produkční databáze bude mít stejnou strukturu a základní data jako testovací.
-- Lze jej bezpečně spustit i opakovaně.
-- 1. KONTROLA TABULKY A ZÁKLADNÍCH SLOUPCŮ (inventory)
DO $$ BEGIN -- Vytvoření tabulky, pokud vůbec neexistuje
IF NOT EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'inventory'
) THEN CREATE TABLE public.inventory (sku text PRIMARY KEY);
END IF;
-- Kontrola a přidání všech potřebných sloupců
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'name'
) THEN
ALTER TABLE public.inventory
ADD COLUMN name text;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'quantity'
) THEN
ALTER TABLE public.inventory
ADD COLUMN quantity integer DEFAULT 0;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'price'
) THEN
ALTER TABLE public.inventory
ADD COLUMN price numeric DEFAULT 0;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'description'
) THEN
ALTER TABLE public.inventory
ADD COLUMN description text;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'ingredients'
) THEN
ALTER TABLE public.inventory
ADD COLUMN ingredients text;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'tooltip'
) THEN
ALTER TABLE public.inventory
ADD COLUMN tooltip text;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'is_on_sale'
) THEN
ALTER TABLE public.inventory
ADD COLUMN is_on_sale boolean DEFAULT false;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inventory'
        AND column_name = 'image_url'
) THEN
ALTER TABLE public.inventory
ADD COLUMN image_url text;
END IF;
END $$;
-- 2. KONTROLA TABULKY A SLOUPCŮ (orders)
DO $$ BEGIN IF NOT EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'orders'
) THEN CREATE TABLE public.orders (id uuid DEFAULT gen_random_uuid() PRIMARY KEY);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
        AND column_name = 'is_subscription_order'
) THEN
ALTER TABLE public.orders
ADD COLUMN is_subscription_order boolean DEFAULT false;
END IF;
END $$;
-- 3. SYNCHRONIZACE PRODUKTŮ (SKUs)
-- Vloží chybějící SKUs nebo aktualizuje existující
INSERT INTO public.inventory (
        sku,
        name,
        price,
        description,
        tooltip,
        ingredients,
        quantity
    )
VALUES (
        'lemon',
        '🍋 Lemon Blast',
        59,
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Energie na celý den bez crash efektu.',
        'Voda, citronová šťáva, kofein, L-theanin...',
        0
    ),
    (
        'lemon-3',
        '🍋 Lemon Blast (3 ks)',
        149,
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Balení 3 kapslí pro rychlý start.',
        'Voda, citronová šťáva, kofein, L-theanin...',
        0
    ),
    (
        'lemon-12',
        '🍋 Lemon Blast (12 ks)',
        499,
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Zásoba na celý měsíc pro maximální výkon.',
        'Voda, citronová šťáva, kofein, L-theanin...',
        0
    ),
    (
        'lemon-21',
        '🍋 Lemon Blast (21 ks)',
        799,
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Nejvýhodnější balení pro profíky.',
        'Voda, citronová šťáva, kofein, L-theanin...',
        0
    ),
    (
        'red',
        '🍓 Red Rush',
        59,
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Rychlý nával energie z guarany.',
        'Voda, červené ovoce, guarana, kofein...',
        0
    ),
    (
        'red-3',
        '🍓 Red Rush (3 ks)',
        149,
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Kombinace guarany a lesních plodů.',
        'Voda, červené ovoce, guarana, kofein...',
        0
    ),
    (
        'red-12',
        '🍓 Red Rush (12 ks)',
        499,
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Energie s chutí léta.',
        'Voda, červené ovoce, guarana, kofein...',
        0
    ),
    (
        'red-21',
        '🍓 Red Rush (21 ks)',
        799,
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Měsíční kúra pro vytrvalý náboj.',
        'Voda, červené ovoce, guarana, kofein...',
        0
    ),
    (
        'silky',
        '🌿 Silky Leaf',
        59,
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Klidná síla zeleného čaje.',
        'Voda, zelený čaj, meduňka, L-theanin...',
        0
    ),
    (
        'silky-3',
        '🌿 Silky Leaf (3 ks)',
        149,
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Zklidnění a soustředění v jednom.',
        'Voda, zelený čaj, meduňka, L-theanin...',
        0
    ),
    (
        'silky-12',
        '🌿 Silky Leaf (12 ks)',
        499,
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Čistá mysl každý den.',
        'Voda, zelený čaj, meduňka, L-theanin...',
        0
    ),
    (
        'silky-21',
        '🌿 Silky Leaf (21 ks)',
        799,
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Maximální balení pro harmonickou produktivitu.',
        'Voda, zelený čaj, meduňka, L-theanin...',
        0
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    tooltip = EXCLUDED.tooltip,
    ingredients = EXCLUDED.ingredients;
-- 4. NASTAVENÍ POČÁTEČNÍHO SKLADU (Pouze u prázdných zásob)
UPDATE public.inventory
SET quantity = 100
WHERE quantity = 0;
-- 5. SITE CONTENT (CMS)
INSERT INTO public.site_content (id, content)
VALUES (
        'main',
        '{
    "hero": {
        "announcement": "NOVINKA: PŘÍRODNÍ ENERGIE BRZY NA TRHU",
        "headline": { "part1": "ENERGIE", "gradient": "NA CELÝ DEN", "part2": "přirozeně." },
        "description": "6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity. Žádná umělá sladidla a aromata.",
        "cta": { "primary": "Chci koupit", "secondary": "Chci objevit více", "concept3b": "Koncept 3B" }
    }
}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;
-- 6. RPC FUNKCE
CREATE OR REPLACE FUNCTION public.handle_stock_movement(
        p_sku text,
        p_type text,
        p_amount integer,
        p_note text DEFAULT null
    ) RETURNS void AS $$ BEGIN
INSERT INTO public.stock_movements (sku, type, amount, note, user_id)
VALUES (p_sku, p_type, p_amount, p_note, auth.uid());
UPDATE public.inventory
SET quantity = quantity + p_amount
WHERE sku = p_sku;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;