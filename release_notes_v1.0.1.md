# Release Notes - Verze 1.0.1

## 🚀 Co je nového a co jsme opravili?

V této aktualizaci jsme se zaměřili na opravy chyb v administraci a drobná vylepšení uživatelského rozhraní na základě zpětné vazby z testování.

### 🐛 Opravy chyb (Bug Fixes)
- **Kritická oprava administrace**: Opravili jsme chybu `useEffect is not defined`, která způsobovala pád aplikace (Bílá obrazovka smrti / Error Boundary) při pokusu o načtení hlavního panelu (Admin Dashboard) a sekce Recenze (Admin Reviews). Nyní je přístup do všech sekcí administrace opět stabilní.
- **Oprava načítání dat**: Hooky v administraci byly správně importovány, což zabraňuje pádům při lazy-loadingu modulů.

### ✨ Vylepšení uživatelského rozhraní (UI/UX Improvements)
- **Vyladění postranního panelu (Sidebar)**: Upravili jsme pozici textu "ADMIN TERMINAL" v levém menu administrace. Text se nyní správně řadí pod logo a nepřekrývá se s tlačítkem "Vstoupit na web" (Zpět na hlavní stránku). Přidali jsme čistší a vzdušnější mezery pro lepší čitelnost.

## 📝 Další kroky
- Verze je aktuálně nasazena na testovacím prostředí (development).
- Po úspěšném průchodu testů bude verze připravena k překlopení na produkci.
