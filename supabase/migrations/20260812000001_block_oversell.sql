-- =====================================================================
-- BoostUp — Blokace přeprodeje (atomický handle_stock_movement)
--
-- Volba uživatele: "Blokovat prodej" — nákup, který by hnal sklad do
-- mínusu, se atomicky ODMÍTNE (žádný přeprodej).
--
-- Chování:
--   p_type = 'sale'  -> odečet projde JEN když sklad nespadne pod nulu;
--                       jinak RAISE EXCEPTION (P0001, INSUFFICIENT_STOCK).
--   ostatní typy      -> restock/korekce/výroba beze změny (bez blokace).
--
-- Portabilní: na některých projektech je stock_movements.type typu text,
-- na jiných enum `movement_type`. DO blok detekuje enum a podle toho
-- přetypuje p_type v INSERTu (jinak by prod schéma spadlo na 42804).
--
-- Vše v jedné funkci = jedna transakce = atomické (souběžné objednávky
-- se nepřeperou; kontrola i zápis jsou v jednom UPDATE ... WHERE).
-- SECURITY DEFINER: anonymní checkout smí měnit sklad jen přes tuto fci.
-- =====================================================================

do $mig$
declare
  type_expr text := 'p_type';  -- default: sloupec type je text
begin
  if exists (select 1 from pg_type where typname = 'movement_type') then
    type_expr := 'p_type::movement_type';  -- sloupec type je enum
  end if;

  execute format($fn$
    create or replace function public.handle_stock_movement(
        p_sku text, p_type text, p_amount integer, p_note text default null
    ) returns void as $body$
    declare v_rows integer;
    begin
      if p_type = 'sale' then
        update public.inventory
           set quantity = coalesce(quantity, 0) + p_amount
         where sku = p_sku
           and coalesce(quantity, 0) + p_amount >= 0;
        get diagnostics v_rows = row_count;
        if v_rows = 0 then
          raise exception 'INSUFFICIENT_STOCK for sku=%% (amount=%%)', p_sku, p_amount
            using errcode = 'P0001';
        end if;
      else
        update public.inventory
           set quantity = coalesce(quantity, 0) + p_amount
         where sku = p_sku;
      end if;
      insert into public.stock_movements (sku, type, amount, note, user_id)
      values (p_sku, %s, p_amount, p_note, auth.uid());
    end;
    $body$ language plpgsql security definer set search_path = public;
  $fn$, type_expr);
end $mig$;
