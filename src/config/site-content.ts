/**
 * Centrální konfigurace textů webu.
 * Změnou textů v tomto souboru se upraví obsah na celém webu.
 */

export const SITE_CONTENT = {
    isSalesEnabled: true,
    navigation: [
        { label: "Naše mise", href: "/#mise" },
        { label: "Produkty", href: "/#produkty" },
        { label: "3B Koncept", href: "/#3b" },
        { label: "Blog", href: "/blog" },
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
                    { label: "Blog", href: "/blog" },
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
        accountName: "BoostUp Energy s.r.o.",
        accountNumber: "123456789/0100",
        iban: "CZ12345678901234567890",
        bic: "KOMB CZ PP",
        currency: "Kč",
        address: {
            street: "Technologická 123",
            city: "616 00 Brno",
            country: "Česká republika",
            ic: "12345678"
        }
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
    },

    // NEW: Centralized Admin strings
    admin: {
        terminalLabel: "Admin Terminal",
        auth: {
            verifying: "Ověřuji oprávnění...",
            noPermission: "Nemáte oprávnění pro přístup do administrace.",
            backToHome: "Zpět na hlavní stránku",
            logout: "Odhlásit se",
            autoHideSidebar: "Automatické skrývání"
        },
        navigation: {
            dashboard: "Přehled",
            orders: "Objednávky",
            inventory: "Sklad produktů",
            manufacture: "Zásoby surovin & obalů",
            messages: "Zprávy",
            emails: "E-mailové šablony",
            content: "Obsah webu",
            pricing: "Ceny a Statistiky",
            promoCodes: "Slevové kódy",
            profile: "Můj účet",
            help: "Nápověda"
        },
        dashboard: {
            title: "DASHBOARD",
            welcome: "Vítejte zpět, pane správce.",
            salesStatus: "Stav e-shopu",
            salesActive: "✓ PRODEJ AKTIVNÍ",
            salesActiveDesc: "E-shop je nyní plně funkční pro všechny zákazníky.",
            salesPaused: "⏸ POZASTAVENO",
            salesPausedDesc: "Prodej byl dočasně pozastaven. Zákazníci nemohou zadávat nové objednávky.",
            updateError: "Chyba při aktualizaci",
            revenue: "Celkové tržby",
            revenueDesc: "Celoživotní hodnota",
            workflow: "Pracovní tok",
            newOrders: "Nové / Placené",
            processing: "K přípravě / Balení",
            shipped: "Odesláno",
            cancelled: "Zrušeno",
            todayLabel: "DNES",
            inventory: "INVENTÁŘ",
            recentOrders: "NEDÁVNÉ OBJEDNÁVKY",
            recentOrdersDesc: "Posledních 10 transakcí na e-shopu.",
            viewAll: "Zobrazit vše",
            noOrders: "Žádné aktivní objednávky",
            paymentPending: "ČEKÁ",
            paymentPaid: "ZAPLACENO",
            statusShipped: "V PŘEPRAVĚ",
            statusProcessing: "PŘÍPRAVA",
            statusCancelled: "STORNO",
            statusReceived: "PŘIJATO",
            unitKs: "ks",
            multiplier: "×",
            paymentLabel: "Platba",
            statusLabel: "Status",
            amountLabel: "ČÁSTKA"
        },
        inventory: {
            title: "Skladiště",
            description: "Globální přehled všech fyzických zásob v lahvích a krabicích.",
            unit: "lahví",
            addStock: "Doskladnit",
            removeStock: "Vyskladnit",
            historyTitle: "Historie pohybů",
            editDetails: "Upravit produkt",
            salesStatus: "PRODEJ AKTIVNÍ",
            manufacture: {
                title: "Suroviny & Materiály",
                subtitle: "Sledování stavu ingrediencí a obalových materiálů",
                loading: "Načítám inventář...",
                newMaterial: "Nová Surovina",
                emptyTitle: "Žádné suroviny",
                emptyDesc: "Zatím nebyly přidány žádné suroviny pro výrobu.",
                limitLabel: "LIMIT:",
                warnAtLabel: "VAROVÁNÍ:",
                changeStatus: "Pohyb zásob",
                status: {
                    ok: "STAV OK",
                    warning: "VAROVÁNÍ",
                    critical: "KRITICKÝ STAV"
                },
                table: {
                    id: "NÁZEV / ID",
                    status: "AKTUÁLNÍ STAV",
                    limits: "NASTAVENÉ LIMITY"
                },
                dialogs: {
                    restock: {
                        title: "Upravit stav: {name}",
                        amountLabel: "Množství ({unit})",
                        amountPlaceholder: "Zadejte množství...",
                        noteLabel: "Poznámka (volitelné)",
                        notePlaceholder: "Důvod změny...",
                        consumeBtn: "Spotřebovat (-)",
                        restockBtn: "Naskladnit (+)",
                        success: "Úspěšně uloženo",
                        successDesc: "Zásoba položky {name} byla upravena.",
                        error: "Chyba",
                        errorDesc: "Nepodařilo se aktualizovat stav skladu."
                    },
                    history: {
                        title: "Historie pohybu: {name}",
                        empty: "Žádné záznamy o pohybu.",
                        table: {
                            date: "Datum",
                            type: "Typ",
                            change: "Změna",
                            user: "Uživatel",
                            note: "Poznámka"
                        },
                        types: {
                            restock: "Naskladnění",
                            use: "Spotřeba",
                            correction: "Oprava"
                        },
                        systemUser: "Systém"
                    },
                    edit: {
                        titleEdit: "Upravit: {name}",
                        titleAdd: "Přidat novou surovinu/materiál",
                        nameLabel: "Název položky",
                        namePlaceholder: "např. Lahvičky 500ml",
                        unitLabel: "Měrná jednotka",
                        unitPlaceholder: "ks, kg, l, atd.",
                        levelsTitle: "Úrovně upozornění",
                        warningLabel: "Varovná úroveň (žlutá)",
                        warningDesc: "Zásoby brzy dojdou — připravte objednávku.",
                        criticalLabel: "Kritická úroveň (červená)",
                        criticalDesc: "Zásoby jsou téměř vyčerpány — okamžitě doplňte.",
                        notificationsLabel: "Zapnout upozornění na nízký stav",
                        saveBtn: "Uložit změny",
                        savingBtn: "Ukládám...",
                        success: "Uloženo",
                        successDesc: "Surovina/materiál {name} byl uložen.",
                        error: "Chyba",
                        errorDesc: "Nepodařilo se uložit položku."
                    }
                }
            }
        },
        invoices: {
            title: "FAKTURA",
            docNumber: "Číslo dokladu",
            customer: "Odběratel",
            issueDate: "Datum vystavení",
            dueDate: "Datum splatnosti",
            issuer: "Dodavatel",
            icLabel: "IČ",
            labels: {
                item: "Položka",
                qty: "Množství",
                price: "Cena/ks",
                total: "Celkem",
                grandTotal: "CELKEM K ÚHRADĚ",
            },
            footer: {
                thanks: "Děkujeme za Vaši objednávku.",
                contact: "V případě dotazů nás kontaktujte na {email}",
            },
            qr: "QR Platba",
            actions: {
                save: "Uložit do PDF",
                print: "Vytisknout",
                close: "Zavřít fakturu",
                open: "Faktura"
            }
        },
        orders: {
            title: "Správa objednávek",
            description: "Přehled a vyřizování zákaznických objednávek.",
            table: {
                id: "ID",
                date: "DATUM",
                customer: "ZÁKAZNÍK",
                items: "POLOŽKY",
                amount: "ČÁSTKA",
                payment: "PLATBA",
                method: "METODA",
                status: "STATUS",
                actions: "AKCE"
            },
            status: {
                unpaid: "NEZAPLACENO",
                paid: "ZAPLACENO",
                storno: "STORNO",
                transfer: "PŘEVOD",
                express: "APPLE/GOOGLE"
            },
            cancelDialog: {
                title: "Stornovat objednávku",
                question: "Opravdu chcete stornovat tuto objednávku?",
                warning: "Tato akce je nevratná. Zboží bude vráceno do skladových zásob a objednávka bude označena jako stornovaná.",
                back: "Zpět",
                confirmLabel: "Potvrdit storno"
            },
            empty: "Žádné objednávky v této kategorii.",
            copyId: "ID zkopírováno",
            itemsLabel: "Položky:",
            totalPriceLabel: "Celková cena",
            markAsPaid: "Označit jako zaplacené",
            markAsShipped: "Označit jako v přepravě",
            viewInvoice: "Zobrazit fakturu",
            notifToggle: "Zapnout oznámení v prohlížeči",
            sorting: "Řazení",
            labelsA4: "Kombinovat na A4",
            labelsA4Desc: "Šetří papír, skládá štítky vedle sebe",
            labelsSequential: "Tisk postupně (po jednom)",
            labelsSequentialDesc: "Otevře každý štítek v novém okně",
            packetaLabel: "Štítek Packeta",
            viewDetail: "Detail",
            notifEnabled: "Oznámení povolena! 🔔",
            notifEnabledDesc: "Nyní budete upozorněni na každou novou zprávu od zákazníků přímo v prohlížeči.",
            bulkStatusTitle: "Hromadná změna stavu",
            bulkCancelTitle: "Hromadné storno",
            bulkCancelQuestion: "Opravdu chcete stornovat {size} vybraných objednávek? Tuto akci nelze vrátit.",
            printOptions: "Možnosti hromadného tisku",
            printOptionsDesc: "Vyberte si formát, jakým chcete vytisknout {size} štítků.",
            printStarted: "Tisk spuštěn",
            printStartedDesc: "Štítky se generují v novém okně. Objednávky byly přesunuty k zabalení.",
            more: "DALŠÍ",
            markAsProcessing: "Označit k zabalení",
            bulkPrintErr: "Nelze tisknout hromadně",
            bulkPrintErrDesc: "Vybrané objednávky nemají číselné ID ani čárový kód zásilky.",
            printingTitle: "Tisk spuštěn",
            printingDesc: "Štítky se generují v novém okně. Objednávky byly přesunuty k zabalení.",
            syncSuccess: "Synchronizace dokončena",
            syncSuccessDesc: "Všechny zásilky byly zkontrolovány. Aktualizováno: {count}.",
            syncError: "Chyba synchronizace",
            statusChanged: "Stav objednávky změněn",
            statusChangedDesc: "Objednávka {id} byla označena jako {status}.",
            bulkStatusChangedDesc: "{count} objednávek bylo označeno jako {status}.",
            sortBy: "Seřadit podle",
            sortLatest: "Nejnovější prve",
            sortOldest: "Nejstarší prve",
            sortIdAsc: "Čísla obj. (0-9)",
            sortIdDesc: "Čísla obj. (9-0)",
            syncNow: "Synchronizovat",
            tabPending: "Nové / Zaplacené",
            tabProcessing: "K zabalení",
            tabShipped: "V přepravě",
            tabCancelled: "Stornované",
            cancel: "Zrušit",
            confirmBulkCancel: "Potvrdit hromadné storno",
            allowNotif: "Povolit oznámení",
            detail: {
                title: "Objednávka",
                closeLabel: "Zavřít detail objednávky",
                invoice: "Faktura",
                print: "Tisk",
                label: "Štítek",
                createPacket: "Vytvořit zásilku",
                packetCreated: "Zásilka vytvořena",
                packetCreatedDesc: "Barcode: {barcode}. Doprava a e-mail budou automaticky odeslány, jakmile balík podáte v Zásilkovně.",
                packetError: "Chyba při vytváření zásilky",
                currentStatus: "Aktuální stav",
                paymentLabel: "Platba",
                deliveryLabel: "Doprava",
                paymentPending: "Platba: Čeká",
                paymentPaid: "Platba: Zaplaceno",
                shippedStatus: "Doprava: V přepravě",
                processingStatus: "Doprava: Připravuje se",
                pendingStatus: "Doprava: Čeká k vyřízení",
                customer: "Odběratel",
                deliveryTitle: "Doručení",
                method: "METODA",
                paymentMethodLabel: "PLATBA",
                methodZasilkovna: "Zásilkovna",
                methodCourier: "Kurýr",
                paymentTransfer: "Bankovní převod",
                paymentCard: "Kartou online",
                tracking: "Sledování zásilky",
                trackLink: "Sledovat balík →",
                table: {
                    item: "Položka",
                    qty: "Množství",
                    price: "Cena celkem"
                },
                subtotal: "Mezisoučet",
                shipping: "Doprava",
                free: "Zdarma",
                totalLabel: "CELKEM",
                qrTitle: "Platební údaje",
                account: "Účet",
                vs: "VS",
                bank: "Banka",
                qrInstruction: "Naskenujte QR kód ve své bankovní aplikaci pro okamžitou platbu."
            }
        },
        contentManager: {
            title: "CONTENT ENGINE",
            description: "Správa vizuálního a textového obsahu webu",
            langCZ: "🇨🇿 ČEŠTINA",
            langEN: "🇬🇧 ENGLISH",
            preview: "Náhled",
            reset: "Resetovat",
            save: "Uložit změny",
            previewGenerated: "Náhled byl vygenerován",
            saveSuccess: "Obsah byl úspěšně uložen",
            resetConfirm: "Opravdu chcete resetovat veškerý obsah na výchozí hodnoty? Tato akce je nevratná.",
            resetSuccess: "Obsah byl resetován na výchozí hodnoty",
            loading: "Načítám obsah webu...",
            tabs: {
                hero: "Hero (Úvod)",
                mission: "Mise",
                ingredients: "Ingredience",
                concept: "3B Koncept",
                cta: "CTA (Odběr)",
                contact: "Kontakt",
                flavors: "Příchutě",
                footer: "Patička",
                settings: "Nastavení"
            },
            sections: {
                hero: {
                    title: "Hlavní Hero Sekce",
                    sectionDesc: "Vizuální středobod vaší webové prezentace",
                    badge: "Badge text (BRZY NA TRHU)",
                    visibility: "Viditelnost oznamovacího banneru",
                    headlinePart1: "Nadpis Část 1",
                    headlineGradient: "Nadpis Zvýrazněný",
                    headlinePart2: "Nadpis Část 2",
                    description: "Hlavní popis",
                    testimonial: "Podnadpis pod tlačítky (Testimonial)",
                    placeholder: "Zadejte text pod tlačítka...",
                    ctaPrimary: "Tlačítko Primární",
                    ctaSecondary: "Tlačítko Sekundární",
                    cta3b: "Text Koncept 3B"
                },
                mission: {
                    title: "Naše Mise",
                    description: "Sekce vyprávějící příběh vaší značky",
                    badge: "Text štítku (O NÁS)",
                    visibility: "Viditelnost štítku (O NÁS)",
                    headlinePart1: "Nadpis Část 1",
                    highlight: "Zvýrazněný text nadpisu",
                    paragraphs: "Obsahové odstavce příběhu",
                    paragraphLabel: "Blok příběhu"
                },
                ingredients: {
                    title: "Vědecké Informace",
                    description: "Detailní rozpis ingrediencí a jejich benefitů",
                    category: "Název Kategorie",
                    subtitle: "Vedlejší titulek",
                    summary: "Shrnutí účinků",
                    benefits: "Klíčové Výhody (seznam)",
                    tags: "Specifické Látky (tagy)"
                },
                concept: {
                    title: "3B Koncept",
                    description: "Hlavní pilíře výkonu a funkčnosti",
                    headline: "Hlavní Nadpis Sekce",
                    cta: "Text Tlačítka (CTA)",
                    intro: "Úvodní Popis Konceptu",
                    pillars: "Jednotlivé Pilíře (Karty)",
                    pillarTitlePlaceholder: "Klíčové slovo (Např. BRAIN)",
                    pillarSubtitle: "Poutavý podnadpis",
                    pillarStats: "Výkonnostní statistika",
                    pillarDesc: "Text na kartě (Limitovaný prostor)",
                    pillarFullDesc: "Hlavní detailní text (Popup okno)",
                    pillarTip: "TIP: Použijte • pro odrážku",
                    pillarAddBullet: "+ PŘIDAT ODRÁŽKU"
                },
                cta: {
                    title: "CTA Sekce (Odběr)",
                    sectionDesc: "Konverzní prvek pro newsletter",
                    badge: "Text štítku (KONTAKT)",
                    visibility: "Viditelnost badge KONTAKT",
                    headline: "Hlavní Nadpis",
                    description: "Popis výhod odběru",
                    placeholder: "Zadejte text popisu...",
                    inputPlaceholder: "Váš e-mail...",
                    button: "Odebírat nyní"
                },
                contact: {
                    title: "Kontaktní Údaje",
                    description: "Jak vás zákazníci mohou zastihnout",
                    badge: "Text štítku (KONTAKT)",
                    visibility: "Viditelnost badge KONTAKT",
                    headline: "Hlavní nadpis",
                    email: "Emailová adresa",
                    phone: "Telefonní číslo",
                    address: "Adresa (Sídlo)"
                },
                flavors: {
                    title: "Správa Příchutí",
                    sectionTitle: "Katalog Příchutí",
                    sectionDesc: "Správa parametrů a specifikací jednotlivých příchutí a variant produktů",
                    code: "Kód",
                    name: "Název příchutě",
                    tagline: "Slogan (Tagline)",
                    description: "Krátký popis (pro výběr příchutě)",
                    descPlaceholder: "Krátký popis příchutě, který se zobrazí zákazníkům...",
                    specsTitle: "Detailní Specifikace & Nutriční Hodnoty",
                    tabs: {
                        nutrition: "Nutrice",
                        vitamins: "Vitamíny",
                        active: "Ostatní"
                    },
                    table: {
                        item: "Položka",
                        per100: "na 100g",
                        perPortion: "na porci",
                        rhp: "RHP (%)"
                    },
                    micronutrients: "Přehled Mikronutrientů",
                    activeSubstances: "Ostatní účinné látky",
                    addRow: "Přidat řádek"
                },
                footer: {
                    title: "Patička Webu",
                    description: "Základní informace v dolní části stránky",
                    brand: "Brand popis",
                    copyright: "Copyright text",
                    brandLabel: "Krátký popis značky",
                    copyrightLabel: "Copyright text"
                },
                settings: {
                    title: "Globální Nastavení",
                    description: "Ovládání globálních funkcí a behaviorálních prvků",
                    discountPopup: "Slevový Pop-up (Engagement)",
                    discountPopupDesc: "Zobrazit vyskakovací okno s nabídkou slevy při první návštěvě."
                }
            },
            notices: {
                saveWarning: {
                    title: "Nezapomeňte uložit změny!",
                    description: "Veškeré úpravy v tomto engine se stanou aktivními až po kliknutí na ULOŽIT ZMĚNY v horní části ovládacího panelu."
                },
                systemInfo: {
                    title: "Systémové Info",
                    description: "Změny se po uložení projeví okamžitě na celém webu. Pokud dojde k neočekávané chybě synchronizace, systém se automaticky přepne do záložního režimu a načte statický obsah."
                }
            }
        },
        pricing: {
            title: "Ceny & Statistiky",
            description: "Analýza prodejů a výkonu e-shopu",
            card: {
                title: "Cenotvorba",
                subtitle: "Globální nastavení cen pro všechna balení.",
                pack3: "Balení 3 ks",
                pack12: "Balení 12 ks",
                pack21: "Balení 21 ks",
                perUnit: "Kč / kus",
                save: "Uložit nové ceny",
                success: "Ceny byly aktualizovány",
                successDesc: "Nové ceny byly úspěšně propagovány do systému.",
                errorTitle: "Chyba při ukládání",
                currency: "Kč"
            },
            charts: {
                revenue: "Obrat (CZK)",
                orders: "Počet objednávek",
                units: "Prodáno lahví",
                lemon: "Lemon Rush",
                red: "Red Dragon",
                silky: "Silky Breeze"
            }
        },
        profile: {
            title: "Můj Profil",
            description: "Správa osobních údajů a nastavení účtu.",
            tabs: {
                info: "Osobní údaje",
                orders: "Moje objednávky",
                subscriptions: "Předplatné",
                security: "Zabezpečení"
            },
            form: {
                personal: "Osobní Údaje",
                personalDesc: "Informace o vás pro doručení a fakturaci.",
                fullName: "Celé jméno",
                phone: "Telefon",
                address: "Doručovací adresa",
                street: "Ulice",
                houseNumber: "Č.p.",
                city: "Město",
                zip: "PSČ",
                billing: "Fakturační údaje",
                isSame: "Fakturační adresa je stejná jako doručovací",
                isCompany: "Nakupuji na firmu",
                company: "Firma",
                ico: "IČO",
                dic: "DIČ",
                billingStreet: "Ulice (Fakturační)",
                billingHouseNumber: "Číslo popisné (Fakturační)",
                billingCity: "Město (Fakturační)",
                billingZip: "PSČ (Fakturační)",
                billingCompany: "Název firmy",
                emailNote: "Primární email nelze v administraci měnit.",
                save: "Uložit profil",
                success: "Profil uložen",
                successDesc: "Vaše údaje byly úspěšně aktualizovány.",
                generalError: "Chyba"
            },
            security: {
                password: "Změna hesla",
                passwordDesc: "Aktualizujte své přístupové údaje.",
                current: "Současné heslo",
                new: "Nové heslo",
                confirm: "Potvrzení hesla",
                update: "Aktualizovat heslo",
                success: "Heslo bylo úspěšně změněno",
                successDesc: "Vaše heslo bylo úspěšně aktualizováno.",
                errorTitle: "Chyba při změně hesla",
                matchNote: "Hesla jsou identická",
                errors: {
                    mismatchTitle: "Hesla se neshodují",
                    mismatchDesc: "Nové heslo a potvrzení musí být stejné.",
                    tooShortTitle: "Heslo je příliš krátké",
                    tooShortDesc: "Heslo musí mít alespoň 8 znaků.",
                    wrongCurrent: "Aktuální heslo je nesprávné."
                }
            }
        },
        help: {
            title: "Centrum Nápovědy",
            quickTips: "Rychlé tipy",
            quickTipsDesc: "Jak neztrácet čas",
            tips: {
                stats: { title: "Statistiky", desc: "Sleduj výkon v reálném čase." },
                fonts: { title: "Práce s fonty", desc: "Změny se projeví okamžitě po uložení." },
                security: { title: "Zabezpečení", desc: "Vaše data jsou pod ochranou Auth." }
            },
            sections: {
                content: {
                    title: "Obsah webu",
                    description: "Správa textů a vizuálního obsahu na všech sekcích webu. Cesta: Admin → Obsah webu",
                    items: {
                        hero: { label: "Hero (Úvod)", desc: "Hlavní nadpisy, popis produktu, tlačítka a testimonial. Obsahuje také přepínač viditelnosti badge BRZY NA TRHU." },
                        mission: { label: "Mise", desc: "Texty v sekci 'O nás' – badge, nadpisy a odstavce. Badge viditelnost lze zapnout nebo vypnout přepínačem." },
                        ingredients: { label: "Ingredience", desc: "Název a popis ingrediencií zobrazených na webu." },
                        concept: { label: "3B Koncept", desc: "Obsah karet – podnadpis, statistiky a krátký popis pro každou kartu." },
                        cta: { label: "CTA (Odběr)", desc: "Newsletter sekce – badge, nadpisy, popis a texty emailového formuláře." },
                        contact: { label: "Kontakt", desc: "Email, telefon a adresa zobrazené v kontaktní sekci." },
                        flavors: { label: "Příchutě", desc: "Názvy, popisy a štítky pro jednotlivé varianty BoostUp." },
                        footer: { label: "Patička", desc: "Brand popis a copyright text v dolní části webu." }
                    }
                },
                typography: {
                    title: "Ovládání typografie",
                    description: "Každé textové pole v sekci Obsah webu má integrovaný stylový toolbar.",
                    items: {
                        font: { label: "Font family", desc: "Vyber font z nabídky Google Fonts (Poppins, Inter, Roboto, Montserrat, Playfair Display a další). Poppins je výchozí font celého webu." },
                        size: { label: "Velikost písma", desc: "Výběr z přednastavených velikostí 10px–72px. Výběr 'Výchozí' odebere přepsání a použije se automatická velikost ze šablony." },
                        styles: { label: "Tučné (B) / Kurzíva (i)", desc: "Tlačítka fungují jako přepínač – jedním kliknutím zapneš, druhým vypneš. Zvýrazněná tlačítka = aktivní styl." },
                        reset: { label: "Reset", desc: "Zobrazí se automaticky pokud je styl upraven. Kliknutím se vrátíš na výchozí nastavení (Poppins, výchozí velikost, bez tučného/kurzívy)." },
                        live: { label: "Jak se styly projevují", desc: "Náhled vidíš přímo v inputu v reálném čase. Na webu se změny projeví po kliknutí na tlačítko 'Uložit změny' v horní části stránky." }
                    }
                },
                visibility: {
                    title: "Badge viditelnost",
                    description: "Přepínač Badge viditelnosti se zobrazuje nad příslušnými textovými poli.",
                    items: {
                        active: { label: "Zapnutý přepínač = badge viditelný", desc: "Na webu se zobrazí příslušný barevný badge (např. 'NOVINKA', 'BRZY NA TRHU')." },
                        inactive: { label: "Vypnutý přepínač = badge skrytý", desc: "Badge se na webu nezobrazí, i když je v textovém poli vyplněn text." },
                        location: { label: "Kde se přepínač nachází", desc: "Hero – badge BRZY NA TRHU, Mise – badge O NÁS, CTA – badge, Kontakt – badge KONTAKT." }
                    }
                },
                orders: {
                    title: "Objednávky",
                    description: "Přehled a správa všech zákaznických objednávek. Cesta: Admin → Objednávky",
                    items: {
                        filtering: { label: "Filtrování objednávek", desc: "Objednávky lze filtrovat podle stavu (čekající, potvrzená, odeslaná, doručená, zrušená)." },
                        detail: { label: "Detail objednávky", desc: "Kliknutím na objednávku zobrazíš detail – zákazník, produkty, adresa, způsob platby." },
                        copy: { label: "Kopírování ID", desc: "Ikona 'Copy' u ID objednávky okamžitě zkopíruje kód do schránky." },
                        status: { label: "Změna stavu", desc: "Zákazník obdrží automatický email při změně stavu na 'Odeslaná'." },
                        packeta: { label: "Packeta štítky", desc: "Generování a tisk štítků pro zásilkovnu přímo z detailu." },
                        notifications: { label: "Oznámení v prohlížeči", desc: "Zapni upozornění pro zvukové a vizuální hlášení nových objednávek." }
                    }
                },
                pricing: {
                    title: "Ceny a Statistiky",
                    description: "Globální správa cen a přehled výkonu e-shopu. Cesta: Admin → Ceny a Statistiky",
                    items: {
                        global: { label: "Globální ceny balení", desc: "Nastavení cen pro balení 3, 12 a 21 ks platné pro celý web." },
                        stats: { label: "Statistiky prodejů", desc: "Grafy objednávek a prodaných jednotek za posledních 30 dní." },
                        analysis: { label: "Analýza příchutí", desc: "Sledování oblíbenosti příchutí včetně rozpočítaných MIX balení." }
                    }
                },
                promos: {
                    title: "Slevové kódy",
                    description: "Správa slevových kupónů a uvítacího pop-upu. Cesta: Admin → Slevové kódy",
                    codeLabel: "Unikátní kód (např. BOOST20)",
                    discountLabel: "Výše slevy v %",
                    syncing: "Synchronizace s databází...",
                    items: {
                        creation: { label: "Tvorba kódů", desc: "Vytváření neomezeného množství kódů s procentuální slevou." },
                        popup: { label: "Uvítací pop-up", desc: "Automatická nabídka slevy pro nové návštěvníky webu." },
                        rules: { label: "Pravidla slev", desc: "Slevové kódy se nesčítají se slevou na předplatné." }
                    }
                },
                inventory: {
                    title: "Sklad produktů",
                    description: "Správa skladových zásob hotových výrobků. Cesta: Admin → Sklad produktů",
                    items: {
                        add: { label: "Přidání zásoby", desc: "Klikni na produkt a zadej přidávané množství." },
                        minimum: { label: "Minimální zásoby", desc: "Upozornění při poklesu pod nastavenou hranici." }
                    }
                },
                manufacture: {
                    title: "Sklad výroby",
                    description: "Správa surovin a výrobních materiálů. Cesta: Admin → Sklad výroby",
                    items: {
                        alert: { label: "Upozornění (červená tečka)", desc: "Signalizuje surovinu pod minimální nebo varovnou zásobou." },
                        edit: { label: "Úprava zásob", desc: "Ruční úprava množství surovin v detailu." },
                        notifications: { label: "Notifikace", desc: "Možnost zapnout/vypnout upozornění pro každou surovinu." }
                    }
                },
                saving: {
                    title: "Ukládání změn",
                    description: "Důležité informace o ukládání konfigurace.",
                    items: {
                        button: { label: "Tlačítko 'Uložit změny'", desc: "Bez kliknutí na toto tlačítko se žádné změny na webu neprojeví." },
                        loading: { label: "Automatické načítání", desc: "Obnovení stránky vrátí stav na poslední uložená data." },
                        reset: { label: "Tlačítko 'Resetovat'", desc: "Vrátí všechny neuložené změny na výchozí stav." }
                    }
                },
                security: {
                    title: "Autentizace a Bezpečí",
                    description: "Informace o přihlašování a zabezpečení.",
                    items: {
                        magic: { label: "Magic Link", desc: "Automatické přihlašovací odkazy odesílané na e-mail." },
                        detection: { label: "Detekce domény", desc: "Automatické rozpoznání testovacího a produkčního prostředí." },
                        supabase: { label: "Whitelist (Důležité!)", desc: "Nutnost povolit domény v Supabase Dashboardu pro správné přesměrování." }
                    }
                },
                design: {
                    title: "Design a Branding",
                    description: "Vizuální standardy a čitelnost rozhraní.",
                    items: {
                        palette: { label: "Barevná paleta", desc: "Oficiální barvy BoostUp: Olive, Lime a Terracotta." },
                        charts: { label: "Barvy grafů", desc: "Barevné kódování odpovídá jednotlivým příchutím produktu." },
                        readability: { label: "Čitelnost", desc: "Automaticky aplikovaný vysoký kontrast pro maximální přístupnost." }
                    }
                },
                marketing: {
                    title: "Email Marketing (Kampaně)",
                    description: "Hromadné rozesílání newsletterů. Cesta: Admin → Email CMS",
                    items: {
                        campaigns: { label: "Marketingové Kampaně", desc: "Rozesílání vybrané šablony všem odběratelům v dávkách." },
                        progress: { label: "Progress Bar", desc: "Sledování průběhu odesílání v reálném čase." }
                    }
                },
                newsletter: {
                    title: "Newsletter & Opt-out",
                    description: "Správa odběratelů a odhlášení",
                    items: {
                        subscribers: { label: "Odběratelé", desc: "Správa databáze aktivních kontaktů a stavu přihlášení." },
                        campaigns: { label: "Tvorba kampaní", desc: "Hromadné rozesílání s automatickou personalizací odkazů." },
                        unsub: { label: "Odhlášení (GDPR)", desc: "Automatický systém odhlášení přes personalizovaný odkaz v patičce e-mailu." },
                        safety: { label: "Bezpečnost", desc: "Ochrana proti duplicitnímu odeslání a filtrace pouze aktivních kontaktů." }
                    }
                }
            }
        },
        messages: {
            title: "Zprávy z webu",
            description: "Komunikace se zákazníky z kontaktního formuláře",
            selectMessage: "Vyberte zprávu",
            clickMessage: "Klikněte na konverzaci v levém panelu",
            empty: "Žádné zprávy",
            allResolved: "Všechny zprávy vyřízeny",
            search: "Hledat ve zprávách...",
            status: {
                unread: "Nové",
                read: "Přečteno",
                replied: "Odpovězeno"
            },
            actions: {
                reply: "Odpovědět",
                markRead: "Označit jako přečtené",
                delete: "Smazat",
                send: "Odeslat odpověď",
                cancel: "Zrušit",
                saving: "Odesílám..."
            },
            success: {
                replied: "Odpověď odeslána",
                read: "Zpráva označena jako přečtená",
                deleted: "Zpráva byla smazána"
            }
        },
        emailManager: {
            title: "E-mail Management",
            description: "Nastavení systémových notifikací a SMTP serveru.",
            tabs: {
                settings: "Nastavení",
                templates: "Šablony",
                logs: "Historie odesílání"
            },
            form: {
                provider: "Poskytovatel",
                host: "SMTP Host",
                port: "Port",
                user: "Uživatelské jméno",
                pass: "Heslo",
                fromName: "Jméno odesílatele",
                fromEmail: "E-mail odesílatele",
                save: "Uložit nastavení",
                test: "Odeslat testovací e-mail"
            },
            templates: {
                order_confirmation: "Potvrzení objednávky",
                shipping: "Odeslání zásilky",
                contact_auto_reply: "Automatická odpověď kontaktu",
                registration: "Uvítání nového uživatele",
                reset_password: "Reset hesla",
                magic_link: "Rychlé přihlášení",
                contact_inquiry: "Nová zpráva (pro admina)",
                newsletter_signup: "Přihlášení newsletteru"
            },
            campaign: {
                title: "Emailové Kampaně",
                description: "Hromadné rozesílání newsletterů odběratelům.",
                target: "Cílová skupina",
                subscribers: "Odběratelé newsletteru",
                selectTemplate: "Vyberte šablonu pro kampaň",
                start: "Spustit kampaň",
                sending: "Odesílám kampaň...",
                completed: "Kampaň dokončena",
                stats: "Statistiky doručení",
                startDesc: "Po stisknutí tlačítka bude šablona odeslána všem odběratelům.",
                confirm: "Opravdu chcete odeslat tuto kampaň {count} lidem?",
                success: "Kampaň byla odeslána všem odběratelům!",
                noSubscribers: "Nejsou žádní odběratelé",
                activeEmails: "Aktivních emailů",
                sourceNote: "Načteno z newsletter_subscriptions",
                progressStatus: "Odesláno {sentCount} z {totalToSend} emailů"
            },
            dialogs: {
                createTitle: "Vytvořit nový e-mail",
                createDesc: "Definujte ID šablony pro systémové použití.",
                idLabel: "Unikátní ID (např. leto_akce)",
                idPlaceholder: "bez mezer a diakritiky",
                createBtn: "Vytvořit šablonu",
                htmlTitle: "Základní HTML struktura",
                htmlDesc: "Pouze pro čtení – tato část je fixní pro všechny e-maily."
            },
            editor: {
                subject: "Předmět e-mailu",
                content: "Obsah e-mailu (HTML)",
                styleLabel: "Styl: BoostUp Premium Layout",
                placeholders: "Dostupné proměnné",
                activeEmailsLabel: "Aktivních emailů",
                preview: "Náhled",
                howItWorks: "Jak to funguje?",
                howItWorksDesc: "Texty, které vložíte do databáze, přepíší výchozí nastavení v kódu. Pokud chcete obnovit původní text, stačí smazat obsah a uložit.",
                status: "Status Engine",
                default: "VÝCHOZÍ",
                structure: "Struktura šablony",
                structureDesc: "Vkládá se do fixního rámu s logem.",
                placeholder: "Zadejte text...",
                subjectPlaceholder: "Zadejte předmět emailu...",
                contentPlaceholder: "Zadejte HTML kód šablony...",
                viewHtml: "Zobrazit HTML",
                previewFull: "Náhled celého e-mailu",
                copyBase: "Zkopírovat základ",
                copySuccess: "Základní HTML kód byl zkopírován.",
                tagsTitle: "Dostupné Značky (Placeholders)",
                tagsNote: "Kliknutím na značku ji vložíte do editoru. Tyto značky budou při odesílání automaticky nahrazeny reálnými údaji.",
                previewCtaTitle: "Chcete vidět jak to vypadá?",
                previewCtaDesc: "Odešlete si testovací email s těmito změnami",
                customBadge: "VLASTNÍ",
                searchPlaceholder: "Hledat šablonu...",
                newSubject: "Nový e-mail",
                newContent: "<p>Tady začněte psát svůj e-mail...</p>"
            },
            success: {
                saved: "Šablona byla uložena",
                defaultLoaded: "Načten výchozí systémový kód.",
                created: "Nová šablona byla vytvořena",
                testSent: "Testovací email byl odeslán na {email}",
                campaignSent: "Kampaň byla odeslána všem odběratelům!"
            },
            errors: {
                load: "Nepodařilo se načíst šablony",
                save: "Nepodařilo se uložit šablonu",
                create: "Chyba při vytváření šablony",
                delete: "Chyba při mazání šablony",
                test: "Chyba při odesílání testovacího emailu",
                subscribers: "Nepodařilo se načíst odběratele",
                idRequired: "ID šablony je povinné",
                idExists: "Šablona s tímto ID již existuje",
                fieldsRequired: "Předmět i obsah musí být vyplněny",
                defaultMissing: "Pro tuto šablonu neexistuje výchozí systémový kód."
            },
            testData: {
                customerName: "Test Testovič",
                orderNumber: "TEST-12345",
                message: "Toto je testovací zpráva pro náhled šablony.",
                itemName1: "BoostUp Lemon Blast",
                itemName2: "BoostUp Mixed Pack"
            }
        }
    },

    checkout: {
        title: "Pokladna",
        titleLine1: "DOKONČENÍ",
        titleLine2: "NÁKUPU",
        subTitle: "Zabezpečená pokladna / Doručení do 48 hodin",
        backToCart: "Zpět k výběru balení",
        cartTitle: "Můj košík",
        summaryTitle: "Shrnutí",
        steps: {
          stepCount: "Krok 3 ze 3",
          confirmation: "Potvrzení objednávky"
        },
        personalInfo: {
            title: "Doprava a kontakt",
            description: "Zadejte své doručovací údaje",
            mode_personal: "Osobní",
            mode_company: "Firemní",
            firstName: "Jméno",
            lastName: "Příjmení",
            email: "Emailová adresa",
            phone: "Telefonní číslo",
            companyLabel: "Nakupuji na firmu",
            companyName: "Název firmy",
            ico: "IČO",
            dic: "DIČ"
        },
        address: {
            title: "Fakturační údaje",
            street: "Ulice",
            houseNumber: "Č. popisné",
            city: "Město",
            zip: "PSČ",
            billingSame: "Fakturační údaje jsou stejné"
        },
        delivery: {
            title: "Způsob dopravy",
            method_personal: "Osobní vyzvednutí (Brno)",
            method_zasilkovna: "Zásilkovna",
            pickupPoint: "Výdejní místo",
            changePoint: "Změnit výdejní místo",
            free: "ZDARMA"
        },
        payment: {
            title: "Způsob platby",
            method_card: "Platební karta",
            method_card_sub: "Online platba",
            method_bank: "Bankovní převod",
            method_bank_sub: "Traduční proforma",
            method_apple: "Apple Pay",
            method_apple_sub: "Rychlá platba",
            method_google: "Google Pay",
            method_google_sub: "Rychlá platba",
            method_stripe_express: "Expresní platba (Apple/Google Pay)"
        },
        express: {
            title: "Expresní nákup",
            subtitle: "Nativní platba / Bez vyplňování",
            description: "Nejrychlejší cesta k energii. Adresa a kontakt se načtou bezpečně z vašeho telefonu.",
            promoPlaceholder: "Máte slevový kód?",
            promoApply: "POUŽÍT",
            promoNote: "Pozn: Slevové kódy nelze kombinovat se slevou na předplatné.",
            divider: "Rychlá platba",
            secureNote: "Zabezpečeno přes Stripe"
        },
        summary: {
            issueDate: "Datum vystavení",
            dueDate: "Datum splatnosti",
            issuer: "Dodavatel",
            icLabel: "IČ",
            subtotal: "Mezisoučet",
            discount: "Sleva celkem",
            shipping: "Doprava",
            totalLabel: "CELKEM",
            totalWithVat: "včetně DPH",
            submitButton: "Závazně objednat",
            submitButtonSub: "SSL Zabezpečená platba",
            processing: "Zpracovávám...",
            salesDisabled: "Prodej pozastaven",
            salesDisabledSub: "DOČASNĚ NEDOSTUPNÉ",
            salesDisabledAlert: "Prodej je dočasně pozastaven",
            salesDisabledDesc: "Momentálně nepřijímáme nové objednávky. Zkuste to prosím později.",
            legalConsent: "Odesláním objednávky souhlasíte s",
            terms: "obchodními podmínkami",
            privacy: "zásadami soukromí"
        }
    },

    promoCodes: {
        title: "SLEVOVÉ KÓDY",
        description: "Správa slevových kupónů a věrnostních kódů.",
        createButton: "Vytvořit kód",
        formTitle: "Vytvořit kód",
        formDesc: "Definujte procentuální slevu a kód voucheru.",
        codePlaceholder: "NAPŘ. BOOST10",
        codeLabel: "Unikátní kód (např. BOOST20)",
        discountLabel: "Výše slevy v %",
        discountNote: "Sleva se nesčítá se slevou na předplatné (15%). Systém automaticky vybere výhodnější variantu.",
        syncing: "Synchronizace s databází...",
        statusActive: "AKTIVNÍ",
        statusPaused: "PAUZA",
        deleteConfirm: "Opravdu chcete tento slevový kód smazat?",
        notifications: {
            loadError: "Nepodařilo se načíst slevové kódy",
            createSuccess: "Slevový kód byl úspěšně vytvořen",
            createError: "Nepodařilo se vytvořit kód",
            activated: "Kód byl aktivován",
            deactivated: "Kód byl deaktivován",
            toggleError: "Chyba při změně stavu kódu",
            deleteSuccess: "Kód byl smazán",
            deleteError: "Chyba při mazání kódu",
            popupOn: "Pop-up byl zapnut",
            popupOff: "Pop-up byl vypnut",
            popupError: "Chyba při změně pop-upu",
            popupCodeChanged: "Kód pop-upu změněn na {code}",
            popupCodeError: "Chyba při změně kódu"
        },
        popupSection: {
            title: "DÁRKOVALNÁ BRÁNA (POP-UP)",
            description: "Správa vyskakovacího okna se slevou pro nové návštěvníky.",
            toggleLabel: "Zobrazení pop-upu",
            toggleDesc: "Zapne/vypne automatické zobrazení slevy po načtení stránky.",
            codeLabel: "ZOBRAZENÝ KÓD",
            helpText: "Tento kód se zobrazí zákazníkům v pop-upu. Ujistěte se, že kód je vytvořen i v tabulce níže."
        },
        listSection: {
            title: "AKTIVNÍ KUPÓNY",
            empty: "Žádné slevové kódy",
            emptyDesc: "Zatím jste nevytvořili žádné slevové kódy. Začněte kliknutím na tlačítko 'Vytvořit kód'.",
            table: {
                code: "KÓD",
                discount: "SLEVA",
                status: "STAV",
                created: "VYTVOŘENO",
                actions: "AKCE"
            }
        }
    }
};
