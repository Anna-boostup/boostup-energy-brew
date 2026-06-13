# Uživatelský a administrátorský manuál pro nové funkce

Tento manuál popisuje nově přidané funkce v aplikaci BoostUp, jak fungují pro koncového zákazníka a jak je lze spravovat v administraci.

## 1. Zákaznické recenze (UGC)
Zákazníci nyní mohou hodnotit produkty a psát k nim recenze. Tato funkce pomáhá budovat důvěru (social proof).

* **Kde to najde zákazník:** Přímo na domovské stránce (nebo stránce produktu). Zákazník musí vyplnit jméno, hodnocení (1-5 hvězdiček) a text recenze.
* **Kde to spravuje administrátor:** 
  * V postranním panelu administrace přibyla záložka **Recenze**.
  * Každá nová recenze má stav "čekající" (`pending`). Dokud ji administrátor neschválí (nepřepne na `approved`), na webu se neobjeví. 
  * Administrátor může recenze i mazat.
* **Jak funkci zapnout/vypnout:** V administraci v záložce **Nástěnka (Dashboard)** -> Sekce **Nastavení funkcí** -> Přepínač *Recenze na webu*.

## 2. Doporučovací program (Referral)
Vaši stávající zákazníci mohou sdílet odkaz na e-shop svým přátelům. Získají tak za to odměnu (kredit).

* **Kde to najde zákazník:** Zákazník musí být přihlášený. Ve svém účtu v záložce **Získej odměnu** najde svůj unikátní sledovací odkaz. Tam také vidí statistiku: kolikrát někdo nakoupil přes jeho odkaz a jaký získal kredit na svůj další nákup.
* **Jak to technicky funguje:** Odkaz má parametr `?ref=KOD`. Pokud někdo přijde přes tento odkaz a nakoupí, systém připíše odměnu do profilu doporučujícího.
* **Jak funkci zapnout/vypnout:** V administraci v záložce **Nástěnka** -> Sekce **Nastavení funkcí** -> Přepínač *Referral program*. Výchozí stav je vypnuto.

## 3. Upsell v košíku
Jednoduchá nabídka "Mohlo by se hodit", která se ukáže těsně před zaplacením, a motivuje k přidání dalšího drobného produktu do košíku.

* **Kde to najde zákazník:** Uvnitř vysouvacího košíku (Cart Drawer). Pokud je funkce zapnutá, ukáže se zkrácená karta produktu s tlačítkem "Přidat". Pokud už daný produkt v košíku zákazník má, nabídka se logicky schová.
* **Jak funkci zapnout/vypnout:** V administraci v záložce **Nástěnka** -> Sekce **Nastavení funkcí** -> Přepínač *Upselling*. Výchozí stav je vypnuto.

## 4. XML Feedy pro Heureku a Google Nákupy
Aplikace nově automaticky generuje XML feedy pro srovnávače cen a PPC kampaně. Tyto feedy se dynamicky aktualizují podle položek v tabulce `products`.

* **Heureka feed:** Dostupný na URL `/api/feed-heureka`
* **Google Merchant (RSS):** Dostupný na URL `/api/feed-google`
* **Jak to použít:** Zkopírujte tyto odkazy a vložte je do administrace Heureky nebo do Google Merchant Center. Systém se sám postará o jejich pravidelné stahování.

## 5. Analytika a E-commerce tracking (Meta Pixel & GA4)
Stránka je nově plně propojená s trackovacími nástroji pro marketing. 

* **Co se sleduje:** 
  * `PageView` (Meta Pixel i GA4) pro běžné návštěvy.
  * `add_to_cart` (Meta Pixel i GA4) – když zákazník přidá produkt do košíku. Zaznamená se cena, název a id produktu.
  * `purchase` (GA4) – odpaluje se ihned poté, co zákazník projde úspěšně platební bránou (Stripe nebo GoPay).
* **Poznámka:** Sledování respektuje Cookie lištu. Meta Pixel a pokročilé GA4 události se nespustí, dokud uživatel neodsouhlasí "Marketingové cookies".

## 6. Automatické PDF Faktury
Zákazníkům i vám se automaticky generují profesionální faktury v PDF formátu.

* **Kde to najde zákazník:** Zákazník si po úspěšném zaplacení může fakturu stáhnout ze sekce **Moje objednávky**.
* **Kde to najde administrátor:** V administraci v záložce **Objednávky** u každého detailu objednávky nahoře (vedle tlačítka pro tisk) přibylo i tlačítko pro uložení faktury do PDF.
* **Jak to funguje:** Systém automaticky poskládá údaje dodavatele, odběratele a rozpíše zakoupené položky z databáze do úhledného dokladu.

## 7. Automatické verzování
V zápatí (footer) se nově generuje číslo verze.

* **K čemu to je:** Usnadňuje to technickou podporu. Pokud něco nefunguje, stačí, aby nám zákazník řekl číslo verze, které vidí dole. My díky tomu přesně víme, jakou verzi kódu má nahranou.
* Tato verze se zároveň propisuje do Sentry (našeho nástroje pro automatické chytání chyb), takže vidíme přesně v jakém vydání webu k problému došlo.
