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

        case "insights":
            return (
                <div className="w-full bg-[#1b2518] rounded-2xl p-4 border border-[#303f2a] shadow-inner font-mono text-[9px] text-[#8ea682] mb-6">
                    <div className="flex items-center justify-between border-b border-[#303f2a] pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                            <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[8px] opacity-60">Insights Center</span>
                        <span className="w-4" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                                <span className="block text-[6px] opacity-50">NÁVŠTĚVY</span>
                                <span className="font-bold text-[#b4cfa6]">1 420</span>
                            </div>
                            <div className="bg-[#23311f] p-1.5 rounded border border-[#32452c]">
                                <span className="block text-[6px] opacity-50">KONVERZE</span>
                                <span className="font-bold text-lime">2.8 %</span>
                            </div>
                        </div>
                        <div className="bg-[#23311f] p-2 rounded border border-[#32452c] space-y-1">
                            <span className="block text-[6px] opacity-50">AKTIVITA:</span>
                            <div className="flex justify-between text-[7px] text-[#b4cfa6]">
                                <span>17:28:10</span>
                                <span className="text-lime">Zobrazení: Pokladna</span>
                                <span>Chrome (macOS)</span>
                            </div>
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
    const [viewMode, setViewMode] = React.useState<Record<string, 'mockup' | 'screenshot'>>({});

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
            title: "Přehled (Dashboard)",
            description: "Hlavní řídicí panel e-shopu, stav prodeje a přehledy",
            path: "/admin",
            items: [
                { label: "Vypínač prodeje (Emergency Stop)", description: "Jak to funguje:\nHlavní přepínač v horní části plochy. Pokud jej přepnete do stavu VYPNUTO, e-shop okamžitě přestane přijímat objednávky. V košíku a na pokladně se zákazníkům zobrazí výrazné červené upozornění a tlačítka k dokončení platby budou zablokována.\n\nPoužití:\nVyužijte při nečekaném výpadku dodávek, inventuře nebo technické údržbě." },
                { label: "Pracovní tok objednávek (Workflow)", description: "Jak to funguje:\nVizualizace stavů objednávek v reálném čase. Ukazuje počty nových, rozpracovaných, odeslaných a stornovaných objednávek.\n\nRychlá akce:\nKliknutím na jakékoli číslo v tomto panelu budete ihned přesměrováni do sekce Objednávky s automaticky nastaveným filtrem pro daný stav (např. kliknutím na 'Nové' uvidíte pouze nevyřízené objednávky)." },
                { label: "Rychlý stav skladu", description: "Jak to funguje:\nOkamžitý přehled stavu zásob hlavních produktů (lahví) přímo na hlavní ploše.\n\nIndikátory:\nZelený pruh značí bezpečný stav, oranžový varuje před poklesem a červený s textem 'Nízký stav' signalizuje nutnost okamžitého naskladnění." },
                { 
                    label: content?.lang === 'en' ? "Mobile Installation & Notifications Setup" : "Instalace na mobil a nastavení oznámení", 
                    description: content?.lang === 'en' 
                        ? "Mobile App Installation:\n1. **iOS (iPhone/iPad):** Open the e-shop in **Safari**. Tap the **Share** icon (square with an up arrow) in the bottom bar and choose **Add to Home Screen**.\n2. **Android:** Open the e-shop in **Chrome**, tap the three dots icon in the top right corner and choose **Install App** or **Add to Home Screen**.\n\nEnabling notifications on your phone:\n1. Launch the **BoostUp** app from your home screen and log in as administrator.\n2. Přejděte do sekce **Objednávky** or **Příchozí zprávy**.\n3. Click the flashing orange **Allow notifications** button (with a bell icon) in the header.\n4. Approve the system permission prompt by tapping **Allow**.\n\nHow it works:\nThe app will send you native push notifications with a sound whenever a new order or customer message arrives, even when the app is closed or the device is locked."
                        : "Postup instalace mobilní aplikace:\n1. **iOS (iPhone/iPad):** Otevřete e-shop v prohlížeči **Safari**. Klepněte na ikonu **Sdílet** (čtvereček s šipkou nahoru) v dolní liště a zvolte možnost **Přidat na plochu**.\n2. **Android:** Otevřete e-shop v prohlížeči **Chrome**, klepněte na ikonu tří teček v pravém horním rohu a zvolte možnost **Instalovat aplikaci** nebo **Přidat na plochu**.\n\nAktivace oznámení na telefonu:\n1. Spusťte aplikaci **BoostUp** z plochy vašeho telefonu a přihlaste se jako administrátor.\n2. Přejděte do sekce **Objednávky** nebo **Příchozí zprávy**.\n3. V horní části obrazovky klikněte na blikající oranžové tlačítko **Povolit oznámení** se symbolem zvonečku.\n4. V zobrazeném systémovém okně telefonu potvrďte volbu **Povolit** (Allow).\n\nJak to funguje:\nTelefon vás okamžitě upozorní zvukem a vyskakovací zprávou (Push notifikací) na každou novou objednávku nebo dotaz zákazníka, i když nemáte aplikaci zrovna otevřenou."
                }
            ]
        },
        {
            id: 'content',
            icon: Globe,
            title: "Obsah webu",
            description: "Správa textů, ingrediencí, konceptů a domovské stránky",
            path: "/admin/content",
            items: [
                { label: "Úprava hlavní sekce (Hero Banner)", description: "Postup:\nV záložce 'Obsah webu' najdete formulář pro úpravu úvodního banneru. Můžete přepsat hlavní nadpis (rozdělený na Část 1 a Část 2), zvýrazněný text (např. 'MOZEK ⚡') a podnadpisy.\n\nUložení:\nKaždá změna se projeví okamžitě po kliknutí na 'Uložit změny'." },
                { label: "Správa 3B Konceptu (Brain, Body, Balance)", description: "Postup:\nUmožňuje editovat textový obsah tří hlavních pilířů naší filozofie. Upravovat můžete jak texty na samotných kartách na úvodní straně, tak i detailní informace, které se zobrazí v popup okně po kliknutí zákazníka na tlačítko 'Zjistit více'." },
                { label: "Editace ingrediencí a složení", description: "Postup:\nZde spravujete seznam funkčních složek BoostUp nápoje. U každé ingredience (např. L-theanin, kofein, adaptogeny) můžete upravit název, množství na plechovku, doprovodnou ikonu a podrobný vědecky podložený popis jejích účinků." },
                { label: "Správa příchutí a produktů", description: "Postup:\nUmožňuje přizpůsobit vzhled produktových karet pro jednotlivé příchutě (Lemon Blast, Red Dragon, Silky Breeze). Můžete nastavit barvu pozadí karty (pomocí hex kódu), upravit název, popisek chuti a energetického profilu." },
                { label: "Nastavení vyskakovacího slevového popupu", description: "Postup:\nGlobální nastavení chování webu. Můžete zde aktivovat nebo deaktivovat uvítací popup okno se slevou pro nové návštěvníky, změnit text slevy a nastavit zpoždění (v sekundách), po kterém se okno uživateli zobrazí." }
            ]
        },
        {
            id: 'blog',
            icon: FileText,
            title: "Blog a články",
            description: "Publikační systém, bohatý textový editor a SEO nastavení",
            path: "/admin/blog",
            items: [
                { label: "Vytvoření a publikace nového článku", description: "Postup:\n1. Přejděte do sekce 'Blog' a klikněte na '+ Nový článek'.\n2. Zadejte název (systém automaticky vygeneruje čisté URL neboli 'slug').\n3. Napište obsah v bohatém editoru (podporuje formátování textu, nadpisy, seznamy a vkládání obrázků).\n4. Zvolte stav (Koncept pro rozepsané / Zveřejněno pro okamžité publikování) a uložte." },
                { label: "Výběr designové šablony (Layout)", description: "Postup:\nU každého článku můžete určit vizuální styl jeho zobrazení zákazníkům. Vyberte:\n- **Modern** (velký úvodní obrázek, široký sloupec textu)\n- **Centered** (nadpis a text vycentrované na střed)\n- **Minimal** (čistý text bez úvodního obrázku pro technická oznámení)" },
                { label: "SEO optimalizace článku", description: "Postup:\nPro zvýšení návštěvnosti z vyhledávačů vyplňte SEO parametry článku:\n- **Meta titulek**: Titulek pro vyhledávače (doporučeno do 60 znaků).\n- **Meta popis (Perex)**: Krátký shrnující text (doporučeno do 160 znaků), který se zobrazí ve výsledcích vyhledávání.\n- **Klíčová slova**: Témata článku oddělená čárkami." }
            ]
        },
        {
            id: 'emails',
            icon: Send,
            title: "E-mailové šablony a kampaně",
            description: "Transakční e-maily, dynamické proměnné a rozesílka",
            path: "/admin/emails",
            items: [
                { label: "Úprava transakčních e-mailů", description: "Postup:\nPřejděte do sekce E-maily, kde najdete seznam systémových zpráv (potvrzení objednávky, potvrzení platby, expedice). Kliknutím na šablonu otevřete editor, kde můžete přepsat předmět a tělo e-mailu. Tyto e-maily odesílá systém automaticky." },
                { label: "Použití dynamických značek (Placeholders)", description: "Postup:\nDo šablon můžete vkládat značky v dvojitých složených závorkách, které systém při odeslání nahradí skutečnými údaji o zákazníkovi a nákupu:\n- `{{customerName}}` - Celé jméno zákazníka\n- `{{orderNumber}}` - Unikátní číslo objednávky\n- `{{total}}` - Celková cena v Kč\n- `{{itemsHtml}}` - Přehledná tabulka nakoupených položek s cenami." },
                { label: "Master Šablona (Layout)", description: "Postup:\nPřepínač 'Zabalit do Master šablony' automaticky obalí váš upravovaný text do značkového BoostUp HTML layoutu, který obsahuje oficiální hlavičku s logem a patičku s kontaktními údaji a povinným odkazem pro odhlášení z newsletteru." },
                { label: "Odesílání newsletter kampaní", description: "Postup:\n1. Přejděte na záložku 'Rozesílka'.\n2. Vyberte připravenou marketingovou šablonu.\n3. Uvidíte celkový počet aktivních odběratelů.\n4. Kliknutím na 'Spustit kampaň' systém začne rozesílat e-maily na pozadí v bezpečné rychlosti, abychom nespadli do spamu." },
                { label: "Odeslání zkušebního e-mailu", description: "Postup:\nPřed uložením změn nebo spuštěním hromadné kampaně klikněte na 'Odeslat testovací e-mail'. Zadejte svůj administrátorský e-mail a ověřte si, že e-mail vypadá v doručené poště správně." }
            ]
        },
        {
            id: 'messages',
            icon: Mail,
            title: "Příchozí zprávy",
            description: "Správa zákaznických dotazů z kontaktního formuláře",
            path: "/admin/messages",
            items: [
                { label: "Zpracování a správa příchozích zpráv", description: "Postup:\nVšechny zprávy odeslané z kontaktního formuláře na e-shopu se řadí do této schránky. Nepřečtené zprávy svítí oranžově s označením 'NOVÉ'. U ikony zpráv v levém menu se také zobrazuje červené číslo s počtem nevyřízených dotazů." },
                { label: "Odpovídání zákazníkům přímo z administrace", description: "Postup:\nKliknutím na zprávu otevřete její detail. Přímo z administrace můžete napsat odpověď do textového pole a kliknout na 'Odeslat odpověď'. Systém odešle e-mail zákazníkovi pod hlavičkou e-shopu a zprávu automaticky označí jako vyřízenou." }
            ]
        },
        {
            id: 'orders',
            icon: ShoppingCart,
            title: "Objednávky",
            description: "Kompletní správa objednávek, vygenerování štítků a manuální nákupy",
            path: "/admin/orders",
            items: [
                { label: "Filtrování, vyhledávání a detaily", description: "Postup:\nV tabulce můžete vyhledávat objednávky podle jména, e-mailu nebo čísla objednávky. Pomocí záložek v horní části tabulky můžete filtrovat objednávky podle jejich aktuálního stavu (Nové, Zaplacené, Zpracovávané, Odeslané, Stornované)." },
                { label: "Změna stavu objednávky", description: "Postup:\nKliknutím na řádek objednávky otevřete pravý panel s jejím detailem. Zde můžete v pravém horním rohu kliknout na rozbalovací menu a změnit stav (např. z 'paid' na 'shipped' po odeslání balíku). Změna stavu může automaticky odeslat informační e-mail zákazníkovi." },
                { label: "Vytvoření ruční (manuální) objednávky", description: "Postup:\n1. Klikněte na '+ Nová objednávka'.\n2. Vyplňte dodací a fakturační údaje zákazníka.\n3. V tabulce položek přidejte požadované produkty a jejich množství.\n4. Zvolte stav platby a objednávku uložte.\n\nVyužití:\nTelefonické objednávky nebo B2B prodeje." },
                { label: "Hromadné zpracování objednávek", description: "Postup:\nZaškrtnutím políček u více objednávek v levém sloupci aktivujete hromadné menu. Můžete najednou stornovat více objednávek, změnit jim stav nebo vygenerovat hromadný tisk štítků (tiskne více štítků na jeden arch A4 pro úsporu papíru)." },
                { label: "Generování štítků Zásilkovny (Packeta API)", description: "Postup:\nU objednávek se zvoleným doručením na výdejní místo Zásilkovny se v detailu zobrazí tlačítko 'Odeslat do Zásilkovny'. Kliknutím odešlete data balíku na servery Zásilkovny, která vám vrátí trasovací číslo. Následně kliknutím na 'Vytisknout štítek' stáhnete PDF k tisku." }
            ]
        },
        {
            id: 'inventory',
            icon: Package,
            title: "Skladové zásoby",
            description: "Správa stavu produktů, historie pohybů a hlídání limitů",
            path: "/admin/inventory",
            items: [
                { label: "Manuální naskladnění a odpisy", description: "Postup:\n1. V seznamu produktů najděte požadovanou položku a klikněte na 'Upravit stav'.\n2. Zadejte množství (např. 120 pro přičtení nového závozu, nebo -5 pro odpis poškozených kusů).\n3. Vyplňte povinnou poznámku zdůvodňující pohyb (např. 'Závoz z výroby').\n4. Klikněte na 'Uložit'." },
                { label: "Hlídání minimálního limitu zásob", description: "Postup:\nV detailu produktu můžete nastavit hodnotu 'Varovný limit'. Pokud fyzický stav skladu klesne pod tuto hodnotu, produkt se v administraci označí červeným vykřičníkem a systém zobrazí globální varovnou ikonu. To vás včas upozorní na nutnost zadat novou výrobu." },
                { label: "Podrobná historie skladových pohybů", description: "Postup:\nKaždý pohyb (nákup zákazníkem, manuální naskladnění, systémový odpis) se zapisuje do auditního logu v dolní části stránky. V logu vidíte přesné datum, SKU, typ pohybu, změnu množství, poznámku a e-mail administrátora, který pohyb provedl." }
            ]
        },
        {
            id: 'manufacture',
            icon: Factory,
            title: "Výroba",
            description: "Surovinový sklad plechovek, víček, etiket a tekutiny",
            path: "/admin/manufacture",
            items: [
                { label: "Správa a naskladnění výrobních surovin", description: "Postup:\nV sekci Výroba spravujete stav základních materiálů: prázdné plechovky, hliníková víčka, etikety příchutí, papírové krabice a namíchaný nápoj (v litrech). Naskladnění a odpisy surovin probíhají stejně jako u produktů zadáním množství a poznámky." },
                { label: "Historie a audit spotřeby surovin", description: "Postup:\nKaždé doskladnění surovin nebo jejich odpis (např. spotřeba při plnění plechovek) je detailně logováno s datem, množstvím, poznámkou a autorem záznamu pro stoprocentní přehled o výrobních nákladech." }
            ]
        },
        {
            id: 'pricing',
            icon: BarChart,
            title: "Cenotvorba",
            description: "Nastavení cen produktů a balení pro celý e-shop",
            path: "/admin/pricing",
            items: [
                { label: "Globální nastavení cen", description: "Postup:\nUmožňuje centrálně měnit prodejní ceny produktů a výhodných balení (3-pack, 12-pack, 21-pack). Změněná cena se okamžitě přepíše na e-shopu, v nákupním košíku i v platebním rozhraní Stripe. Ceny zadávejte jako koncové ceny pro zákazníka (včetně DPH)." },
                { label: "Finanční přehledy prodejů", description: "Postup:\nV dolní části cenotvorby naleznete statistické grafy ukazující celkový objem tržeb v čase, průměrnou hodnotu objednávky a podíl jednotlivých příchutí na celkových prodejích." }
            ]
        },
        {
            id: 'promos',
            icon: Gift,
            title: "Slevové kódy",
            description: "Tvorba slevových kódů, pravidla platnosti a limity",
            path: "/admin/promo-codes",
            items: [
                { label: "Vytvoření nového slevového kódu", description: "Postup:\n1. Klikněte na '+ Nový slevový kód'.\n2. Zadejte text kódu (např. 'BOOST20' - doporučujeme velká písmena bez diakritiky).\n3. Nastavte výši slevy v procentech (např. 20).\n4. Zvolte stav (Aktivní/Neaktivní) a uložte. Kód mohou zákazníci ihned uplatnit v košíku." },
                { label: "Nastavení uvítací dárkové brány", description: "Postup:\nSpráva speciálního slevového kódu, který se automaticky nabídne novým návštěvníkům webu ve vyskakovacím okně po načtení stránky. Můžete určit, který kód z databáze se v popupu zobrazí a upravit jeho text." },
                { label: "Omezení a pravidla platnosti kódů", description: "Postup:\nU každého kódu můžete definovat omezení, například platnost od-do (pro časově omezené akce) nebo minimální hodnotu objednávky, od které lze kód uplatnit (např. sleva platí pouze při nákupu nad 1000 Kč)." }
            ]
        },
        {
            id: 'users',
            icon: Users,
            title: "Uživatelé a Práva",
            description: "Správa registrovaných uživatelů, zákazníků a admin práv",
            path: "/admin/users",
            items: [
                { label: "Seznam a vyhledávání registrovaných osob", description: "Postup:\nPřehledná tabulka všech uživatelů. Můžete vyhledávat podle jména, e-mailu nebo řadit podle data registrace. Zobrazuje se také informace, zda má uživatel roli Admin (přístup do administrace) nebo Zákazník." },
                { label: "Přiřazení a správa administrátorských práv", description: "Postup:\nChcete-li udělit přístup do této administrace kolegovi:\n1. Vyhledejte ho v seznamu.\n2. V pravém sloupci klikněte na 'Změnit roli'.\n3. Zvolte možnost 'Admin' a potvrďte. Uživatel se při příštím přihlášení dostane do administrace." },
                { label: "Detail zákazníka a nákupní historie", description: "Postup:\nKliknutím na jméno uživatele otevřete jeho osobní kartu. Zde vidíte celkový počet jeho objednávek, celkovou utracenou částku, dodací adresu a seznam všech zakoupených položek pro individuální zákaznickou péči." }
            ]
        },
        {
            id: 'accounting',
            icon: Download,
            title: "Účetnictví a Exporty",
            description: "Podklady pro účetní systémy a automatické měsíční exporty",
            path: "/admin/orders",
            items: [
                { label: "Manuální export objednávek do CSV (Pohoda / iDoklad)", description: "Postup:\nV horní části tabulky Objednávek najdete tlačítko 'Export dat'. Zde zvolte časové rozmezí (např. minulý měsíc) a klikněte na 'Stáhnout CSV'. Tento soubor splňuje standardy pro přímý import do účetních programů." },
                { label: "Automatický měsíční report pro účetní", description: "Postup:\nV nastavení exportu můžete zadat e-mail vašeho účetního oddělení. Každý první den v měsíci systém na tuto adresu automaticky odešle kompletní přehled prodejů a CSV soubor za předchozí kalendářní měsíc." },
                { label: "Časové filtry pro daňová přiznání", description: "Postup:\nExporty dat lze filtrovat za jakékoli vlastní období (měsíc, kvartál, rok), což usnadňuje přípravu podkladů pro přiznání k DPH nebo roční účetní uzávěrku." }
            ]
        },
        {
            id: 'insights',
            icon: BarChart,
            title: "Statistiky (Insights Center)",
            description: "Sledování návštěvnosti, konverzní trychtýř a live event stream",
            path: "/admin/insights",
            items: [
                { label: "Sledování trendů návštěvnosti", description: "Postup:\nHorní graf zobrazuje denní počty zobrazení stránek a unikátních návštěvníků v 14-denním okně. Pomáhá měřit okamžitou úspěšnost marketingových kampaní a sledovat dny s největší aktivitou." },
                { label: "Analýza konverzního trychtýře (Funnel)", description: "Postup:\nVizualizace cesty zákazníka od první návštěvy až po dokončení platby. Ukazuje poměr uživatelů, kteří vstoupili na web, přešli na pokladnu a úspěšně nakoupili, což vám umožní odhalit, kde zákazníci nejvíce odcházejí." },
                { label: "Živý proud událostí (Live Activity Log)", description: "Postup:\nV reálném čase aktualizovaný výpis všech akcí na webu. Uvidíte přesný čas zobrazení stránky, cestu (např. `/checkout`), typ zařízení (mobil/desktop), použitý operační systém, prohlížeč a zdroj návštěvy (např. Google, Facebook)." }
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 data-testid="admin-page-title" className="text-2xl sm:text-3xl font-black text-olive-dark uppercase italic tracking-tight font-display">{content?.admin?.help?.title || "Administrátorský Manuál"}</h1>
                    <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-1">{content?.admin?.help?.description || "Podrobný průvodce a postupy pro správu e-shopu"}</p>
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
                                            <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-xs sm:text-sm text-olive-dark/80 leading-relaxed font-bold whitespace-pre-line">
                                                {item.description}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {section.id && (
                                <div className="rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-olive-dark/5 p-4 sm:p-6 shadow-canvas border border-white relative group flex flex-col justify-center h-full min-h-[400px]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    
                                    {/* Toggle buttons to switch view modes */}
                                    <div className="flex justify-end mb-4 relative z-10">
                                        <div className="flex bg-black/5 p-1 rounded-xl">
                                            <button
                                                onClick={() => setViewMode(prev => ({ ...prev, [section.id]: 'mockup' }))}
                                                className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                    (viewMode[section.id] || 'mockup') === 'mockup'
                                                        ? 'bg-olive-dark text-white shadow-md'
                                                        : 'text-olive-dark/50 hover:text-olive-dark'
                                                }`}
                                            >
                                                Schéma
                                            </button>
                                            <button
                                                onClick={() => setViewMode(prev => ({ ...prev, [section.id]: 'screenshot' }))}
                                                className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                    viewMode[section.id] === 'screenshot'
                                                        ? 'bg-olive-dark text-white shadow-md'
                                                        : 'text-olive-dark/50 hover:text-olive-dark'
                                                }`}
                                            >
                                                Snímek
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        {(viewMode[section.id] || 'mockup') === 'mockup' ? (
                                            <AdminMockup id={section.id} />
                                        ) : (
                                            <div className="relative aspect-video rounded-xl overflow-hidden border border-olive-dark/15 shadow-inner bg-white flex items-center justify-center">
                                                <img 
                                                    src={`/admin-guide/${section.id === 'content' ? 'content-management' : section.id === 'promos' ? 'promo-codes' : section.id === 'users' ? 'users' : section.id}.png`} 
                                                    alt={section.title} 
                                                    className="w-full h-full object-cover object-top"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        setViewMode(prev => ({ ...prev, [section.id]: 'mockup' }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {section.path && (
                                        <div className="text-center relative z-10 mt-6">
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
                        <h3 className="text-xl sm:text-2xl font-black font-display uppercase italic tracking-tight">{content?.admin?.help?.quickTips || "Rychlé tipy"}</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">{content?.admin?.help?.quickTipsDesc || "Jak efektivně pracovat s administrací"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {[
                        { icon: BarChart, title: content?.admin?.help?.tips?.stats?.title || "Monitoring", desc: content?.admin?.help?.tips?.stats?.desc || "Sledujte pravidelně konverzní poměr v sekci Statistiky. Pokud klesne pod 1.5 %, zkontrolujte nastavení pokladny." },
                        { icon: Zap, title: content?.admin?.help?.tips?.fonts?.title || "Rychlá navigace", desc: content?.admin?.help?.tips?.fonts?.desc || "Chcete-li předejít chybám, vždy po aktualizaci textů nebo cen navštivte hlavní web v anonymním okně." },
                        { icon: ShieldCheck, title: content?.admin?.help?.tips?.security?.title || "Bezpečnost", desc: content?.admin?.help?.tips?.security?.desc || "Administrátorská práva udělujte pouze důvěryhodným osobám. Změnu rolí může provádět pouze hlavní Admin." }
                    ].map((tip, idx) => (
                        <div key={idx} className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <tip.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-widest mb-2">{tip.title}</h4>
                            <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
