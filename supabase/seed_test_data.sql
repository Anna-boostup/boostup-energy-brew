-- SKRIPT PRO VYTVOŘENÍ TESTOVACÍCH DAT (Seed Data)
-- Spusťte v Supabase SQL Editoru PO spuštění schema_sync.sql
-- 1. VLOŽENÍ TESTOVACÍHO PRODUKTU (Inventory)
-- Poznámka: Tyto produkty odpovídají tomu, co aplikace očekává v kódu
insert into public.inventory (sku, name, quantity, price, image_url)
values (
        'boostup-classic-1',
        'BOOSTUP Classic (Balení 12ks)',
        48,
        890,
        'https://drinkboostup.cz/bottles.png'
    ),
    (
        'boostup-classic-6',
        'BOOSTUP Classic (Balení 6ks)',
        24,
        490,
        'https://drinkboostup.cz/bottles.png'
    ),
    (
        'boostup-trial',
        'BOOSTUP Trial Pack (3ks)',
        100,
        290,
        'https://drinkboostup.cz/bottles.png'
    ) on conflict (sku) do
update
set name = excluded.name,
    price = excluded.price,
    quantity = excluded.quantity;
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
        'boostup-classic-1',
        'restock',
        50,
        'Počáteční naskladnění pro testování'
    );