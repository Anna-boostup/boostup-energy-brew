-- RESTORE MIX SKUS (For Reverted Production)
-- Tento skript obnoví Mix produkty do databáze, které jsou potřeba pro původní verzi webu.
INSERT INTO public.inventory (
        sku,
        name,
        price,
        quantity,
        description,
        ingredients
    )
VALUES (
        'mix-3',
        '🌈 MIX příchutí (Balení 3 ks)',
        149,
        100,
        'Ochutnejte všechny příchutě v jednom balení',
        'Obsahuje Lemon Blast, Red Rush a Silky Leaf.'
    ),
    (
        'mix-12',
        '🌈 MIX příchutí (Balení 12 ks)',
        499,
        100,
        'Ideální zásoba všech oblíbených příchutí',
        'Obsahuje 4x Lemon, 4x Red a 4x Silky.'
    ),
    (
        'mix-21',
        '🌈 MIX příchutí (Balení 21 ks)',
        799,
        100,
        'Maximální balení pro opravdové fanoušky',
        'Obsahuje 7x Lemon, 7x Red a 7x Silky.'
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    quantity = EXCLUDED.quantity,
    description = EXCLUDED.description,
    ingredients = EXCLUDED.ingredients;