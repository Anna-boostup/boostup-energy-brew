### 🚀 Velký produkční Release: BoostUp E-shop (Červen 2026)

Tento release přináší zásadní rozšíření administrace pro velkoobchod, propracované správcovské funkce pro sklady a e-mailový marketing, a posouvá spolehlivost celého systému na enterprise úroveň díky plné automatizaci testování.

#### 🏢 B2B Partneři a Fakturace
*   **Nový modul B2B:** Správa velkoobchodních a B2B partnerů přímo v administraci.
*   **ARES Integrace:** Automatické doplňování informací o firmě na základě IČO.
*   **Faktury:** Nový vzhled faktur plně sladěný s naším brandem.

#### 📦 Objednávky a Manuální prodej
*   **Manuální objednávky:** Správce nyní může tvořit objednávky ručně přímo ze systému – podpora vlastních "promo" cen a nových metod platby.
*   **Hromadné akce:** Nové tlačítko pro okamžité označení objednávky jako "Vyřízená" (Completed).
*   **Reporting:** Nasazen měsíční **automatický e-mailový report** prodeje. Reporty lze filtrovat a dělí prodeje na e-shopové a ty vytvořené manuálně administrátorem.
*   **UI pro mobilní zařízení:** Přidány popisky k akcím (tooltips) pro pohodlnější správu objednávek z mobilu.

#### 🏭 Sklad a Výroba
*   **Obalové materiály:** Aplikace nyní automaticky odečítá použitý obalový materiál ze skladu podle objednávek!
*   **Rychlé naskladňování:** Nová "Batch" funkce (dávkové zpracování) pro bleskové doplnění stavu zásob na jedno kliknutí, bez složitého proklikávání. Opraveny informační štítky skladu.

#### 📧 Marketing a Komunikace
*   **Odběry Newsletteru:** Plně nasazen "Double Opt-in" (ověřování e-mailů). Systém pozná duplicitní přihlášení a neumožní ho. Byla přidána vlastní unikátní "Uvítací" šablona pro nové odběratele.
*   **Správa E-mailů:** 
    * Náhledy zpráv roztáhnuté přes celou obrazovku (Full-width Preview).
    * Testovací e-maily nyní můžete poslat na **více adres najednou** (oddělením čárkou).
    * Synchronizace šablon. Opraveno renderování v Gmailu (tabulky se už nebudou lámat).
*   **Příchozí dotazy:** Nové tlačítko "Označit vše jako přečtené" v sekci Zprávy a upravený, čitelnější kontrast tlačítek.

#### ⚙️ Správa profilu a Příručka (Admin Panel)
*   **Profil správce:** Zcela nový komponent pro **nahrávání vlastní profilové fotky** přímo z počítače (už nepotřebujete URL adresu obrázku). Panel navíc ukazuje celé jméno a e-mail správce.
*   **Role v systému:** Do menu nastavení přidáno ovládání, kdo z uživatelů bude dostávat reporty.
*   **Příručka:** Obrovský update nápovědy. Detailní manuály pro tvorbu manuálních objednávek a práci s reporty včetně rozklikávacích ukázkových fotek. Sjednocení barev ikon levého menu do značkové `olive-light` pro lepší přehlednost.

#### 🛠 Bezpečnost, Testování a Stabilita
*   **Absolutní spolehlivost prodeje:** Implementovali jsme obrovský robustní testovací stroj pro simulaci "živých nákupů". Systém nyní sám přes **Playwright** zkouší klikat v e-shopu a testuje zaplacení přes **Stripe** i **GoPay** (včetně 3D Secure ověření a zamítnutých karet). Pokud by v budoucnu platební brána selhala, dozvíme se to ještě před nasazením k lidem.
*   **Vizuální & A11y testy:** Nasazena AI detekce neviditelných vizuálních chyb a zajištění plné přístupnosti webu (Aria štítky) – což mimo jiné zvyšuje **SEO hodnocení** na Googlu.
*   **Fixy:** Opraveno nesprávné přesměrování u Stripe (pokud zákazník platbu zrušil, vracel se na neexistující adresu). Stabilizováno sledování více produktů ve stejném košíku. Aplikovány bezpečnostní filtry proti injekcím XSS.
