-- SKRIPT PRO VYTVOŘENÍ TESTOVACÍCH DAT (Seed Data)
-- Spusťte v Supabase SQL Editoru PO spuštění schema_sync.sql
-- 1. VLOŽENÍ TESTOVACÍHO PRODUKTU (Inventory)
-- Poznámka: Tyto produkty odpovídají tomu, co aplikace očekává v kódu
insert into public.inventory (
        sku,
        name,
        quantity,
        price,
        image_url,
        description,
        ingredients
    )
values (
        'lemon',
        '🍋 Lemon Blast (Samostatná lahev)',
        0,
        59,
        'https://drinkboostup.cz/bottles.png',
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Voda, citronová šťáva (15%), kofein (150mg/shot), L-theanin, vitamín B6, B12, stévie, přírodní aroma.'
    ),
    (
        'lemon-3',
        '🍋 Lemon Blast (Balení 3 ks)',
        0,
        149,
        'https://drinkboostup.cz/bottles.png',
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Voda, citronová šťáva (15%), kofein (150mg/shot), L-theanin, vitamín B6, B12, stévie, přírodní aroma.'
    ),
    (
        'lemon-12',
        '🍋 Lemon Blast (Balení 12 ks)',
        0,
        499,
        'https://drinkboostup.cz/bottles.png',
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Voda, citronová šťáva (15%), kofein (150mg/shot), L-theanin, vitamín B6, B12, stévie, přírodní aroma.'
    ),
    (
        'lemon-21',
        '🍋 Lemon Blast (Balení 21 ks)',
        0,
        799,
        'https://drinkboostup.cz/bottles.png',
        'Citrusová svěžest a energie pro jasnou a soustředěnou mysl',
        'Voda, citronová šťáva (15%), kofein (150mg/shot), L-theanin, vitamín B6, B12, stévie, přírodní aroma.'
    ),
    (
        'red',
        '🍓 Red Rush (Samostatná lahev)',
        0,
        59,
        'https://drinkboostup.cz/bottles.png',
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Voda, šťáva z červeného ovoce, guarana extrakt, kofein (120mg/shot), vitamín C, stévie.'
    ),
    (
        'red-3',
        '🍓 Red Rush (Balení 3 ks)',
        0,
        149,
        'https://drinkboostup.cz/bottles.png',
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Voda, šťáva z červeného ovoce, guarana extrakt, kofein (120mg/shot), vitamín C, stévie.'
    ),
    (
        'red-12',
        '🍓 Red Rush (Balení 12 ks)',
        0,
        499,
        'https://drinkboostup.cz/bottles.png',
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Voda, šťáva z červeného ovoce, guarana extrakt, kofein (120mg/shot), vitamín C, stévie.'
    ),
    (
        'red-21',
        '🍓 Red Rush (Balení 21 ks)',
        0,
        799,
        'https://drinkboostup.cz/bottles.png',
        'Červené ovoce a guarana pro tvůj rychlý a efektivní start',
        'Voda, šťáva z červeného ovoce, guarana extrakt, kofein (120mg/shot), vitamín C, stévie.'
    ),
    (
        'silky',
        '🌿 Silky Leaf (Samostatná lahev)',
        0,
        59,
        'https://drinkboostup.cz/bottles.png',
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Voda, extrakt ze zeleného čaje, meduňka, L-theanin, přírodní sladidla.'
    ),
    (
        'silky-3',
        '🌿 Silky Leaf (Balení 3 ks)',
        0,
        149,
        'https://drinkboostup.cz/bottles.png',
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Voda, extrakt ze zeleného čaje, meduňka, L-theanin, přírodní sladidla.'
    ),
    (
        'silky-12',
        '🌿 Silky Leaf (Balení 12 ks)',
        0,
        499,
        'https://drinkboostup.cz/bottles.png',
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Voda, extrakt ze zeleného čaje, meduňka, L-theanin, přírodní sladidla.'
    ),
    (
        'silky-21',
        '🌿 Silky Leaf (Balení 21 ks)',
        0,
        799,
        'https://drinkboostup.cz/bottles.png',
        'Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii',
        'Voda, extrakt ze zeleného čaje, meduňka, L-theanin, přírodní sladidla.'
    ) on conflict (sku) do
update
set name = excluded.name,
    price = excluded.price,
    quantity = excluded.quantity,
    description = excluded.description,
    ingredients = excluded.ingredients;
-- 2. VLOŽENÍ VÝCHOZÍHO OBSAHU PRO CMS (site_content)
-- Toto předvyplní Hero sekci, takže ji hned uvidíte v administraci
insert into public.site_content (id, content)
values (
        'main',
        '{
    "hero": {
        "announcement": "NOVINKA: PŘÍRODNÍ ENERGIE BRZY NA TRHU",
        "headline": {
            "part1": "ENERGIE",
            "gradient": "NA CELÝ DEN",
            "part2": "přirozeně."
        },
        "description": "6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity. Žádná umělá sladidla a aromata.",
        "cta": {
            "primary": "Chci koupit",
            "secondary": "Chci objevit více",
            "concept3b": "Koncept 3B"
        }
    }
}'::jsonb
    ) on conflict (id) do nothing;
-- 3. DOPORUČENÍ: Vytvoření testovacího pohybu na skladě
-- (Předpokládá, že máte vytvořený profil, jinak user_id smažte nebo nechte null)
insert into public.stock_movements (sku, type, amount, note)
values (
        'lemon-12',
        'restock',
        10,
        'Počáteční naskladnění pro testování'
    );