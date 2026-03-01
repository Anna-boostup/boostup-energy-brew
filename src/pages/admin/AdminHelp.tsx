import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle
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
}

const sections: Section[] = [
    {
        icon: Globe,
        title: "Obsah webu",
        description: "Správa textů a vizuálního obsahu na všech sekcích webu. Cesta: Admin → Obsah webu",
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
                description: "Název a popis ingrediencí zobrazených na webu."
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
            }
        ]
    },
    {
        icon: Package,
        title: "Sklad produktů",
        description: "Správa skladových zásob hotových výrobků. Cesta: Admin → Sklad produktů",
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
        items: [
            {
                label: "Upozornění (červená tečka)",
                description: "Červená tečka u položky Sklad výroby v menu = některá surovina je pod minimální nebo varovnou zásobou."
            },
            {
                label: "Úprava zásob",
                description: "Klikni na surovinu pro zobrazení detailu a ruční úpravu množství. Lze nastavit minimální a varovnou hranici."
            },
            {
                label: "Notifikace",
                description: "Notifikace lze pro každou surovinu zapnout nebo vypnout. Pokud jsou zapnuty a zásoba klesne pod limit, zobrazí se alert v menu."
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
                description: "Vrátí všechny neuložené změny na stav posledního uložení. Nelze vrátit zpět po uložení."
            }
        ]
    }
];

const AdminHelp = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Nápověda &amp; Příručka</h1>
                    <p className="text-muted-foreground mt-1">
                        Průvodce správou webu a admin panelem BoostUp.
                    </p>
                </div>
            </div>

            {/* Quick tip banner */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <p>
                    <strong>Nezapomeň:</strong> Všechny změny v sekci <em>Obsah webu</em> musíš potvrdit tlačítkem{" "}
                    <strong>Uložit změny</strong> v horní části stránky – jinak se po obnovení ztratí.
                </p>
            </div>

            {/* Sections */}
            {sections.map((section) => {
                const Icon = section.icon;
                return (
                    <Card key={section.title} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                                {section.title}
                            </CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y divide-border">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex gap-3 px-6 py-4 hover:bg-muted/20 transition-colors">
                                        <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{item.label}</p>
                                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                                        </div>
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
