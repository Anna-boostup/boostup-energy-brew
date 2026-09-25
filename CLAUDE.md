# CLAUDE.md – BoostUp e-shop (boostup-energy-brew)

Kontext pro Clauda při práci na tomto repu. Repo patří klientovi (`Anna-boostup/boostup-energy-brew`), Zdeněk ho vyvíjí.

## Co to je
E-shop BoostUp Energy (drinkboostup.cz): React + Vite + TypeScript + Tailwind + shadcn/ui, backend Supabase (Postgres, Auth, RLS), serverless API ve `api/` na Vercelu.
Platby: Stripe (Checkout, Payment Intent, Apple/Google Pay express), GoPay. Doprava: Packeta/Zásilkovna. E-maily: Resend. Monitoring: Sentry. Export do Money S3.

## Větve a nasazení – POZOR
`development` → (Test Pipeline OK) → automaticky `preview` → ručně `promote-to-main` → `main` = **produkce**.
- Push do `development` spouští test pipeline a po úspěchu **automatický merge do `preview`** a nasazení preview.
- `main` jde do produkce. Promote spouštěj jen po domluvě se Zdeňkem.
- Verze bumpuje CI (`chore(release): vX.Y.Z [skip ci]`), ručně je neměň.
- V repu běží i Claude Code / code-review workflow.

## Ověření změn
```bash
npm run lint && npm run lint:api && npm run typecheck
npm test                 # vitest
npm run test:e2e         # Playwright (potřebuje .env s testovacími účty)
```

## Kritická pravidla domény
- **Zdroj pravdy ceny je CZK.** Přepočet měny a výpočet dopravy probíhá **na serveru** v `api/secure-calculator.ts`, sdíleném všemi platebními bránami (create-stripe-session, create-payment-intent, create-gopay-payment). Klientovi se nikdy nevěří.
- Doprava je **pásmová podle počtu lahví** (balení × množství). Konfigurace zemí je JSON v `app_settings.shipping_countries` a upravuje se v adminu `/admin/shipping`. `order.total` zůstává v CZK.
- DPH: ceny jsou včetně DPH (`total/1.21` v exportu).
- Sklad: `handle_stock_movement` blokuje přeprodej atomicky (nesmí spadnout pod 0). Serverovou blokaci nepřepisuj neatomickým fallbackem.
- Renewaly předplatného jsou idempotentní (`subscription_renewals.invoice_id` PK).
- Endpointy: auth (admin nebo vlastník), příjemce e-mailu vždy z objednávky, ne z requestu. Crony jsou fail-closed bez `CRON_SECRET`. Nelogovat tokeny.

## Databáze
- Migrace v `supabase/migrations/` (časové razítko). Volné `*.sql` v kořeni a v `supabase/` jsou historické ruční skripty. Nové změny dělej jen jako migrace.
- **Dev a prod mají odlišné schéma** (např. `stock_movements.type`: dev TEXT, prod ENUM `movement_type`), proto migrace píšeme portabilně. Skill `db-migration-safety`.
- Na každé nové tabulce RLS.

## Známé otevřené body
- Packeta packet má stále `<currency>CZK</currency>` (řešit u dobírky), GoPay potřebuje povolené EUR, SK checkout + express otestovat end-to-end.
- Odloženo: podepsaný unsubscribe odkaz, lazy-load jazyků, stránkování `select('*')`.
- ⚠️ **`.env` je trackovaný v gitu** a obsahuje testovací přihlašovací údaje (TEST_ADMIN_PASSWORD…). Doporučeno: vyřadit z gitu (`git rm --cached .env`), přidat do `.gitignore`, hesla testovacích účtů změnit a pro CI použít GitHub Secrets. Skill `secrets-env-checklist`.

## Git
Commity: konvenční prefixy s českým popisem (`fix(renewal): …`, `test(stock): …`, `chore(sentry): …`). Commit a push dělá Zdeněk na Macu.
