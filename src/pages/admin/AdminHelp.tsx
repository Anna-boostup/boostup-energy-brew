import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle, Mail, MousePointer2, BarChart3, Gift
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
        icon: BarChart3,
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
    }
];

const AdminHelp = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-start gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shrink-0 shadow-2xl">
                        <HelpCircle className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter font-display uppercase italic">Centrum Pomoci</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                            Kompletní manuál pro administraci systému BoostUp.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick tip banner */}
            <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-[3rem]" />
                <div className="relative flex flex-col md:flex-row gap-8 p-10 items-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shrink-0 shadow-xl transition-transform group-hover:scale-110 duration-500">
                        <MousePointer2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-xl font-display font-black text-slate-900 uppercase italic">Pro rychlou navigaci</p>
                        <p className="text-slate-500 font-bold leading-relaxed text-sm">
                            Kliknutím na nadpis rozbalíte detailní návod. Všechny změny musí být vždy potvrzeny tlačítkem <span className="text-slate-900 font-black">Uložit změny</span>.
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
                            className="border border-white shadow-sm bg-white/50 backdrop-blur-sm rounded-[3rem] overflow-hidden px-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border-none"
                        >
                            <AccordionTrigger className="hover:no-underline py-10 px-8 group">
                                <div className="flex items-center gap-6 text-left">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight">{section.title}</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{section.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-10 pb-12 pt-4">
                                <div className="grid lg:grid-cols-2 gap-12 items-start">
                                    <div className="space-y-8">
                                        <ul className="space-y-6">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex gap-5 group">
                                                    <div className="mt-1 w-6 h-6 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                                                        <ChevronRight className="w-3 h-3 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-lg text-slate-900 font-display uppercase tracking-tight leading-none">{item.label}</p>
                                                        <p className="text-slate-500 font-bold text-sm leading-relaxed">{item.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {section.image && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vizuální reprezentace</p>
                                            </div>
                                            <div className="rounded-[2.5rem] border-8 border-white overflow-hidden shadow-2xl bg-slate-900 group relative">
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                                                <img
                                                    src={section.image}
                                                    alt={section.title}
                                                    className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest italic">
                                                * Interface se přizpůsobuje vašemu zařízení.
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
            <div className="bg-slate-900 text-white p-16 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary opacity-5 rounded-full blur-[100px] transition-all duration-1000 group-hover:scale-150" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary opacity-5 rounded-full blur-[100px] transition-all duration-1000 group-hover:scale-150" />
                
                <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-primary/50 transition-all duration-500">
                        <HelpCircle className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black font-display uppercase italic tracking-tight">Technická podpora</h3>
                        <p className="text-slate-400 font-bold text-lg max-w-xl mx-auto leading-relaxed">
                            Nenašli jste odpověď nebo je něco v nepořádku? Jsme připraveni vám okamžitě pomoci se správou vašeho e-shopu.
                        </p>
                    </div>
                    <div className="pt-10 flex flex-col items-center gap-4">
                        <a href="mailto:support@drinkboostup.cz" className="text-primary font-black uppercase text-xs tracking-[0.3em] hover:text-white transition-colors">support@drinkboostup.cz</a>
                        <span className="text-[10px] font-black font-mono text-slate-700 uppercase tracking-widest">BoostUp Engine v4.0.0 // Platinum Edition</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
