#!/bin/bash

# Zastavit skript při jakékoli chybě
set -e

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Spouštím manuální Test & Promote...${NC}"

# 1. Kontrola větve
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "development" ]; then
    echo -e "${RED}❌ Chyba: Musíte být na větvi 'development'. Aktuální větev: $CURRENT_BRANCH${NC}"
    exit 1
fi

# 2. Nasazení na Vercel Preview
echo -e "${BLUE}📦 Nasazuji na Vercel (Preview)...${NC}"
# Použijeme standardní vercel deploy, který vytvoří náhledovou URL
DEPLOYMENT_URL=$(vercel deploy)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Chyba: Nepodařilo se získat URL nasazení z Vercelu.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nasazeno na: $DEPLOYMENT_URL${NC}"

# 3. Spuštění E2E testů
echo -e "${BLUE}🧪 Spouštím E2E testy (Playwright)...${NC}"
# Nastavíme základní URL pro Playwright
export PLAYWRIGHT_TEST_BASE_URL=$DEPLOYMENT_URL

# Načtení bypass secretu pro preview, pokud je v .env
if [ -f .env ]; then
    export $(grep VERCEL_AUTOMATION_BYPASS_SECRET .env | xargs)
fi

npx playwright test tests/smoke.spec.ts tests/checkout_scenarios.spec.ts tests/admin.spec.ts tests/mobile.spec.ts tests/admin-mobile.spec.ts

echo -e "${GREEN}✅ Testy prošly!${NC}"

# 4. Promote do větve preview
echo -e "${BLUE}📈 Povyšuji změny do větve 'preview'...${NC}"

# Ujistíme se, že máme čistý pracovní adresář
if [[ $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Chyba: Pracovní adresář není čistý. Commitněte prosím změny před pokračováním.${NC}"
    exit 1
fi

# Sync s origin
git fetch origin

# Přepnutí na preview a merge
git checkout preview
git pull origin preview
git merge development --no-ff -m "chore: manual promote from development to preview (Bypassing GitHub Actions)"

# Push do origin
git push origin preview

# Přepnutí zpět na development
git checkout development

echo -e "${GREEN}🎉 Hotovo! Změny byly otestovány a nahrány do větve 'preview'.${NC}"
