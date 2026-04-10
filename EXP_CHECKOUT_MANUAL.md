# MANUÁL: Expresní Pokladna BoostUp (Apple & Google Pay)

Tento dokument slouží jako návod pro aktivaci a správu funkce "Expresní nákup", která byla implementována pro zvýšení konverzí na mobilních zařízeních.

## 1. Přehled funkce
Expresní pokladna umožňuje zákazníkům zaplatit jedním kliknutím pomocí nativního rozhraní jejich telefonu (FaceID na iPhonech, otisk prstu na Androidu).

- **Umístění**: Horní část pokladny (CheckoutPage).
- **Automatizace**: Systém automaticky načte doručovací údaje zákazníka (jméno, adresa, e-mail) přímo z jeho platebního profilu.
- **Slevy**: Podporuje zadání slevového kódu před samotnou platbou.
- **Doprava**: Automaticky kalkuluje dopravu (Zdarma nad 1500 Kč nebo u 21-packu, jinak 79 Kč).

## 2. Technický stav
- **Větev (Branch)**: `feature/express-checkout`
- **Technologie**: Stripe Payment Request API (nativní integrace).

## 3. Postup aktivace (Kritické kroky)

Aby se tlačítka Apple Pay a Google Pay zákazníkům skutečně zobrazila, je nutné provést následující kroky v administraci Stripe:

### Krok A: Registrace domény pro Apple Pay
1. Přihlaste se do vašeho **Stripe Dashboardu**.
2. Přejděte do: **Settings** -> **Payment Methods** -> **Apple Pay**.
3. Klikněte na **+ Add new domain**.
4. Zadejte doménu (např. `test.drinkboostup.cz` pro testování nebo `drinkboostup.cz` pro produkci).
5. Stripe vám nabídne ke stažení ověřovací soubor. Tento soubor je již v projektu připraven v cestě `/public/.well-known/apple-developer-merchantid-domain-association`. Pokud by soubor od Stripe obsahoval jiný kód, nahraďte jím ten stávající.
6. Klikněte na **Verify**.

### Krok B: Aktivace platebních metod
V sekci **Settings** -> **Payment Methods** se ujistěte, že jsou Apple Pay a Google Pay v režimu **Enabled**.

## 4. Testování
1. Otevřete Preview URL z Vercelu (pro větev `feature/express-checkout`) na svém iPhonu/Androidu.
2. Pokud máte v telefonu nastavenou platební kartu, uvidíte černé tlačítko "Apple Pay" nebo "Google Pay".
3. Klikněte na tlačítko a ověřte, že se vysuvná karta se shrnutím objednávky zobrazuje správně (včetně dopravy).

---
*Dokument připravil: Podpora Antigravity AI*
