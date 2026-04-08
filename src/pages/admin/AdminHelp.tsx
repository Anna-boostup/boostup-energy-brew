import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle, Mail, MousePointer2, BarChart, Gift, Settings2, Zap, Layout, ShieldCheck, Palette
} from "lucide-react";

interface HelpItem {
    label: string;
    description: string;
}

interface Section {
    icon: React.ElementType;
    title: string;
    description: string;
    items: HelpItem[];
    image?: string;
}

const sections: Section[] = [
    {
        icon: Globe,
        title: "Obsah webu",
        description: "Správa textů a vizuálního obsahu na všech sekcích webu. Cesta: Admin → Obsah webu",
        image: "/admin-guide/content-management.png",
        items: [
            {
                label: "Hero (Úvod)",
                description: "Hlavní nadpisy, popis produktu, tlačítka a testimonial. Obsahuje také přepínač viditelnosti badge BRZY NA TRHU."
            },
            {
                label: "Mise",
                description: "Texty v sekci 'O nás' – badge, nadpisy a odstavce. Badge viditelnost lze zapnout nebo vypnout přepínačem."
            },
            {
                label: "Ingredience",
                description: "Název a popis ingrediencií zobrazených na webu."
            },
            {
                label: "3B Koncept",
                description: "Obsah karet – podnadpis, statistiky a krátký popis pro každou kartu."
            },
            {
                label: "CTA (Odběr)",
                description: "Newsletter sekce – badge, nadpisy, popis a texty emailového formuláře."
            },
            {
                label: "Kontakt",
                description: "Email, telefon a adresa zobrazené v kontaktní sekci."
            },
            {
                label: "Příchutě",
                description: "Názvy, popisy a štítky pro jednotlivé varianty BoostUp."
            },
            {
                label: "Patička",
                description: "Brand popis a copyright text v dolní části webu."
            }
        ]
    },
    {
        icon: Type,
        title: "Ovládání typografie",
        description: "Každé textové pole v sekci Obsah webu má integrovaný stylový toolbar.",
        items: [
            {
                label: "Font family",
                description: "Vyber font z nabídky Google Fonts (Poppins, Inter, Roboto, Montserrat, Playfair Display a další). Poppins je výchozí font celého webu."
            },
            {
                label: "Velikost písma",
                description: "Výběr z přednastavených velikostí 10px–72px. Výběr 'Výchozí' odebere přepsání a použije se automatická velikost ze šablony."
            },
            {
                label: "Tučné (B) / Kurzíva (i)",
                description: "Tlačítka fungují jako přepínač – jedním kliknutím zapneš, druhým vypneš. Zvýrazněná tlačítka = aktivní styl."
            },
            {
                label: "Reset",
                description: "Zobrazí se automaticky pokud je styl upraven. Kliknutím se vrátíš na výchozí nastavení (Poppins, výchozí velikost, bez tučného/kurzívy)."
            },
            {
                label: "Jak se styly projevují",
                description: "Náhled vidíš přímo v inputu v reálném čase. Na webu se změny projeví po kliknutí na tlačítko 'Uložit změny' v horní části stránky."
            }
        ]
    },
    {
        icon: ToggleLeft,
        title: "Badge viditelnost",
        description: "Přepínač Badge viditelnosti se zobrazuje nad příslušnými textovými poli.",
        items: [
            {
                label: "Zapnutý přepínač = badge viditelný",
                description: "Barevný přepínač (zelený) = badge se zobrazuje na webu."
            },
            {
                label: "Vypnutý přepínač = badge skrytý",
                description: "Šedý přepínač = badge je skryt na webu. Text badge zůstane zachován a lze ho kdykoli znovu zapnout."
            },
            {
                label: "Kde se přepínač nachází",
                description: "Hero – badge BRZY NA TRHU, Mise – badge O NÁS, CTA – badge, Kontakt – badge KONTAKT."
            }
        ]
    },
    {
        icon: ShoppingCart,
        title: "Objednávky",
        description: "Přehled a správa všech zákaznických objednávek. Cesta: Admin → Objednávky",
        image: "/admin-guide/orders.png",
        items: [
            {
                label: "Filtrování objednávek",
                description: "Objednávky lze filtrovat podle stavu (čekající, potvrzená, odeslaná, doručená, zrušená)."
            },
            {
                label: "Detail objednávky",
                description: "Kliknutím na objednávku zobrazíš detail – zákazník, produkty, adresa, způsob platby."
            },
            {
                label: "Změna stavu",
                description: "Stav objednávky lze změnit přímo v detailu. Zákazník obdrží automatický email při změně na 'Odeslaná'."
            },
            {
                label: "Packeta štítky",
                description: "Pro objednávky s Packeta doručením lze vygenerovat a vytisknout štítky pomocí tlačítka 'Štítky Packeta'."
            },
            {
                label: "Oznámení v prohlížeči",
                description: "V horní části stránky Objednávky najdete tlačítko 'Povolit oznámení'. Po jeho aktivaci vás prohlížeč upozorní zvukem a vyskakovacím oknem na každou novou objednávku."
            },
            {
                label: "Automatická synchronizace plateb",
                description: "Systém je napojen na Stripe a GoPay. Jakmile zákazník úspěšně zaplatí, stav objednávky se automaticky změní na 'Zaplaceno'."
            }
        ]
    },
    {
        icon: BarChart,
        title: "Ceny a Statistiky",
        description: "Globální správa cen a přehled výkonu e-shopu. Cesta: Admin → Ceny a Statistiky",
        items: [
            {
                label: "Globální ceny balení",
                description: "Zde nastavíte ceny pro balení 3, 12 a 21 ks. Tyto ceny jsou globální – platí pro všechny příchutě i pro MIX balení."
            },
            {
                label: "Statistiky prodejů",
                description: "Grafy zobrazují počet objednávek a prodaných jednotek za posledních 30 dní. Data se aktualizují automaticky."
            },
            {
                label: "Analýza příchutí",
                description: "Sledujte, které příchutě jsou nejoblíbenější. MIX balení jsou rozpočítána na jednotlivé lahvičky pro přesnější přehled."
            }
        ]
    },
    {
        icon: Gift,
        title: "Slevové kódy",
        description: "Správa slevových kupónů a uvítacího pop-upu. Cesta: Admin → Slevové kódy",
        items: [
            {
                label: "Tvorba kódů",
                description: "Můžete vytvářet neomezené množství kódů s různou procentuální slevou. Kódy lze kdykoli aktivovat/deaktivovat."
            },
            {
                label: "Uvítací pop-up",
                description: "Speciální funkce, která novým návštěvníkům webu automaticky nabídne slevový kód pro motivaci k prvnímu nákupu."
            },
            {
                label: "Pravidla slev",
                description: "Slevové kódy se nesčítají se slevou na předplatné. Systém vždy uplatní tu výhodnější variantu pro zákazníka."
            }
        ]
    },
    {
        icon: Package,
        title: "Sklad produktů",
        description: "Správa skladových zásob hotových výrobků. Cesta: Admin → Sklad produktů",
        image: "/admin-guide/inventory.png",
        items: [
            {
                label: "Přidání zásoby",
                description: "Klikni na produkt a zadej přidávané množství. Systém automaticky navýší celkový stav."
            },
            {
                label: "Minimální zásoby",
                description: "Každý produkt má nastavenou minimální zásobu. Při poklesu pod minimum se zobrazí upozornění."
            }
        ]
    },
    {
        icon: Factory,
        title: "Sklad výroby",
        description: "Správa surovin a výrobních materiálů. Cesta: Admin → Sklad výroby",
        image: "/admin-guide/manufacture.png",
        items: [
            {
                label: "Upozornění (červená tečka)",
                description: "Červená tečka u položky Sklad výroby v menu = některá surovina je pod minimální nebo varovnou zásobou."
            },
            {
                label: "Úprava zásob",
                description: "Klikni na surovinu pro zobrazení detailu a ruční úpravu množství."
            },
            {
                label: "Notifikace",
                description: "Notifikace lze pro každou surovinu zapnout nebo vypnout."
            }
        ]
    },
    {
        icon: Save,
        title: "Ukládání změn",
        description: "Důležité informace o ukládání všech změn v admin panelu.",
        items: [
            {
                label: "Tlačítko 'Uložit změny'",
                description: "Nachází se vždy v horní části stránky. Bez kliknutí na toto tlačítko se žádné změny neuloží."
            },
            {
                label: "Automatické načítání",
                description: "Po obnovení stránky se načtou data z databáze. Pokud nebyla uložena, změny se ztratí."
            },
            {
                label: "Tlačítko 'Resetovat'",
                description: "Vrátí všechny neuložené změny na stav posledního uložení."
            },
            {
                label: "Webmail (Forpsi)",
                description: "V levém menu najdete rychlý odkaz 'E-maily (Webmail)', který vás přesměruje přímo do rozhraní Forpsi."
            },
            {
                label: "Mobilní a desktopové aplikace",
                description: "Doporučujeme si e-mail napojit přímo do telefonu nebo počítače pomocí IMAP a SMTP údajů."
            }
        ]
    },
    {
        icon: ShieldCheck,
        title: "Autentizace a Bezpečí",
        description: "Důležité informace o přihlašování a konfiguraci zabezpečení systému.",
        items: [
            {
                label: "Magic Link a obnova hesla",
                description: "Odkazy v e-mailech jsou generovány automaticky. Po kliknutí na Magic Link je uživatel přesměrován přímo do svého uživatelského profilu."
            },
            {
                label: "Automatická detekce domény",
                description: "Systém rozpozná, zda se nacházíte na testovacím nebo produkčním prostředí, a podle toho generuje správné odkazy. Není vyžadováno žádné ruční přepínání v kódu."
            },
            {
                label: "Whitelist v Supabase (Důležité!)",
                description: "Pro správné fungování přesměrování musí být adresy https://drinkboostup.cz a https://test.drinkboostup.cz přidány v Supabase Dashboardu v sekci Authentication -> URL Configuration -> Redirect URLs."
            }
        ]
    },
    {
        icon: Palette,
        title: "Design a Branding",
        description: "Standardy pro vizuální identitu a čitelnost rozhraní.",
        items: [
            {
                label: "Oficiální barevná paleta",
                description: "Hlavní barvy jsou Olive (#3D5A2F), Lime (#DFDF57) a Terracotta (#AA263E). Používejte tyto barvy pro zachování jednotného brandu."
            },
            {
                label: "Barevné kódování grafů",
                description: "V grafech prodejů (Ceny a Statistiky) odpovídají barvy příchutím: Žlutá/Limetková = Lemon Blast, Červená = Red Rush, Tmavě zelená = Silky Leaf."
            },
            {
                label: "Čitelnost a kontrast",
                description: "U prvků s barevným gradientem (např. výběr příchutě) je automaticky aplikován vysoký kontrast textu (Cream na tmavém podkladu) pro maximální přístupnost."
            }
        ]
    }
];

