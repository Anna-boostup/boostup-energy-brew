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
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    items: HelpItem[];
    image?: string;
    path?: string;
}

const COLORS = {
    primary: '#3a572c',
    text: '#1f2937',
    secondary: '#4b5563',
};

const AdminMockup = ({ id }: { id: string }) => {
    switch (id) {
        case "dashboard":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">test.drinkboostup.cz/admin</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-[#23311f] p-2 rounded-lg border border-[#32452c]">
                            <span className="font-bold text-[#b4cfa6]">VYPÍNAČ PRODEJE</span>
                            <div className="w-7 h-4 bg-lime rounded-full p-0.5 flex justify-end items-center cursor-pointer">
                                <div className="w-3 h-3 bg-[#1b2518] rounded-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] text-center">
                                <span className="block text-[7px] uppercase tracking-wider opacity-60">Tržby dnes</span>
                                <span className="text-xs font-black text-lime font-display">12 450 Kč</span>
                            </div>
                            <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] text-center">
                                <span className="block text-[7px] uppercase tracking-wider opacity-60">Objednávky</span>
                                <span className="text-xs font-black text-lime font-display">8</span>
                            </div>
                        </div>

                        <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] space-y-1">
                            <div className="flex justify-between text-[7px]">
                                <span>LEMON RUSH</span>
                                <span className="font-bold text-lime">80% (Skladem)</span>
                            </div>
                            <div className="w-full bg-[#1b2518] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lime h-full w-[80%]" />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "content":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Obsah webu (Hero)</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <span className="text-[7px] opacity-60 uppercase">Nadpis Část 1</span>
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] text-[#b4cfa6] truncate">
                                ENERGIE PRO TVŮJ
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[7px] opacity-60 uppercase">Nadpis Zvýrazněný</span>
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] text-lime font-bold truncate">
                                MOZEK ⚡
                            </div>
                        </div>
                        <div className="flex justify-between gap-2 pt-1">
                            <div className="bg-[#23311f] px-2 py-1.5 rounded border border-[#32452c] text-[7px] text-[#b4cfa6] flex-1 text-center">
                                Font: Poppins
                            </div>
                            <div className="bg-lime text-[#1b2518] font-bold px-2 py-1.5 rounded text-[7px] flex-1 text-center font-display uppercase tracking-widest">
                                Uložit změny
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "blog":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Blog Editor</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] text-lime font-bold">
                            Název: Proč kofein nestačí?
                        </div>
                        <div className="bg-[#23311f] p-2 rounded border border-[#32452c] text-[8px] h-12 overflow-hidden leading-relaxed opacity-80 font-bold">
                            <strong>Dnešní doba</strong> vyžaduje více než jen rychlé nakopnutí. Kofein zvyšuje bdělost, ale bez L-theaninu a adaptogenů...
                        </div>
                        <div className="flex justify-between items-center text-[7px]">
                            <span className="bg-[#32452c] text-lime px-1.5 py-0.5 rounded">Šablona: Modern</span>
                            <span className="text-[#b4cfa6]">Perex: 150/160 znaků</span>
                        </div>
                    </div>
                </div>
            );

        case "emails":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">E-mail: order_confirmation</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <span className="text-[7px] opacity-60">Předmět:</span>
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] text-[#b4cfa6] truncate">
                                ✅ Potvrzení objednávky {"{{orderNumber}}"} | BoostUp
                            </div>
                        </div>
                        <span className="block text-[7px] opacity-60">Dostupné značky:</span>
                        <div className="flex flex-wrap gap-1">
                            <span className="bg-[#32452c] text-lime px-1 py-0.5 rounded text-[6px]">{"{{customerName}}"}</span>
                            <span className="bg-[#32452c] text-lime px-1 py-0.5 rounded text-[6px]">{"{{total}}"} Kč</span>
                            <span className="bg-[#32452c] text-lime px-1 py-0.5 rounded text-[6px]">{"{{itemsHtml}}"}</span>
                        </div>
                        <div className="bg-lime text-[#1b2518] font-bold text-center py-1 rounded text-[7px] uppercase tracking-widest font-display">
                            Odeslat testovací e-mail
                        </div>
                    </div>
                </div>
            );

        case "messages":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Příchozí zprávy</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-[#23311f] p-1.5 rounded-lg border-l-2 border-orange border-y border-r border-[#32452c] space-y-1">
                            <div className="flex justify-between font-bold text-[#b4cfa6] text-[8px]">
                                <span>Zdeněk Dias</span>
                                <span className="text-orange text-[7px]">NOVÉ</span>
                            </div>
                            <p className="text-[7px] truncate">Mám dotaz ohledně doručení mix packu...</p>
                        </div>
                        <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] space-y-1">
                            <span className="text-[7px] opacity-50 block">Rychlá odpověď:</span>
                            <div className="text-[7px] opacity-80 italic">Ahoj Zdeňku, tvůj balík odesíláme zítra...</div>
                        </div>
                    </div>
                </div>
            );

        case "orders":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Objednávky</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#b4cfa6]">#BUP17760</span>
                                <span className="bg-[#32452c] text-lime px-1.5 py-0.5 rounded text-[6px] font-bold">ZAPLACENO</span>
                            </div>
                            <div className="text-[7px] space-y-0.5">
                                <div>Zákazník: Jan Novák</div>
                                <div>Doprava: Zásilkovna (Brno)</div>
                                <div className="text-lime font-bold">Celkem: 1 240 Kč</div>
                            </div>
                        </div>
                        <div className="bg-[#32452c] text-lime font-bold text-center py-1 rounded text-[7px] uppercase tracking-widest font-display">
                            Vytvořit štítek Packeta
                        </div>
                    </div>
                </div>
            );

        case "inventory":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Skladové zásoby</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2.5">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px]">
                                <span>Lemon Rush</span>
                                <span className="text-lime">120 ks</span>
                            </div>
                            <div className="w-full bg-[#1b2518] h-1 rounded-full overflow-hidden">
                                <div className="bg-lime h-full w-[80%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px]">
                                <span>Red Dragon</span>
                                <span className="text-orange">45 ks</span>
                            </div>
                            <div className="w-full bg-[#1b2518] h-1 rounded-full overflow-hidden">
                                <div className="bg-orange h-full w-[30%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px]">
                                <span>Silky Breeze</span>
                                <span className="text-red-400 font-bold">10 ks (Nízký stav!)</span>
                            </div>
                            <div className="w-full bg-[#1b2518] h-1 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[7%]" />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "manufacture":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Surovinový sklad</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                                <span className="block text-[6px] opacity-50">Plechovky</span>
                                <span className="font-bold text-[#b4cfa6]">12 500 ks</span>
                            </div>
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                                <span className="block text-[6px] opacity-50">Nápoj</span>
                                <span className="font-bold text-[#b4cfa6]">2 400 L</span>
                            </div>
                        </div>
                        <div className="bg-[#23311f] p-2 rounded border border-red-500/30 flex justify-between items-center">
                            <div>
                                <span className="block text-[6px] text-red-400">Hliníková víčka</span>
                                <span className="font-bold text-red-400">80 ks</span>
                            </div>
                            <span className="bg-red-950 text-red-400 font-bold border border-red-500/40 rounded px-1.5 py-0.5 text-[5px] animate-pulse">CRITICAL</span>
                        </div>
                    </div>
                </div>
            );

        case "pricing":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Globální cenotvorba</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                            <span>Balení 3 ks</span>
                            <span className="font-bold text-lime">237 Kč</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                            <span>Balení 12 ks</span>
                            <span className="font-bold text-lime">890 Kč</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                            <span>Balení 21 ks</span>
                            <span className="font-bold text-lime">1 450 Kč</span>
                        </div>
                    </div>
                </div>
            );

        case "promos":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Slevový kód</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="bg-[#23311f] p-3 rounded-xl border border-dashed border-[#4a5f42] text-center space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#32452c] text-lime px-2 py-0.5 rounded-bl text-[5px] font-bold">AKTIVNÍ</div>
                        <div className="text-xs font-black text-lime font-display tracking-widest pt-1">WELCOME10</div>
                        <p className="text-[7px] text-[#b4cfa6] opacity-80 font-bold">Sleva 10 % na první nákup</p>
                    </div>
                </div>
            );

        case "users":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Uživatelé a Role</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] flex justify-between items-center">
                            <div>
                                <span className="font-bold text-[#b4cfa6] block">Anna Palusková</span>
                                <span className="text-[6px] opacity-50">anna@example.com</span>
                            </div>
                            <span className="bg-[#32452c] text-lime px-1.5 py-0.5 rounded text-[6px] font-bold">ADMIN</span>
                        </div>
                        <div className="bg-[#23311f] p-2 rounded-lg border border-[#32452c] flex justify-between items-center">
                            <div>
                                <span className="font-bold text-[#b4cfa6] block">Marek Kovář</span>
                                <span className="text-[6px] opacity-50">marek@example.com</span>
                            </div>
                            <span className="bg-[#32452c] text-[#b4cfa6] px-1.5 py-0.5 rounded text-[6px]">ZÁKAZNÍK</span>
                        </div>
                    </div>
                </div>
            );

        case "accounting":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Export dat</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] flex justify-between text-[7px]">
                            <span>Období:</span>
                            <span className="font-bold text-[#b4cfa6]">Květen 2026</span>
                        </div>
                        <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c] flex justify-between text-[7px]">
                            <span>Formát:</span>
                            <span className="font-bold text-[#b4cfa6]">Pohoda / iDoklad (CSV)</span>
                        </div>
                        <div className="bg-lime text-[#1b2518] font-bold text-center py-1 rounded text-[7px] uppercase tracking-widest font-display">
                            Stáhnout export (CSV)
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
};

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
            id: 'dashboard',
            icon: Zap,
            title: content?.admin?.help?.sections?.dashboard?.title || "Přehled (Dashboard)",
            description: content?.admin?.help?.sections?.dashboard?.description || "Hlavní řídicí panel a stav prodeje",
            path: "/admin",
            items: [
                { label: content?.admin?.help?.sections?.dashboard?.items?.salesToggle?.label || "Vypínač prodeje", description: content?.admin?.help?.sections?.dashboard?.items?.salesToggle?.desc || "Hlavní přepínač pro okamžité pozastavení nebo spuštění možnosti nakupovat na e-shopu." },
                { label: content?.admin?.help?.sections?.dashboard?.items?.workflow?.label || "Pracovní tok (Workflow)", description: content?.admin?.help?.sections?.dashboard?.items?.workflow?.desc || "Rychlý přehled počtu nových, připravovaných, expedovaných a stornovaných objednávek." },
                { label: content?.admin?.help?.sections?.dashboard?.items?.stockQuick?.label || "Rychlý stav skladu", description: content?.admin?.help?.sections?.dashboard?.items?.stockQuick?.desc || "Okamžitý náhled na počet dostupných lahví jednotlivých příchutí přímo na hlavní ploše." }
            ]
        },
        {
            id: 'content',
            icon: Globe,
            title: content?.admin?.help?.sections?.content?.title || "Obsah webu",
            description: content?.admin?.help?.sections?.content?.description || "Správa textů, ingrediencí a domovské stránky",
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
            id: 'blog',
            icon: FileText,
            title: content?.admin?.help?.sections?.blog?.title || "Blog a články",
            description: content?.admin?.help?.sections?.blog?.description || "Publikační systém pro tvorbu obsahu",
            path: "/admin/blog",
            items: [
                { label: content?.admin?.help?.sections?.blog?.items?.editor?.label || "Vytvoření článku", description: content?.admin?.help?.sections?.blog?.items?.editor?.desc || "Použijte textový editor pro napsání formátovaného obsahu s možností vkládat obrázky." },
                { label: content?.admin?.help?.sections?.blog?.items?.templates?.label || "Designové šablony", description: content?.admin?.help?.sections?.blog?.items?.templates?.desc || "Při tvorbě článku můžete vybrat rozložení: Modern, Centered, nebo Minimal." },
                { label: content?.admin?.help?.sections?.blog?.items?.seo?.label || "SEO Metadata", description: content?.admin?.help?.sections?.blog?.items?.seo?.desc || "Před publikací vyplňte název, perex a klíčová slova pro lepší dohledatelnost na Googlu." }
            ]
        },
        {
            id: 'emails',
            icon: Send,
            title: content?.admin?.help?.sections?.emails?.title || "E-mailové šablony a kampaně",
            description: content?.admin?.help?.sections?.emails?.description || "Správa transakčních e-mailů a hromadného marketingu",
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
            id: 'messages',
            icon: Mail,
            title: content?.admin?.help?.sections?.messages?.title || "Příchozí zprávy",
            description: content?.admin?.help?.sections?.messages?.description || "Zpracování dotazů od zákazníků",
            path: "/admin/messages",
            items: [
                { label: content?.admin?.help?.sections?.messages?.items?.inbox?.label || "Nový dotaz", description: content?.admin?.help?.sections?.messages?.items?.inbox?.desc || "Všechny zprávy z kontaktního formuláře se řadí sem. Neoznačené zprávy ukáží upozornění." },
                { label: content?.admin?.help?.sections?.messages?.items?.reply?.label || "Odpovědi", description: content?.admin?.help?.sections?.messages?.items?.reply?.desc || "Ze sekce můžete rovnou odesílat odpovědi zákazníkům e-mailem přes integrovaný systém." }
            ]
        },
        {
            id: 'orders',
            icon: ShoppingCart,
            title: content?.admin?.help?.sections?.orders?.title || "Objednávky",
            description: content?.admin?.help?.sections?.orders?.description || "Zpracování nákupů zákazníků",
            path: "/admin/orders",
            items: [
                { label: content?.admin?.help?.sections?.orders?.items?.filtering?.label || "Filtrování", description: content?.admin?.help?.sections?.orders?.items?.filtering?.desc || "Rychlé řazení podle stavu (nové, odeslané atd.)." },
                { label: content?.admin?.help?.sections?.orders?.items?.detail?.label || "Detail objednávky", description: content?.admin?.help?.sections?.orders?.items?.detail?.desc || "Kompletní rozpis včetně fakturačních a dodacích údajů." },
                { label: content?.admin?.help?.sections?.orders?.items?.bulk?.label || "Hromadné akce", description: content?.admin?.help?.sections?.orders?.items?.bulk?.desc || "Hromadná stornování, změny stavů nebo hromadný tisk štítků Zásilkovny (A4 combined pro úsporu papíru)." },
                { label: content?.admin?.help?.sections?.orders?.items?.packeta?.label || "Zásilkovna (Packeta API)", description: content?.admin?.help?.sections?.orders?.items?.packeta?.desc || "Přímé vygenerování a tisk štítků. Tlačítko 'Synchronizovat' stáhne aktuální stavy přepravy." }
            ]
        },
        {
            id: 'inventory',
            icon: Package,
            title: content?.admin?.help?.sections?.inventory?.title || "Skladové zásoby",
            description: content?.admin?.help?.sections?.inventory?.description || "Evidování dostupnosti produktů",
            path: "/admin/inventory",
            items: [
                { label: content?.admin?.help?.sections?.inventory?.items?.add?.label || "Naskladnění", description: content?.admin?.help?.sections?.inventory?.items?.add?.desc || "Navýšení nebo snížení množství jednotlivých příchutí." },
                { label: content?.admin?.help?.sections?.inventory?.items?.minimum?.label || "Upozornění na limit", description: content?.admin?.help?.sections?.inventory?.items?.minimum?.desc || "Automatická indikace vyprodaných položek." },
                { label: content?.admin?.help?.sections?.inventory?.items?.history?.label || "Historie pohybů", description: content?.admin?.help?.sections?.inventory?.items?.history?.desc || "Kompletní log všech změn na skladě s označením uživatele, který změnu provedl, a poznámkou." }
            ]
        },
        {
            id: 'manufacture',
            icon: Factory,
            title: content?.admin?.help?.sections?.manufacture?.title || "Výroba",
            description: content?.admin?.help?.sections?.manufacture?.description || "Suroviny potřebné pro výrobu",
            path: "/admin/manufacture",
            items: [
                { label: content?.admin?.help?.sections?.manufacture?.items?.alert?.label || "Stav surovin", description: content?.admin?.help?.sections?.manufacture?.items?.alert?.desc || "Monitorování plechovek, víček, etiket a samotného nápoje." },
                { label: content?.admin?.help?.sections?.manufacture?.items?.history?.label || "Historie surovin", description: content?.admin?.help?.sections?.manufacture?.items?.history?.desc || "Kompletní log spotřeby a doskladňování výrobních materiálů s datem a poznámkou." }
            ]
        },
        {
            id: 'pricing',
            icon: BarChart,
            title: content?.admin?.help?.sections?.pricing?.title || "Cenotvorba a Statistiky",
            description: content?.admin?.help?.sections?.pricing?.description || "Finanční přehledy a nastavení cen",
            path: "/admin/pricing",
            items: [
                { label: content?.admin?.help?.sections?.pricing?.items?.global?.label || "Základní cena", description: content?.admin?.help?.sections?.pricing?.items?.global?.desc || "Centrální úprava prodejní ceny pro všechny produkty." },
                { label: content?.admin?.help?.sections?.pricing?.items?.stats?.label || "Grafy", description: content?.admin?.help?.sections?.pricing?.items?.stats?.desc || "Vizualizace celkových tržeb a úspěšnosti." }
            ]
        },
        {
            id: 'promos',
            icon: Gift,
            title: content?.admin?.help?.sections?.promos?.title || "Slevové kódy",
            description: content?.admin?.help?.sections?.promos?.description || "Marketingové a slevové kampaně",
            path: "/admin/promo-codes",
            items: [
                { label: content?.admin?.help?.sections?.promos?.items?.creation?.label || "Vytvoření kódu", description: content?.admin?.help?.sections?.promos?.items?.creation?.desc || "Nastavení unikátního textového kódu a výše slevy." },
                { label: content?.admin?.help?.sections?.promos?.items?.popup?.label || "Dárková brána", description: content?.admin?.help?.sections?.promos?.items?.popup?.desc || "Správa a nastavení kódu, který se zobrazí v uvítacím slevovém popup okně na e-shopu." },
                { label: content?.admin?.help?.sections?.promos?.items?.rules?.label || "Pravidla čerpání", description: content?.admin?.help?.sections?.promos?.items?.rules?.desc || "Limit použití kódu (např. platnost do data, aktivní/neaktivní)." }
            ]
        },
        {
            id: 'users',
            icon: Users,
            title: content?.admin?.help?.sections?.users?.title || "Uživatelé a Práva",
            description: content?.admin?.help?.sections?.users?.description || "Správa přístupů a zákazníků",
            path: "/admin/users",
            items: [
                { label: content?.admin?.help?.sections?.users?.items?.list?.label || "Seznam uživatelů", description: content?.admin?.help?.sections?.users?.items?.list?.desc || "Přehled všech registrovaných osob na platformě." },
                { label: content?.admin?.help?.sections?.users?.items?.roles?.label || "Změna role", description: content?.admin?.help?.sections?.users?.items?.roles?.desc || "Možnost přidělit jinému uživateli práva typu Admin, čímž získá přístup k tomuto rozhraní." },
                { label: content?.admin?.help?.sections?.users?.items?.history?.label || "Historie nákupů", description: content?.admin?.help?.sections?.users?.items?.history?.desc || "Pohled na minulé transakce konkrétní osoby." }
            ]
        },
        {
            id: 'accounting',
            icon: Download,
            title: content?.admin?.help?.sections?.accounting?.title || "Účetnictví a Exporty",
            description: content?.admin?.help?.sections?.accounting?.description || "Generování podkladů pro účetní systémy",
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
                                    {section.id && (
                                        <AdminMockup id={section.id} />
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
