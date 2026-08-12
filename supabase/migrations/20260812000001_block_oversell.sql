-- =====================================================================
-- BoostUp — Blokace přeprodeje (atomický handle_stock_movement)
--
-- Volba uživatele: "Blokovat prodej" — nákup, který by hnal sklad do
-- mínusu, se atomicky ODMÍTNE (žádný přeprodej).
--
-- Chování:
--   p_type = 'sale'  -> odečet projde JEN když sklad nespadne pod nulu;
--                       jinak RAISE EXCEPTION (P0001, INSUFFICIENT_STOCK).
--   ostatní typy      -> restock/korekce/výroba beze změny (bez blokace),
--                       aby admin mohl klidně dělat i záporné korekce.
--
-- Vše v jedné funkci = jedna transakce = atomické (souběžné objednávky
-- se nepřeperou; kontrola i zápis jsou v jednom UPDATE ... WHERE).
-- SECURITY DEFINER: anonymní checkout smí měnit sklad jen přes tuto fci.
-- =====================================================================

create or replace function public.handle_stock_movement(
    p_sku text,
    p_type text,
    p_amount integer,
    p_note text default null
) returns void as $$
declare
  v_rows integer;
begin
  if p_type = 'sale' then
    -- Atomický odečet s podmínkou: projde jen když výsledek >= 0.
    update public.inventory
       set quantity = coalesce(quantity, 0) + p_amount
     where sku = p_sku
       and coalesce(quantity, 0) + p_amount >= 0;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'INSUFFICIENT_STOCK for sku=% (amount=%)', p_sku, p_amount
        using errcode = 'P0001';
    end if;
  else
    -- restock / correction / manufacture apod. — bez blokace
    update public.inventory
       set quantity = coalesce(quantity, 0) + p_amount
     where sku = p_sku;
  end if;

  insert into public.stock_movements (sku, type, amount, note, user_id)
  values (p_sku, p_type, p_amount, p_note, auth.uid());
end;
$$ language plpgsql security definer set search_path = public;
