import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle, Mail, MousePointer2
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
            }
        ]
    },
    {
        icon: Mail,
        title: "E-mailová komunikace",
        description: "Správa firemních e-mailových schránek drinkboostup.cz.",
        items: [
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
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Nápověda &amp; Příručka</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Kompletní průvodce správou e-shopu BoostUp.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick tip banner */}
            <div className="flex gap-4 p-5 bg-lime/10 border border-lime/20 rounded-2xl text-base text-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
                    <MousePointer2 className="w-5 h-5 text-lime-700" />
                </div>
                <p className="flex items-center">
                    <span>
                        <strong>Tip pro rychlou práci:</strong> Kliknutím na nadpis sekce níže ji rozbalíte pro detailní návod a náhledy.
                        Všechny změny obsahu musíte vždy potvrdit tlačítkem <strong>Uložit změny</strong>.
                    </span>
                </p>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible className="w-full space-y-4">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <AccordionItem
                            key={section.title}
                            value={`item-${idx}`}
                            className="border border-border bg-card rounded-2xl overflow-hidden px-2 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <AccordionTrigger className="hover:no-underline py-6 px-4">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground leading-none">{section.title}</h3>
                                        <p className="text-sm text-muted-foreground font-normal mt-1.5">{section.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-8 pt-2">
                                <div className="grid lg:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-6">
                                        <ul className="space-y-4">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="flex gap-3 group">
                                                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                                        <ChevronRight className="w-3 h-3 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-base text-foreground">{item.label}</p>
                                                        <p className="text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {section.image && (
                                        <div className="space-y-4">
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                Vizuální náhled z administrace
                                            </p>
                                            <div className="rounded-2xl border-2 border-border overflow-hidden shadow-2xl bg-slate-900 group relative">
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                <img
                                                    src={section.image}
                                                    alt={section.title}
                                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                                                    onError={(e) => {
                                                        // Fallback if image is not moved to public yet
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-center text-muted-foreground italic">
                                                * Přesný vzhled se může mírně lišit podle velikosti obrazovky.
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
            <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
                <HelpCircle className="w-10 h-10 text-primary mx-auto opacity-50" />
                <h3 className="text-xl font-bold">Potřebujete technickou pomoc?</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                    Pokud jste v manuálu nenašli odpověď nebo narazili na chybu v aplikaci, neváhejte mě kontaktovat pro rychlou podporu.
                </p>
                <div className="pt-2">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">BoostUp Admin Panel v2.4.0</span>
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;                          </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Footer note */}
            <div className="text-center text-xs text-muted-foreground pb-4">
                BoostUp Admin Panel &middot; Pokud narazíš na problém, kontaktuj technickou podporu.
            </div>
        </div>
    );
};

export default AdminHelp;
