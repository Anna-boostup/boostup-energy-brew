/**
 * Centrální konfigurace textů webu.
 * Změnou textů v tomto souboru se upraví obsah na celém webu.
 */

export const SITE_CONTENT = {
    navigation: [
        { label: "Naše mise", href: "/#mise" },
        { label: "Produkty", href: "/#produkty" },
        { label: "3B Koncept", href: "/#3b" },
        { label: "Kontakt", href: "/#kontakt" },
    ],

    social: {
        instagram: "https://www.instagram.com/boost_up_czech/",
        facebook: "https://www.facebook.com/profile.php?id=61567084724538",
        linkedin: "https://www.linkedin.com/company/boost-up-czech/"
    },

    hero: {
        announcement: "BRZY NA TRHU",
        headline: {
            part1: "OBJEVTE NOVÝ STANDARD",
            gradient: "STABILNÍHO SOUSTŘEDĚNÍ",
            part2: "Efektivita, rychlost a přesnost i pod tlakem."
        },
        description: "Až 6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity. Žádná umělá sladidla a aromata.",
        testimonial: "Testováno mezi profesionály pracujícími pod vysokým tlakem.",
        cta: {
            primary: "Chci koupit",
            secondary: "Chci objevit více",
            concept3b: "Koncept 3B"
        },
        trustBadges: [
            "Přírodní stimulanty",
            "Elektrolyty",
            "Adaptogeny",
            "Vitamíny"
        ],
        benefits: [
            { bold: "Až 6 hodin energie", text: "bez pádu na konci" },
            { bold: "Přírodní extrakty", text: "bez cukru, bez umělých sladidel" },
            { bold: "Klid pod tlakem", text: "výkon bez chaosu" },
            { bold: "Vyvinuto s odborníky", text: "na Mendelově univerzitě" },
        ],
        tags: [
            { label: "SOUSTŘEDĚNÍ", ingredientId: "vitamins", colorClass: "bg-olive", dotColor: "#3d5a2f" },
            { label: "STIMULACE", ingredientId: "stimulants", colorClass: "bg-lime", dotColor: "#dfdf57" },
            { label: "ODOLNOST", ingredientId: "adaptogens", colorClass: "bg-orange", dotColor: "#f29739" },
            { label: "ROVNOVÁHA", ingredientId: "electrolytes", colorClass: "bg-terracotta", dotColor: "#aa263e" },
        ],
        badgeVisible: {
            hero: true,
            mission: true,
            contact: true,
            cta: true,
        },
        showDiscountPopup: true,
        discountCode: "BOOST10",
    },

    mission: {
        badge: "O NÁS",
        headline: {
            part1: "NAŠE",
            highlight: "MISE"
        },
        paragraphs: [
            "Každý z nás zná ten den, kdy se snažíte soustředit, dodělat úkol, ale mentální kapacita už nestačí. Káva už nepomáhá a klasické energetické nápoje?",
            "Ty sice přinesou rychlý příliv energie, ale za pár minut pocítíte útlum. Chtěli jsme to změnit.",
            "Proto jsme vytvořili BoostUp – čistý, efektivní shot, který vás udrží v optimální kondici po dlouhé hodiny."
        ],
        features: [
            {
                title: "Čistá energie",
                stat: "2.5x",
                description: "Síla 2,5 espressa v jednom shotu",
                color: "bg-lime"
            },
            {
                title: "Dlouhotrvající",
                stat: "6h+",
                description: "Dlouhotrvající soustředění bez crash efektu",
                color: "bg-terracotta"
            },
            {
                title: "Přírodní složení",
                stat: "100%",
                description: "Čajový extrakt, adaptogeny a vitamíny",
                color: "bg-olive"
            },
            {
                title: "Bez kompromisů",
                stat: "0%",
                description: "Žádná umělá sladidla ani konzervanty",
                color: "bg-orange"
            }
        ]
    },

    concept3b: {
        badge: "NÁŠ PŘÍSTUP",
        headline: "KONCEPT 3B",
        description: "Na český trh přinášíme unikátní přístup k energii. Tři pilíře, které na trhu chybí.",
        cta: "Objevit sílu 3B",
        concepts: [
            {
                id: "brain",
                title: "BRAIN",
                subtitle: "Kognitivní fokus",
                description: "Maximální mentální výkon a soustředění po celý pracovní den",
                stats: "Focus +85%",
                fullDescription: `
          BRAIN představuje první pilíř našeho konceptu 3B zaměřený na optimalizaci kognitivních funkcí.
          
          **Co obsahuje:**
          • L-theanin pro klidnou koncentraci bez nervozity
          • Guarana pro postupné uvolňování energie
          • B-komplex pro optimální funkci nervové soustavy
          
          **Přínosy:**
          • Zvýšená mentální ostrost a jasnost myšlení
          • Lepší schopnost soustředění na náročné úkoly
          • Podpora paměti a rychlosti zpracování informací
          • Žádný "brain fog" ani únava po odeznění účinku
          
          Ideální pro studenty, profesionály a každého, kdo potřebuje maximální mentální výkon.
        `
            },
            {
                id: "body",
                title: "BODY",
                subtitle: "Fyzická energie",
                description: "Trvalá fyzická energie bez nervozity a crash efektu",
                stats: "Energy +6h",
                fullDescription: `
          BODY je druhým pilířem zaměřeným na udržitelnou fyzickou energii po celý den.
          
          **Co obsahuje:**
          • Přírodní kofein v optimální dávce
          • Taurin pro podporu svalové výkonnosti
          • Elektrolyty pro správnou hydrataci
          
          **Přínosy:**
          • Stabilní energie po dobu 6+ hodin
          • Žádný prudký nástup ani následný "crash"
          • Podpora fyzické výkonnosti a vytrvalosti
          • Rychlejší regenerace po námaze
          
          Perfektní pro sportovce, aktivní lidi i ty, kdo potřebují energii na dlouhé pracovní dny.
        `
            },
            {
                id: "balance",
                title: "BALANCE",
                subtitle: "Harmonie",
                description: "Vyvážené složení pro optimální fungování těla i mysli",
                stats: "Stability 100%",
                fullDescription: `
          BALANCE je třetím pilířem, který spojuje BRAIN a BODY do harmonického celku.
          
          **Co obsahuje:**
          • Adaptogeny pro odolnost vůči stresu
          • Vyváženou minerální a vitamínovou směs
          • Bylinnou složku pro zklidnění
          
          **Přínosy:**
          • Podpora přirozené rovnováhy organismu
          • Snížení negativních účinků stresu
          • Dlouhodobá podpora zdraví a vitality
          
          Klíč k udržitelnému životnímu stylu bez extrémů a kompromisů.
        `
            }
        ]
    },

    cta: {
        badge: "Buď první, kdo to zkusí",
        headline: {
            part1: "PŘIPRAV SE NA",
            highlight: "NOVOU ÉRU ENERGIE"
        },
        description: "Přihlaš se k odběru a získej exkluzivní přístup k testerům, slevám a novinkám. Buď součástí komunity BoostUp.",
        placeholder: "vas@email.cz",
        button: "Chci odebírat novinky",
        socialProof: {
            waiting: "+500 čeká na launch",
            launch: "Launch Q1 2025",
            natural: "100% přírodní"
        }
    },

    contact: {
        title: "KONTAKT",
        headline: "MÁTE DOTAZ?",
        description: "Zajímá vás něco ohledně našich produktů, partnerství nebo jen chcete pozdravit? Napište nám nebo zavolejte, rádi se s vámi spojíme.",
        info: {
            phone: { label: "Telefon", value: "775 222 037" },
            email: { label: "Email", value: "info@drinkboostup.cz" },
            address: { label: "Adresa", value: { line1: "Chaloupkova 3002/1a, Královo Pole", line2: "612 00 Brno, Czech Republic" } }
        },
        form: {
            name: { label: "Jméno", placeholder: "Jan Novák" },
            email: { label: "Email", placeholder: "jan@email.cz" },
            message: { label: "Zpráva", placeholder: "S čím vám můžeme pomoci?" },
            submit: "Odeslat zprávu"
        },
        toast: {
            success: {
                title: "Zpráva odeslána",
                description: "Děkujeme za váš zájem, brzy se vám ozveme."
            }
        }
    },

    footer: {
        brand: {
            description: "6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity. Žádná umělá sladidla a aromata."
        },
        links: [
            {
                title: "NAVIGACE",
                items: [
                    { label: "O nás", href: "/#mise" },
                    { label: "Produkty", href: "/#produkty" },
                    { label: "3B Koncept", href: "/#3b" },
                    { label: "Kontakt", href: "/#kontakt" }
                ]
            },
            {
                title: "PODPORA",
                items: [
                    { label: "VOP", href: "/obchodni-podminky" },
                    { label: "Ochrana soukromí", href: "/ochrana-osobnich-udaju" },
                    { label: "Reklamace", href: "/reklamace" },
                    { label: "Cookies", href: "/cookies" },
                    { label: "Doprava a platba", href: "/doprava-a-platba" },
                    { label: "Opakované platby", href: "/podminky-opakovane-platby" }
                ]
            }
        ],
        contact: {
            title: "KONTAKT",
            email: "info@drinkboostup.cz",
            phone: "+420 775 222 037",
            address: {
                line1: "Chaloupkova 3002/1a, Královo Pole",
                line2: "612 00 Brno, Czech Republic"
            }
        },
        bottom: {
            copyright: "© 2026 BOOSTUP SUPPLEMENTS S.R.O. VŠECHNA PRÁVA VYHRAZENA.",
            legal: [
                { label: "Obchodní podmínky", href: "/obchodni-podminky" },
                { label: "Ochrana osobních údajů", href: "/ochrana-osobnich-udaju" }
            ]
        }
    },

    bankInfo: {
        accountNumber: "6654376004",
        bankCode: "5500",
        bankName: "Raiffeisenbank",
        iban: "CZ4755000000006654376004",
        accountName: "BOOSTUP SUPPLEMENTS S.R.O.",
        currency: "CZK",
        qrMessage: "Objednávka"
    },

    flavors: {
        lemon: {
            name: "LEMON BLAST",
            description: "Citrusová svěžest a energie pro jasnou a soustředěnou mysl",
            labels: ["Bez cukru", "Vegan", "Energie"],
            nutritionalFacts: "Energie: 32 kcal / 7.6 kcal\nTuky: <1 g\nSacharidy: 1.4 g\nCukry: 0.5 g\nBílkoviny: <1 g\nSůl: 0.1 g",
            ingredients: "Voda, vodný výluh ze směsi čajů a bylin (sencha, yerba maté, černý čaj, pomeranč, aroma), sladidlá: erythritol, taurin, xylitol, vitamín C, guarana, bisglycinát hořečnatý, výluhy z: kořene ashwagandhy, kořene rozchodnice růžové a tymiánu...",
            fullSpecs: {
                basicInfo: [
                    { label: "Produkt", value: "LEMON BLAST" },
                    { label: "Popis", value: "tekutý vitamínový doplněk stravy s povzbuzujícím účinkem obohacený o minerální látky se sladidly" },
                    { label: "Složení (přesně z etikety)", value: "Voda, vodný výluh ze směsi čajů a bylin (sencha, yerba maté, černý čaj, pomeranč, aroma), sladidlá: erythritol, taurin, sladidlo: xylitol, vitamín C, guarana, bisglycinát hořečnatý, výluhy z: kořene ashwagandhy, kořene rozchodnice růžové a tymiánu, kyselina jablečná, kyselina citronová, citronan draselný, konzervant: sorban draselný, koenzym Q10, kofein, sůl, steviol-glykosidy, vitamíny B1, B2, B3, B5, B6, B9, B12." },
                    { label: "Alergeny / přesný text", value: "Neobsahuje alergeny." },
                    { label: "Doporučené dávkování", value: "Doporučené denní dávkování: až 2 porce / den. 1 porce je 60 ml." },
                    { label: "Upozornění", value: "Tento doplněk stravy nenahrazuje pestrou stravu. Obsahuje vysoké množství kofeinu (283 mg/100 ml). Výrobek není vhodný pro děti, těhotné a kojící ženy, pro osoby trpící srdečními onemocněními. V případě užívání léků na předpis se poraďte se svým lékařem. Uchovávejte mimo dosah dětí. Nepřekračujte doporučenou denní dávku. Spotřebujte ihned po otevření lahve." },
                    { label: "Skladování", value: "Skladujte na tmavém místě do 21 °C." },
                    { label: "Vyrobeno", value: "Vyrobeno v České republice." },
                    { label: "Distributor", value: "Distributor: BoostUp Supplements s.r.o., Chaloupkova 3002/1A 612 00 Brno." },
                    { label: "Minimální trvanlivost / číslo šarže", value: "Minimální trvanlivost do, číslo šarže:" }
                ],
                nutrition: [
                    { label: "Energetická hodnota", per100: "32,0 kJ / 7,6 kcal", perPortion: "19,3 kJ / 4,6 kcal", rhp: "<1 % RHP*" },
                    { label: "Tuky", per100: "<1 g", perPortion: "<1 g", rhp: "" },
                    { label: "z toho nasycené mastné kyseliny", per100: "0,0 g", perPortion: "0,0 g", rhp: "" },
                    { label: "Sacharidy", per100: "1,4 g", perPortion: "0,9 g", rhp: "" },
                    { label: "z toho cukry", per100: "0,5 g", perPortion: "0,3 g", rhp: "" },
                    { label: "Bílkoviny", per100: "<1 g", perPortion: "<1 g", rhp: "" },
                    { label: "Vláknina", per100: "0,0 g", perPortion: "0,0 g", rhp: "" },
                    { label: "Sůl", per100: "0,1 g", perPortion: "0,0 g", rhp: "" }
                ],
                vitamins: [
                    { label: "Vitamin B1", per100: "2,4 mg", perPortion: "1,4 mg", rhp: "130 % RHP*" },
                    { label: "Vitamin B2", per100: "2,1 mg", perPortion: "1,3 mg", rhp: "91,2 % RHP*" },
                    { label: "Vitamin B3", per100: "7,9 mg NE", perPortion: "4,7 mg", rhp: "29,5 % RHP*" },
                    { label: "Vitamin B5", per100: "3,6 mg", perPortion: "2,1 mg", rhp: "35,7 % RHP*" },
                    { label: "Vitamin B6", per100: "2,5 mg", perPortion: "1,5 mg", rhp: "107,4 % RHP*" },
                    { label: "Vitamin B9", per100: "112,7 µg", perPortion: "67,6 µg", rhp: "33,8 % RHP*" },
                    { label: "Vitamin B12", per100: "3,9 µg", perPortion: "2,3 µg", rhp: "93,5 % RHP*" },
                    { label: "Vitamin C", per100: "500,0 mg", perPortion: "300,0 mg", rhp: "375 % RHP*" },
                    { label: "Hořčík", per100: "50,0 mg", perPortion: "30,0 mg", rhp: "8,6 % RHP*" },
                    { label: "Draslík", per100: "53,3 mg", perPortion: "32,0 mg", rhp: "1,6 % RHP*" }
                ],
                activeSubstances: [
                    { label: "Kofein bezvodý", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Taurin", per100: "833,3 mg", perPortion: "500,0 mg" },
                    { label: "Koenzym Q10", per100: "66,7 mg", perPortion: "40,0 mg" },
                    { label: "Guarana", per100: "644,0 mg", perPortion: "386,4 mg" },
                    { label: "z toho kofein", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Celkový kofein", per100: "283,3 mg", perPortion: "170,0 mg" }
                ]
            }
        },
        red: {
            name: "RED RUSH",
            description: "Červené ovoce a guarana pro tvůj rychlý a efektivní start",
            labels: ["Vitamíny", "Rychlý nástup", "Výkon"],
            nutritionalFacts: "Energie: 32,0 kJ / 7,6 kcal\nTuky: <1 g\nSacharidy: 1,4 g\nCukry: 0,5 g\nBílkoviny: <1 g\nSůl: 0,1 g",
            ingredients: "Voda, vodný výluh ze směsi čajů a bylin (sencha, rooibos, jablko plod, mrkev, květ ibišku, verbena citronová, šípek...), kofein (170mg/60ml porce), guarana, vitamíny...",
            fullSpecs: {
                basicInfo: [
                    { label: "Produkt", value: "RED RUSH" },
                    { label: "Popis", value: "tekutý vitamínový doplněk stravy s povzbuzujícím účinkem obohacený o minerální látky se sladidly" },
                    { label: "Složení (přesně z etikety)", value: "Voda, vodný výluh ze směsi čajů a bylin (sencha, rooibos, jablko plod, mrkev, květ ibišku, verbena citronová, šípek, plod rakytníku, list ostružiny, plod rybízu, plod brusinky, slunečnicový květ, list klikvy, přírodní aroma), sladidlá: erythritol, taurin, sladidlo: xylitol, vitamín C, guarana, bisglycinát hořečnatý, výluhy z: kořene ashwagandhy, kořene rozchodnice růžové a rozmarýnu, kyselina jablečná, kyselina citronová, citronan draselný, konzervant: sorban draselný, koenzym Q10, kofein, sůl, steviol-glykosidy, vitamíny B1, B2, B3, B5, B6, B9, B12." },
                    { label: "Alergeny / přesný text", value: "Neobsahuje alergeny." },
                    { label: "Doporučené dávkování", value: "Doporučené denní dávkování: až 2 porce / den. 1 porce je 60 ml." },
                    { label: "Upozornění", value: "Tento doplněk stravy nenahrazuje pestrou stravu. Obsahuje vysoké množství kofeinu (283 mg/100 ml). Výrobek není vhodný pro děti, těhotné a kojící ženy, pro osoby trpící srdečními onemocněními. V případě užívání léků na předpis se poraďte se svým lékařem. Uchovávejte mimo dosah dětí. Nepřekračujte doporučenou denní dávku. Spotřebujte ihned po otevření lahve." },
                    { label: "Skladování", value: "Skladujte na tmavém místě do 21 °C." },
                    { label: "Vyrobeno", value: "Vyrobeno v České republice." },
                    { label: "Distributor", value: "Distributor: BoostUp Supplements s.r.o., Chaloupkova 3002/1A 612 00 Brno." },
                    { label: "Minimální trvanlivost / číslo šarže", value: "Minimální trvanlivost do, číslo šarže:" }
                ],
                nutrition: [
                    { label: "Energetická hodnota", per100: "32,0 kJ / 7,6 kcal", perPortion: "19,3 kJ / 4,6 kcal", rhp: "<1 % RHP*" },
                    { label: "Tuky", per100: "<1 g", perPortion: "<1 g", rhp: "" },
                    { label: "z toho nasycené mastné kyseliny", per100: "0,0 g", perPortion: "0,0 g", rhp: "" },
                    { label: "Sacharidy", per100: "1,4 g", perPortion: "0,9 g", rhp: "" },
                    { label: "z toho cukry", per100: "0,5 g", perPortion: "0,3 g", rhp: "" },
                    { label: "Bílkoviny", per100: "<1 g", perPortion: "<1 g", rhp: "" },
                    { label: "Vláknina", per100: "0,0 g", perPortion: "0,0 g", rhp: "" },
                    { label: "Sůl", per100: "0,1 g", perPortion: "0,0 g", rhp: "" }
                ],
                vitamins: [
                    { label: "Vitamin B1", per100: "2,4 mg", perPortion: "1,4 mg", rhp: "130 % RHP*" },
                    { label: "Vitamin B2", per100: "2,1 mg", perPortion: "1,3 mg", rhp: "91,2 % RHP*" },
                    { label: "Vitamin B3", per100: "7,9 mg NE", perPortion: "4,7 mg", rhp: "29,5 % RHP*" },
                    { label: "Vitamin B5", per100: "3,6 mg", perPortion: "2,1 mg", rhp: "35,7 % RHP*" },
                    { label: "Vitamin B6", per100: "2,5 mg", perPortion: "1,5 mg", rhp: "107,4 % RHP*" },
                    { label: "Vitamin B9", per100: "112,7 µg", perPortion: "67,6 µg", rhp: "33,8 % RHP*" },
                    { label: "Vitamin B12", per100: "3,9 µg", perPortion: "2,3 µg", rhp: "93,5 % RHP*" },
                    { label: "Vitamin C", per100: "500,0 mg", perPortion: "300,0 mg", rhp: "375 % RHP*" },
                    { label: "Hořčík", per100: "50,0 mg", perPortion: "30,0 mg", rhp: "8,6 % RHP*" },
                    { label: "Draslík", per100: "53,3 mg", perPortion: "32,0 mg", rhp: "1,6 % RHP*" }
                ],
                activeSubstances: [
                    { label: "Kofein bezvodý", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Taurin", per100: "833,3 mg", perPortion: "500,0 mg" },
                    { label: "Koenzym Q10", per100: "66,7 mg", perPortion: "40,0 mg" },
                    { label: "Guarana", per100: "644,0 mg", perPortion: "386,4 mg" },
                    { label: "z toho kofein", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Celkový kofein", per100: "283,3 mg", perPortion: "170,0 mg" }
                ]
            }
        },
        silky: {
            name: "SILKY LEAF",
            description: "Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii",
            labels: ["Antioxidanty", "Klidná síla", "Soustředění"],
            nutritionalFacts: "Energie: 32,0 kJ / 7,6 kcal\nTuky: <1 g\nSacharidy: 1,4 g\nCukry: 0,5 g\nBílkoviny: <1 g\nSůl: 0,1 g",
            ingredients: "Voda, vodný výluh ze směsi čajů (sencha, oolong), sladidlá: erythritol, taurin, xylitol, vitamín C, guarana, bisglycinát hořečnatý...",
            fullSpecs: {
                basicInfo: [
                    { label: "Produkt", value: "SILKY LEAF" },
                    { label: "Popis", value: "tekutý vitamínový doplněk stravy s povzbuzujícím účinkem obohacený o minerální látky se sladidly" },
                    { label: "Složení (přesně z etikety)", value: "Voda, vodný výluh ze směsi čajů (sencha, oolong), sladidlá: erythritol, taurin, sladidlo: xylitol, vitamín C, guarana, bisglycinát hořečnatý, výluhy z: kořene ashwagandhy, kořene rozchodnice růžové a bazalky, kyselina jablečná, kyselina citronová, citronan draselný, konzervant: sorban draselný, koenzym Q10, kofein, sůl, steviol-glykosidy, vitamíny B1, B2, B3, B5, B6, B9, B12." },
                    { label: "Alergeny / přesný text", value: "Neobsahuje alergeny." },
                    { label: "Doporučené dávkování", value: "Doporučené denní dávkování: až 2 porce / den. 1 porce je 60 ml." },
                    { label: "Upozornění", value: "Tento doplněk stravy nenahrazuje pestrou stravu. Obsahuje vysoké množství kofeinu (283 mg/100 ml). Výrobek není vhodný pro děti, těhotné a kojící ženy, pro osoby trpící srdečními onemocněními. V případě užívání léků na předpis se poraďte se svým lékařem. Uchovávejte mimo dosah dětí. Nepřekračujte doporučenou denní dávku. Spotřebujte ihned po otevření lahve." },
                    { label: "Skladování", value: "Skladujte na tmavém místě do 21 °C." },
                    { label: "Vyrobeno", value: "Vyrobeno v České republice." },
                    { label: "Distributor", value: "Distributor: BoostUp Supplements s.r.o., Chaloupkova 3002/1A 612 00 Brno." },
                    { label: "Minimální trvanlivost / číslo šarže", value: "Minimální trvanlivost do, číslo šarže:" }
                ],
                nutrition: [
                    { label: "Sacharidy", per100: "1,4 g", perPortion: "0,9 g", rhp: "" },
                    { label: "z toho cukry", per100: "0,5 g", perPortion: "0,53 g", rhp: "" },
                    { label: "Bílkoviny", per100: "<1 g", perPortion: "<1 g", rhp: "" },
                    { label: "Vláknina", per100: "0,0 g", perPortion: "0,0 g", rhp: "" },
                    { label: "Sůl", per100: "0,1 g", perPortion: "0,0 g", rhp: "" }
                ],
                vitamins: [
                    { label: "Vitamin B1", per100: "2,4 mg", perPortion: "1,4 mg", rhp: "130 % RHP*" },
                    { label: "Vitamin B2", per100: "2,1 mg", perPortion: "1,3 mg", rhp: "91,2 % RHP*" },
                    { label: "Vitamin B3", per100: "7,9 mg NE", perPortion: "4,7 mg", rhp: "29,5 % RHP*" },
                    { label: "Vitamin B5", per100: "3,6 mg", perPortion: "2,1 mg", rhp: "35,7 % RHP*" },
                    { label: "Vitamin B6", per100: "2,5 mg", perPortion: "1,5 mg", rhp: "107,4 % RHP*" },
                    { label: "Vitamin B9", per100: "112,7 µg", perPortion: "67,6 µg", rhp: "33,8 % RHP*" },
                    { label: "Vitamin B12", per100: "3,9 µg", perPortion: "2,3 µg", rhp: "93,5 % RHP*" },
                    { label: "Vitamin C", per100: "500,0 mg", perPortion: "300,0 mg", rhp: "375 % RHP*" },
                    { label: "Hořčík", per100: "50,0 mg", perPortion: "30,0 mg", rhp: "8,6 % RHP*" },
                    { label: "Draslík", per100: "53,3 mg", perPortion: "32,0 mg", rhp: "1,6 % RHP*" }
                ],
                activeSubstances: [
                    { label: "Kofein bezvodý", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Taurin", per100: "833,3 mg", perPortion: "500,0 mg" },
                    { label: "Koenzym Q10", per100: "66,7 mg", perPortion: "40,0 mg" },
                    { label: "Guarana", per100: "644,0 mg", perPortion: "386,4 mg" },
                    { label: "z toho kofein", per100: "141,7 mg", perPortion: "85,0 mg" },
                    { label: "Celkový kofein", per100: "283,3 mg", perPortion: "170,0 mg" }
                ]
            }
        }
    },

    ingredientDetails: {
        stimulants: {
            title: "Přírodní stimulanty",
            subtitle: "Čistá energie z přírody",
            description: "Využíváme sílu ověřených přírodních látek, které dodávají energii postupně, bez prudkých výkyvů a následné vyčerpanosti.",
            benefits: [
                "Zvýšení bdělosti a pozornosti",
                "Podpora mentálního výkonu",
                "Postupné uvolňování bez nervozity"
            ],
            ingredients: ["Přírodní kofein", "Guarana", "L-Theanin"]
        },
        electrolytes: {
            title: "Elektrolyty",
            subtitle: "Optimální hydratace buněk",
            description: "Zásadní minerály pro správnou funkci svalů, nervové soustavy a udržení hloubkové hydratace během celého dne.",
            benefits: [
                "Prevence svalových křečí",
                "Lepší přenos nervových vzruchů",
                "Udržení energie v buňkách"
            ],
            ingredients: ["Hořčík", "Draslík", "Sodík", "Vápník"]
        },
        adaptogens: {
            title: "Adaptogeny",
            subtitle: "Odolnost vůči stresu",
            description: "Byliny a houby, které pomáhají organismu adaptovat se na fyzický a psychický stres a udržovat vnitřní rovnováhu.",
            benefits: [
                "Snížení hladiny kortizolu",
                "Podpora imunitního systému",
                "Zlepšení nálady a regenerace"
            ],
            ingredients: ["Ašvaganda", "Rozchodnice růžová", "Meduňka"]
        },
        vitamins: {
            title: "Vitamíny",
            subtitle: "Palivo pro váš metabolismus",
            description: "Komplex vitamínů skupiny B a C, které jsou klíčové pro transformaci potravy na energii a ochranu před oxidativním stresem.",
            benefits: [
                "Podpora energetického metabolismu",
                "Snížení míry únavy a vyčerpání",
                "Ochrana DNA a buněk"
            ],
            ingredients: ["Vitamín B6", "Vitamín B12", "Vitamín C"]
        }
    },

    typography: {
        headingFont: 'Poppins',
        bodyFont: 'Poppins',
        headingWeight: '800',
        bodyWeight: '400',
        headingLetterSpacing: '0.05em',
        bodyLetterSpacing: '0em',
        headingLineHeight: '1.1',
        bodyLineHeight: '1.6',
        baseFontSize: '16',
    },

    // Per-field text styles (font, size, bold, italic per CMS field)
    textStyles: {} as Record<string, {
        fontSize?: string;
        fontWeight?: string;
        fontStyle?: string;
        fontFamily?: string;
    }>,

    // Badge visibility (defaults to shown; set to false to hide)
    // Pricing configuration for different pack sizes
    pricing: {
        pack3: 229,
        pack12: 849,
        pack21: 1399
    }
};
