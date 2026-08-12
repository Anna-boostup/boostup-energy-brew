-- =====================================================================
-- Test: handle_stock_movement — blokace přeprodeje (single-session)
--
-- Ověřuje, že prodej (p_type='sale') nikdy nesníží sklad pod nulu a že
-- ostatní typy pohybů (restock/correction) blokaci nepodléhají.
--
-- BEZPEČNÉ pro Supabase dev: běží v transakci a na konci ROLLBACK, takže
-- po sobě nezanechá žádná data. Používá dočasné SKU '__test_oversell__'.
--
-- Spuštění:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/handle_stock_movement.test.sql
--   nebo vložit celé do Supabase SQL editoru (dev) a spustit.
--
-- Úspěch = NOTICE "ALL SINGLE-SESSION ASSERTIONS PASSED".
-- Jakýkoli neúspěch skript shodí s chybou "FAIL #...".
-- =====================================================================
begin;

insert into public.inventory (sku, quantity) values ('__test_oversell__', 10)
  on conflict (sku) do update set quantity = 10;

do $$
declare v integer; rejected boolean;
begin
  -- 1) Platný prodej 4 ks: 10 -> 6
  perform public.handle_stock_movement('__test_oversell__','sale',-4,'test: valid sale');
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> 6 then raise exception 'FAIL #1 platný prodej: čekal 6, dostal %', v; end if;

  -- 2) Přeprodej 7 ks (skladem jen 6): musí být ODMÍTNUT (P0001), sklad beze změny
  rejected := false;
  begin
    perform public.handle_stock_movement('__test_oversell__','sale',-7,'test: oversell');
  exception when sqlstate 'P0001' then rejected := true;
  end;
  if not rejected then raise exception 'FAIL #2 přeprodej nebyl odmítnut'; end if;
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> 6 then raise exception 'FAIL #2 přeprodej změnil sklad: dostal %', v; end if;

  -- 3) Prodej přesně na nulu (6 -> 0) je povolen
  perform public.handle_stock_movement('__test_oversell__','sale',-6,'test: exact to zero');
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> 0 then raise exception 'FAIL #3 prodej na nulu: čekal 0, dostal %', v; end if;

  -- 4) Prodej 1 ks při nule: ODMÍTNUT, sklad zůstane 0
  rejected := false;
  begin
    perform public.handle_stock_movement('__test_oversell__','sale',-1,'test: sale at zero');
  exception when sqlstate 'P0001' then rejected := true;
  end;
  if not rejected then raise exception 'FAIL #4 prodej při nule nebyl odmítnut'; end if;
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> 0 then raise exception 'FAIL #4 sklad při nule se změnil: dostal %', v; end if;

  -- 5) Restock (+5) blokaci nepodléhá: 0 -> 5
  perform public.handle_stock_movement('__test_oversell__','restock',5,'test: restock');
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> 5 then raise exception 'FAIL #5 restock: čekal 5, dostal %', v; end if;

  -- 6) Korekce může jít i do mínusu (admin override, není to prodej): 5 -> -3
  perform public.handle_stock_movement('__test_oversell__','correction',-8,'test: negative correction');
  select quantity into v from public.inventory where sku='__test_oversell__';
  if v <> -3 then raise exception 'FAIL #6 korekce: čekal -3, dostal %', v; end if;

  -- 7) Prodej neexistujícího SKU je odmítnut (0 řádků updatnuto)
  rejected := false;
  begin
    perform public.handle_stock_movement('__nope__','sale',-1,'test: unknown sku');
  exception when sqlstate 'P0001' then rejected := true;
  end;
  if not rejected then raise exception 'FAIL #7 prodej neznámého SKU nebyl odmítnut'; end if;

  raise notice 'ALL SINGLE-SESSION ASSERTIONS PASSED';
end $$;

rollback;
