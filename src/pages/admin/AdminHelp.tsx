import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle, Mail, MousePointer2, BarChart, Gift, Settings2, Zap, Layout, ShieldCheck, Palette,
    Database, Send, Info, Key, Newspaper, Loader2, Users, FileText, Download
} from "lucide-react";
import { useContent } from "@/context/ContentContext";

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
    path?: string;
}

const AdminHelp = () => {
    const { content, loading } = useContent();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-olive-dark" />
                <p className="text-olive-dark font-black uppercase tracking-[0.4em] animate-pulse">{content?.admin?.general?.loading || "Načítám nápovědu..."}</p>
            </div>
        );
    }

    const sections: Section[] = [
        {
            icon: Zap,
            title: content?.admin?.help?.sections?.dashboard?.title || "Přehled (Dashboard)",
            description: content?.admin?.help?.sections?.dashboard?.description || "Hlavní řídicí panel a stav prodeje",
            image: "/admin-guide/dashboard.png",
            path: "/admin",
            items: [
                { label: content?.admin?.help?.sections?.dashboard?.items?.salesToggle?.label || "Vypínač prodeje", description: content?.admin?.help?.sections?.dashboard?.items?.salesToggle?.desc || "Hlavní přepínač pro okamžité pozastavení nebo spuštění možnosti nakupovat na e-shopu." },
                { label: content?.admin?.help?.sections?.dashboard?.items?.workflow?.label || "Pracovní tok (Workflow)", description: content?.admin?.help?.sections?.dashboard?.items?.workflow?.desc || "Rychlý přehled počtu nových, připravovaných, expedovaných a stornovaných objednávek." },
                { label: content?.admin?.help?.sections?.dashboard?.items?.stockQuick?.label || "Rychlý stav skladu", description: content?.admin?.help?.sections?.dashboard?.items?.stockQuick?.desc || "Okamžitý náhled na počet dostupných lahví jednotlivých příchutí přímo na hlavní ploše." }
            ]
        },
        {
            icon: Globe,
            title: content?.admin?.help?.sections?.content?.title || "Obsah webu",
            description: content?.admin?.help?.sections?.content?.description || "Správa textů, ingrediencí a domovské stránky",
            image: "/admin-guide/content-management.png",
            path: "/admin/content",
            items: [
                { label: content?.admin?.help?.sections?.content?.items?.hero?.label || "Hlavní sekce", description: content?.admin?.help?.sections?.content?.items?.hero?.desc || "Správa úvodního banneru a textů." },
                { label: content?.admin?.help?.sections?.content?.items?.mission?.label || "Mise", description: content?.admin?.help?.sections?.content?.items?.mission?.desc || "Úprava vizí a filosofie značky." },
                { label: content?.admin?.help?.sections?.content?.items?.ingredients?.label || "Ingredience", description: content?.admin?.help?.sections?.content?.items?.ingredients?.desc || "Editace popisu klíčových složek." },
                { label: content?.admin?.help?.sections?.content?.items?.concept?.label || "3B Koncept", description: content?.admin?.help?.sections?.content?.items?.concept?.desc || "Obsah karet pilířů (Brain, Body, Balance) a jejich detailních vyskakovacích (popup) vysvětlení." },
                { label: content?.admin?.help?.sections?.content?.items?.settings?.label || "Globální nastavení", description: content?.admin?.help?.sections?.content?.items?.settings?.desc || "Zapnutí/vypnutí vyskakovacího slevového pop-upu." },
                { label: content?.admin?.help?.sections?.content?.items?.flavors?.label || "Příchutě", description: content?.admin?.help?.sections?.content?.items?.flavors?.desc || "Správa produktové sekce příchutí." },
                { label: content?.admin?.help?.sections?.content?.items?.footer?.label || "Patička", description: content?.admin?.help?.sections?.content?.items?.footer?.desc || "Správa odkazů a informací dole na webu." }
            ]
        },
        {
            icon: FileText,
            title: content?.admin?.help?.sections?.blog?.title || "Blog a články",
            description: content?.admin?.help?.sections?.blog?.description || "Publikační systém pro tvorbu obsahu",
            image: "/admin-guide/blog.png",
            path: "/admin/blog",
            items: [
                { label: content?.admin?.help?.sections?.blog?.items?.editor?.label || "Vytvoření článku", description: content?.admin?.help?.sections?.blog?.items?.editor?.desc || "Použijte textový editor pro napsání formátovaného obsahu s možností vkládat obrázky." },
                { label: content?.admin?.help?.sections?.blog?.items?.templates?.label || "Designové šablony", description: content?.admin?.help?.sections?.blog?.items?.templates?.desc || "Při tvorbě článku můžete vybrat rozložení: Modern, Centered, nebo Minimal." },
                { label: content?.admin?.help?.sections?.blog?.items?.seo?.label || "SEO Metadata", description: content?.admin?.help?.sections?.blog?.items?.seo?.desc || "Před publikací vyplňte název, perex a klíčová slova pro lepší dohledatelnost na Googlu." }
            ]
        },
        {
            icon: Send,
            title: content?.admin?.help?.sections?.emails?.title || "E-mailové šablony a kampaně",
            description: content?.admin?.help?.sections?.emails?.description || "Správa transakčních e-mailů a hromadného marketingu",
            image: "/admin-guide/emails.png",
            path: "/admin/emails",
            items: [
                { label: content?.admin?.help?.sections?.emails?.items?.transactional?.label || "Transakční e-maily", description: content?.admin?.help?.sections?.emails?.items?.transactional?.desc || "Úprava zpráv, které se odesílají automaticky (např. potvrzení objednávky, expedice)." },
                { label: content?.admin?.help?.sections?.emails?.items?.placeholders?.label || "Dynamické značky", description: content?.admin?.help?.sections?.emails?.items?.placeholders?.desc || "V editoru můžete kliknout na speciální proměnné (např. {{customerName}}), které se při odeslání nahradí skutečnými daty." },
                { label: content?.admin?.help?.sections?.emails?.items?.customTemplates?.label || "Vlastní šablony", description: content?.admin?.help?.sections?.emails?.items?.customTemplates?.desc || "Kliknutím na tlačítko '+' v seznamu šablon vytvoříte nový e-mail (např. pro letní akci)." },
                { label: content?.admin?.help?.sections?.emails?.items?.masterFrame?.label || "Master Šablona", description: content?.admin?.help?.sections?.emails?.items?.masterFrame?.desc || "Přepínač pro automatické zabalení e-mailu do značkového BoostUp layoutu (s logem a odhlašovacím odkazem)." },
                { label: content?.admin?.help?.sections?.emails?.items?.campaigns?.label || "Newsletter Kampaně", description: content?.admin?.help?.sections?.emails?.items?.campaigns?.desc || "Záložka Rozesílka umožňuje rozeslat šablonu všem odběratelům newsletteru v dávkách se sledováním průběhu." },
                { label: content?.admin?.help?.sections?.emails?.items?.testing?.label || "Zkušební e-mail", description: content?.admin?.help?.sections?.emails?.items?.testing?.desc || "Možnost nechat si před spuštěním ostré kampaně poslat testovací e-mail na vlastní administrátorskou adresu." }
            ]
        },
        {
            icon: Mail,
            title: content?.admin?.help?.sections?.messages?.title || "Příchozí zprávy",
            description: content?.admin?.help?.sections?.messages?.description || "Zpracování dotazů od zákazníků",
            image: "/admin-guide/messages.png",
            path: "/admin/messages",
            items: [
                { label: content?.admin?.help?.sections?.messages?.items?.inbox?.label || "Nový dotaz", description: content?.admin?.help?.sections?.messages?.items?.inbox?.desc || "Všechny zprávy z kontaktního formuláře se řadí sem. Neoznačené zprávy ukáží upozornění." },
                { label: content?.admin?.help?.sections?.messages?.items?.reply?.label || "Odpovědi", description: content?.admin?.help?.sections?.messages?.items?.reply?.desc || "Ze sekce můžete rovnou odesílat odpovědi zákazníkům e-mailem přes integrovaný systém." }
            ]
        },
        {
            icon: ShoppingCart,
            title: content?.admin?.help?.sections?.orders?.title || "Objednávky",
            description: content?.admin?.help?.sections?.orders?.description || "Zpracování nákupů zákazníků",
            image: "/admin-guide/orders.png",
            path: "/admin/orders",
            items: [
                { label: content?.admin?.help?.sections?.orders?.items?.filtering?.label || "Filtrování", description: content?.admin?.help?.sections?.orders?.items?.filtering?.desc || "Rychlé řazení podle stavu (nové, odeslané atd.)." },
                { label: content?.admin?.help?.sections?.orders?.items?.detail?.label || "Detail objednávky", description: content?.admin?.help?.sections?.orders?.items?.detail?.desc || "Kompletní rozpis včetně fakturačních a dodacích údajů." },
                { label: content?.admin?.help?.sections?.orders?.items?.bulk?.label || "Hromadné akce", description: content?.admin?.help?.sections?.orders?.items?.bulk?.desc || "Hromadná stornování, změny stavů nebo hromadný tisk štítků Zásilkovny (A4 combined pro úsporu papíru)." },
                { label: content?.admin?.help?.sections?.orders?.items?.packeta?.label || "Zásilkovna (Packeta API)", description: content?.admin?.help?.sections?.orders?.items?.packeta?.desc || "Přímé vygenerování a tisk štítků. Tlačítko 'Synchronizovat' stáhne aktuální stavy přepravy." }
            ]
        },
        {
            icon: Package,
            title: content?.admin?.help?.sections?.inventory?.title || "Skladové zásoby",
            description: content?.admin?.help?.sections?.inventory?.description || "Evidování dostupnosti produktů",
            image: "/admin-guide/inventory.png",
            path: "/admin/inventory",
            items: [
                { label: content?.admin?.help?.sections?.inventory?.items?.add?.label || "Naskladnění", description: content?.admin?.help?.sections?.inventory?.items?.add?.desc || "Navýšení nebo snížení množství jednotlivých příchutí." },
                { label: content?.admin?.help?.sections?.inventory?.items?.minimum?.label || "Upozornění na limit", description: content?.admin?.help?.sections?.inventory?.items?.minimum?.desc || "Automatická indikace vyprodaných položek." },
                { label: content?.admin?.help?.sections?.inventory?.items?.history?.label || "Historie pohybů", description: content?.admin?.help?.sections?.inventory?.items?.history?.desc || "Kompletní log všech změn na skladě s označením uživatele, který změnu provedl, a poznámkou." }
            ]
        },
        {
            icon: Factory,
            title: content?.admin?.help?.sections?.manufacture?.title || "Výroba",
            description: content?.admin?.help?.sections?.manufacture?.description || "Suroviny potřebné pro výrobu",
            image: "/admin-guide/manufacture.png",
            path: "/admin/manufacture",
            items: [
                { label: content?.admin?.help?.sections?.manufacture?.items?.alert?.label || "Stav surovin", description: content?.admin?.help?.sections?.manufacture?.items?.alert?.desc || "Monitorování plechovek, víček, etiket a samotného nápoje." },
                { label: content?.admin?.help?.sections?.manufacture?.items?.history?.label || "Historie surovin", description: content?.admin?.help?.sections?.manufacture?.items?.history?.desc || "Kompletní log spotřeby a doskladňování výrobních materiálů s datem a poznámkou." }
            ]
        },
        {
            icon: BarChart,
            title: content?.admin?.help?.sections?.pricing?.title || "Cenotvorba a Statistiky",
            description: content?.admin?.help?.sections?.pricing?.description || "Finanční přehledy a nastavení cen",
            image: "/admin-guide/pricing.png",
            path: "/admin/pricing",
            items: [
                { label: content?.admin?.help?.sections?.pricing?.items?.global?.label || "Základní cena", description: content?.admin?.help?.sections?.pricing?.items?.global?.desc || "Centrální úprava prodejní ceny pro všechny produkty." },
                { label: content?.admin?.help?.sections?.pricing?.items?.stats?.label || "Grafy", description: content?.admin?.help?.sections?.pricing?.items?.stats?.desc || "Vizualizace celkových tržeb a úspěšnosti." }
            ]
        },
        {
            icon: Gift,
            title: content?.admin?.help?.sections?.promos?.title || "Slevové kódy",
            description: content?.admin?.help?.sections?.promos?.description || "Marketingové a slevové kampaně",
            image: "/admin-guide/promo-codes.png",
            path: "/admin/promo-codes",
            items: [
                { label: content?.admin?.help?.sections?.promos?.items?.creation?.label || "Vytvoření kódu", description: content?.admin?.help?.sections?.promos?.items?.creation?.desc || "Nastavení unikátního textového kódu a výše slevy." },
                { label: content?.admin?.help?.sections?.promos?.items?.popup?.label || "Dárková brána", description: content?.admin?.help?.sections?.promos?.items?.popup?.desc || "Správa a nastavení kódu, který se zobrazí v uvítacím slevovém popup okně na e-shopu." },
                { label: content?.admin?.help?.sections?.promos?.items?.rules?.label || "Pravidla čerpání", description: content?.admin?.help?.sections?.promos?.items?.rules?.desc || "Limit použití kódu (např. platnost do data, aktivní/neaktivní)." }
            ]
        },
        {
            icon: Users,
            title: content?.admin?.help?.sections?.users?.title || "Uživatelé a Práva",
            description: content?.admin?.help?.sections?.users?.description || "Správa přístupů a zákazníků",
            image: "/admin-guide/users.png",
            path: "/admin/users",
            items: [
                { label: content?.admin?.help?.sections?.users?.items?.list?.label || "Seznam uživatelů", description: content?.admin?.help?.sections?.users?.items?.list?.desc || "Přehled všech registrovaných osob na platformě." },
                { label: content?.admin?.help?.sections?.users?.items?.roles?.label || "Změna role", description: content?.admin?.help?.sections?.users?.items?.roles?.desc || "Možnost přidělit jinému uživateli práva typu Admin, čímž získá přístup k tomuto rozhraní." },
                { label: content?.admin?.help?.sections?.users?.items?.history?.label || "Historie nákupů", description: content?.admin?.help?.sections?.users?.items?.history?.desc || "Pohled na minulé transakce konkrétní osoby." }
            ]
        },
        {
            icon: Download,
            title: content?.admin?.help?.sections?.accounting?.title || "Účetnictví a Exporty",
            description: content?.admin?.help?.sections?.accounting?.description || "Generování podkladů pro účetní systémy",
            image: "/admin-guide/accounting-export.png",
            path: "/admin/orders",
            items: [
                { label: content?.admin?.help?.sections?.accounting?.items?.csv?.label || "Export do CSV", description: content?.admin?.help?.sections?.accounting?.items?.csv?.desc || "V horní části správy objednávek naleznete tlačítko pro stažení všech dat ve formátu CSV pro systémy jako Pohoda nebo iDoklad." },
                { label: content?.admin?.help?.sections?.accounting?.items?.filter?.label || "Časová období", description: content?.admin?.help?.sections?.accounting?.items?.filter?.desc || "Data můžete exportovat za konkrétní měsíc, čtvrtletí, rok nebo si zvolit libovolné vlastní rozmezí." }
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 data-testid="admin-page-title" className="text-2xl sm:text-3xl font-black text-olive-dark uppercase italic tracking-tight font-display">{content?.admin?.help?.title || "Guide"}</h1>
                    <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-1">{content?.admin?.help?.description}</p>
                </div>
            </div>

            <div className="grid gap-12">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="p-3 sm:p-4 bg-olive-dark rounded-2xl sm:rounded-3xl shadow-xl shadow-olive-dark/10 group">
                                <section.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary transition-transform duration-500 group-hover:rotate-12" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-black text-olive-dark font-display uppercase italic tracking-tight">{section.title}</h2>
                                <p className="text-[10px] sm:text-xs text-olive-dark/60 font-black uppercase tracking-[0.2em]">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="grid gap-4">
                                <Accordion type="single" collapsible className="w-full">
                                    {section.items.map((item, id) => (
                                        <AccordionItem 
                                            key={id} 
                                            value={`item-${idx}-${id}`}
                                            className="border-none bg-white font-bold rounded-2xl sm:rounded-3xl mb-4 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                        >
                                            <AccordionTrigger className="px-6 sm:px-8 py-5 sm:py-6 hover:no-underline group">
                                                <span className="text-left font-black uppercase text-[10px] sm:text-xs tracking-widest text-olive-dark group-data-[state=open]:text-primary transition-colors">
                                                    {item.label}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-xs sm:text-sm text-olive-dark/80 leading-relaxed font-bold">
                                                {item.description}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {(section.image || section.path) && (
                                <div className="rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-olive-dark/5 p-4 sm:p-6 shadow-canvas border border-white relative group flex flex-col justify-center h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    {section.image && (
                                        <img 
                                            src={section.image} 
                                            alt={section.title} 
                                            className="w-full h-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative z-10 transition-all duration-1000 object-cover border border-white/20 mb-6 group-hover:scale-[1.02]"
                                        />
                                    )}
                                    {section.path && (
                                        <div className="text-center relative z-10 mt-auto">
                                            <Button 
                                                onClick={() => navigate(section.path!)}
                                                className="bg-lime hover:bg-lime/90 text-olive-dark font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl px-8 h-12 shadow-xl hover:-translate-y-1 transition-all gap-2"
                                            >
                                                Přejít do této sekce
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Tips */}
            <div className="p-8 sm:p-12 bg-olive-dark rounded-[3rem] text-white space-y-8 sm:space-y-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <HelpCircle className="w-24 h-24 sm:w-32 sm:h-32 rotate-12" />
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="p-3 sm:p-4 bg-primary/20 rounded-2xl backdrop-blur-md">
                        <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black font-display uppercase italic tracking-tight">{content?.admin?.help?.quickTips || "Quick Tips"}</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">{content?.admin?.help?.quickTipsDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {[
                        { icon: BarChart, title: content?.admin?.help?.tips?.stats?.title || "Monitoring", desc: content?.admin?.help?.tips?.stats?.desc },
                        { icon: Zap, title: content?.admin?.help?.tips?.fonts?.title || "Appearance", desc: content?.admin?.help?.tips?.fonts?.desc },
                        { icon: ShieldCheck, title: content?.admin?.help?.tips?.security?.title || "Safety", desc: content?.admin?.help?.tips?.security?.desc }
                    ].map((tip, idx) => (
                        <div key={idx} className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <tip.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-widest mb-2">{tip.title}</h4>
                            <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-widest">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
