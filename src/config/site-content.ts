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
        instagram: "https://instagram.com/boostup",
        facebook: "https://facebook.com/boostup",
        linkedin: "https://linkedin.com/company/boostup",
        youtube: "https://youtube.com/@boostup"
    },

    hero: {
        announcement: "BRZY NA TRHU",
        headline: {
            part1: "ENERGIE",
            gradient: "NA CELÝ DEN",
            part2: "přirozeně."
        },
        description: "6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity. Žádná umělá sladidla a aromata.",
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
        ]
    },

    mission: {
        badge: "O NÁS",
        headline: {
            part1: "NAŠE",
            highlight: "MISE"
        },
        paragraphs: [
            "Každý z nás zná ten den, kdy se snažíte soustředit, dodělat úkol, ale prostě to nejde. Káva už nepomáhá a klasické energeťáky?",
            "Ty vás sice nakopnou, ale za půl hodiny jste zase dolů. Chtěli jsme to změnit.",
            "Proto jsme vytvořili BoostUp – čistý, efektivní shot, který vás drží v kondici celé hodiny."
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
          • L-Theanin pro klidnou koncentraci bez nervozity
          • Guarana s postupným uvolňováním energie
          • B-vitamíny pro zdravou funkci nervové soustavy
          
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
          • Antioxidanty pro ochranu buněk
          • Přírodní ingredience bez umělých přísad
          
          **Přínosy:**
          • Synergie mezi mentální a fyzickou složkou
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
        button: "Přihlásit se",
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
                    { label: "VOP", href: "/vop" },
                    { label: "Ochrana soukromí", href: "/privacy" },
                    { label: "Cookies", href: "/cookies" },
                    { label: "Doprava a platba", href: "/shipping" }
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
            copyright: "© 2024 BOOSTUP ENERGY S.R.O. VŠECHNA PRÁVA VYHRAZENA.",
            legal: [
                { label: "Terms", href: "#" },
                { label: "Privacy", href: "#" }
            ]
        }
    },

    bankInfo: {
        accountNumber: "2402922119",
        bankCode: "2010", // Fio banka as placeholder or actual?
        bankName: "Fio banka",
        iban: "CZ1220100000002402922119",
        accountName: "BOOSTUP ENERGY S.R.O.",
        currency: "CZK",
        qrMessage: "Objednávka"
    }
};
