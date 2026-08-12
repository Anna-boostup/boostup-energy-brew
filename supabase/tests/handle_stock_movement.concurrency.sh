#!/usr/bin/env bash
# =====================================================================
# Test atomicity: handle_stock_movement nesmí přeprodat ani při souběhu.
#
# Vypálí N souběžných prodejů po 1 ks proti skladu K (K < N). Očekává:
#   - přesně K prodejů uspěje, zbytek (N-K) je odmítnut,
#   - výsledný sklad = 0 (nikdy mínus),
#   - přesně K řádků ve stock_movements (odmítnuté volání nesmí zanechat
#     "phantom" pohyb — INSERT je ve stejné transakci jako neúspěšný UPDATE).
#
# Připojení: nastav standardní PG* proměnné (PGHOST/PGPORT/PGUSER/PGDATABASE/
# PGPASSWORD) nebo exportuj CONN, např.:
#   CONN="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
#     bash supabase/tests/handle_stock_movement.concurrency.sh
# Používá dočasné SKU '__race__' a na konci ho i s pohyby uklidí.
# =====================================================================
set -u
PSQL="psql ${CONN:-} -tAq -v ON_ERROR_STOP=1"
N=${N:-30}   # souběžných prodejů
K=${K:-10}   # počáteční sklad

$PSQL -c "insert into public.inventory(sku,quantity) values('__race__',$K) on conflict(sku) do update set quantity=$K;" >/dev/null
$PSQL -c "delete from public.stock_movements where sku='__race__';" >/dev/null

TMP=$(mktemp -d); 
for i in $(seq 1 "$N"); do
  ( $PSQL -c "select public.handle_stock_movement('__race__','sale',-1,'race $i');" >/dev/null 2>&1 \
      && echo ok > "$TMP/$i" || echo rej > "$TMP/$i" ) &
done
wait

OK=$(grep -l ok "$TMP"/* 2>/dev/null | wc -l | tr -d ' ')
REJ=$(grep -l rej "$TMP"/* 2>/dev/null | wc -l | tr -d ' ')
FINAL=$($PSQL -c "select quantity from public.inventory where sku='__race__';" | tr -d ' ')
MOVES=$($PSQL -c "select count(*) from public.stock_movements where sku='__race__' and type='sale';" | tr -d ' ')

echo "souběžných prodejů : $N"
echo "uspělo             : $OK  (očekáváno $K)"
echo "odmítnuto          : $REJ  (očekáváno $((N-K)))"
echo "výsledný sklad     : $FINAL  (očekáváno 0)"
echo "pohybů 'sale'      : $MOVES  (očekáváno $K — žádné phantom řádky)"

# úklid
$PSQL -c "delete from public.stock_movements where sku='__race__'; delete from public.inventory where sku='__race__';" >/dev/null
rm -rf "$TMP"

if [ "$OK" = "$K" ] && [ "$REJ" = "$((N-K))" ] && [ "$FINAL" = "0" ] && [ "$MOVES" = "$K" ]; then
  echo "CONCURRENCY TEST: PASS"
  exit 0
else
  echo "CONCURRENCY TEST: FAIL"
  exit 1
fi
