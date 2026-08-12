# Testy blokace přeprodeje (`handle_stock_movement`)

Ověřují migraci `supabase/migrations/20260812000001_block_oversell.sql` —
prodej nikdy nesníží sklad pod nulu ("Blokovat prodej").

## 1) Logika (single-session)
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/handle_stock_movement.test.sql
```
Běží v transakci s `ROLLBACK` na konci → nic po sobě nezanechá. Lze i vložit
do Supabase SQL editoru (dev). Úspěch = `NOTICE: ALL SINGLE-SESSION ASSERTIONS PASSED`.

Pokrývá: platný prodej, odmítnutý přeprodej (sklad beze změny), prodej přesně
na nulu, prodej při nule, restock/korekce bez blokace (i do mínusu), neznámé SKU.

## 2) Atomicita (souběh)
```bash
CONN="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
  bash supabase/tests/handle_stock_movement.concurrency.sh
```
Vypálí N souběžných prodejů proti skladu K (default 30 vs 10). Ověří, že uspěje
přesně K, zbytek se odmítne, sklad skončí na 0 a vznikne přesně K pohybů
(odmítnutá volání nezanechají phantom řádek). Uklidí po sobě SKU `__race__`.

Ověřeno lokálně na PostgreSQL 16: 30/10 → 10 ok, 20 odmítnuto, sklad 0, 10 pohybů.
