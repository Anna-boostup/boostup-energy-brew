-- Receptury: možnost zadat množství na várku (nejen na 1 lahvičku).
-- Additivní a bezpečné. Spustit v SQL editoru (DEV i PROD).
-- quantity_required zůstává; input_basis říká, zda je to na 1 ks nebo na várku;
-- batch_bottles = počet lahviček ve várce (jen když input_basis = 'batch').

ALTER TABLE public.recipe_rules
    ADD COLUMN IF NOT EXISTS input_basis text NOT NULL DEFAULT 'unit',
    ADD COLUMN IF NOT EXISTS batch_bottles integer;

ALTER TABLE public.recipe_rules DROP CONSTRAINT IF EXISTS recipe_rules_input_basis_chk;
ALTER TABLE public.recipe_rules
    ADD CONSTRAINT recipe_rules_input_basis_chk CHECK (input_basis IN ('unit','batch'));

ALTER TABLE public.recipe_rules DROP CONSTRAINT IF EXISTS recipe_rules_batch_bottles_chk;
ALTER TABLE public.recipe_rules
    ADD CONSTRAINT recipe_rules_batch_bottles_chk
    CHECK (input_basis <> 'batch' OR (batch_bottles IS NOT NULL AND batch_bottles > 0));