const AdminHelp = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-start gap-4 sm:gap-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.8rem] sm:rounded-[2.5rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <HelpCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-3">
                        <h1 className="text-3xl sm:text-6xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">Centrum Pomoci</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px]">
                                Manuál pro administraci systému BoostUp
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick tip banner */}
            <div className="relative group overflow-hidden bg-olive-dark rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl">
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-lime/5 blur-[60px] sm:blur-[80px] -translate-y-1/2 translate-x-1/3" />
                <div className="relative flex flex-col md:flex-row gap-6 sm:gap-10 p-8 sm:p-12 items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-110 group-hover:border-lime/30 duration-700">
                        <MousePointer2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <p className="text-lg sm:text-2xl font-display font-black text-white uppercase italic tracking-tight">Pro rychlou navigaci</p>
                        <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[11px] leading-relaxed">
                            Kliknutím na nadpis rozbalíte detailní návod. Všechny změny musí být vždy potvrzeny tlačítkem <span className="text-white font-black border-b border-lime/30 mx-1">Uložit změny</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible className="w-full space-y-6">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <AccordionItem
                            key={section.title}
                            value={`item-${idx}`}
                            className="border-none glass-card rounded-[3rem] overflow-hidden px-2 hover:shadow-2xl hover:shadow-olive/10 transition-all duration-700"
                        >
                            <AccordionTrigger className="hover:no-underline py-8 sm:py-12 px-6 sm:px-8 group border-none">
                                <div className="flex items-center gap-5 sm:gap-8 text-left">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform duration-700 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-lime/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white relative z-10" />
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <h3 className="text-xl sm:text-3xl font-black text-olive-dark font-display uppercase tracking-tight leading-none italic">{section.title}</h3>
                                        <p className="text-[9px] sm:text-[10px] text-brand-muted font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">{section.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 sm:px-12 pb-10 sm:pb-14 pt-2">
                                <div className="grid lg:grid-cols-2 gap-16 items-start">
                                    <div className="space-y-10">
                                        <ul className="space-y-8">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex gap-6 group/item">
                                                    <div className="mt-1.5 w-7 h-7 rounded-xl bg-olive-dark flex items-center justify-center shrink-0 shadow-xl group-hover/item:scale-110 transition-transform">
                                                        <ChevronRight className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="font-black text-xl text-olive-dark font-display uppercase tracking-tight leading-none italic">{item.label}</p>
                                                        <p className="text-brand-muted font-black uppercase tracking-[0.1em] text-[11px] leading-relaxed">{item.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {section.image && (
                                        <div className="space-y-8 sticky top-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">Vizuální reprezentace systému</p>
                                            </div>
                                            <div className="rounded-[3rem] p-3 bg-olive-dark/5 border border-olive/10 overflow-hidden shadow-2xl group relative transition-all duration-700 hover:bg-olive-dark/10">
                                                <div className="rounded-[2.2rem] overflow-hidden border-4 border-white shadow-inner relative z-10">
                                                    <div className="absolute inset-0 bg-lime/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                                                    <img
                                                        src={section.image}
                                                        alt={section.title}
                                                        className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-center text-brand-muted font-black uppercase tracking-[0.3em] italic">
                                                * Interface se dynamicky přizpůsobuje vašemu zařízení
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Footer note */}
            <div className="bg-olive-dark text-white p-10 sm:p-20 rounded-[3rem] sm:rounded-[4.5rem] text-center space-y-8 sm:space-y-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-lime/10 rounded-full blur-[120px] transition-all duration-1000 group-hover:scale-150" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-lime/10 rounded-full blur-[120px] transition-all duration-1000 group-hover:scale-150" />
                
                <div className="relative z-10 space-y-6 sm:space-y-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-[1.8rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:border-lime/50 transition-all duration-700 shadow-2xl">
                        <HelpCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-3xl sm:text-5xl font-black font-display uppercase italic tracking-tight leading-none text-white">Technická podpora</h3>
                        <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Nenašli jste odpověď nebo je něco v nepořádku? Jsme připraveni vám okamžitě pomoci.
                        </p>
                    </div>
                    <div className="pt-8 sm:pt-12 flex flex-col items-center gap-6">
                        <a href="mailto:support@drinkboostup.cz" className="h-14 sm:h-16 px-8 sm:px-12 rounded-2xl bg-lime text-olive-dark flex items-center justify-center font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] hover:bg-white hover:scale-105 transition-all duration-500 shadow-2xl shadow-lime/20 group">
                            support@drinkboostup.cz
                        </a>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-white/20">
                            <div className="hidden sm:block w-8 h-[1px] bg-white/10" />
                            <span className="text-[8px] sm:text-[10px] font-black font-mono uppercase tracking-[0.3em] sm:tracking-[0.5em]">BoostUp Engine v5.0 // Platinum</span>
                            <div className="hidden sm:block w-8 h-[1px] bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
