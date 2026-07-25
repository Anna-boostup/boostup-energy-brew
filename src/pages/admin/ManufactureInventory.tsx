import { useState } from "react";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { useInventory, PackagingRule } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Plus, History, Edit, Beaker, Bell, AlertTriangle, TrendingDown, Box, Trash2 } from "lucide-react";
import { ManufactureRestockDialog } from "@/components/admin/ManufactureRestockDialog";
import { ManufactureHistoryDialog } from "@/components/admin/ManufactureHistoryDialog";
import { ManufactureEditDialog } from "@/components/admin/ManufactureEditDialog";
import { PackagingRuleDialog } from "@/components/admin/PackagingRuleDialog";
import { RecipeRuleDialog } from "@/components/admin/RecipeRuleDialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContent } from "@/context/ContentContext";
import { FLAVORS } from "@/config/product-data";

// Zobrazení základu receptury (na lahvičku / na várku) + přepočet na 1 ks
const recipeBasisLabel = (rule: any) =>
    rule?.input_basis === 'batch' && rule?.batch_bottles
        ? `na várku (${rule.batch_bottles} ks)`
        : 'na 1 lahvičku';
const recipePerBottle = (rule: any) =>
    rule?.input_basis === 'batch' && rule?.batch_bottles > 0
        ? Number(rule.quantity_required) / rule.batch_bottles
        : Number(rule.quantity_required);

const ManufactureInventory = () => {
    const { content } = useContent();
    const { materials, loading } = useManufacture();
    const { packagingRules, deletePackagingRule, recipeRules, deleteRecipeRule } = useInventory();

    const [activeTab, setActiveTab] = useState<string>("materials");

    // Manufacture Dialog States
    const [restockId, setRestockId] = useState<string | null>(null);
    const [historyId, setHistoryId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Packaging Rules Dialog States
    const [ruleToEdit, setRuleToEdit] = useState<PackagingRule | null>(null);
    const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);

    // Recipe Rules Dialog States
    const [recipeToEdit, setRecipeToEdit] = useState<any | null>(null);
    const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);

    if (loading) return <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <div data-testid="admin-loader" className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
            <p className="text-olive-dark font-black uppercase text-xs tracking-widest">{content?.admin?.inventory?.manufacture?.loading || "Loading..."}</p>
        </div>
    </div>;

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] sm:rounded-[2.2rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Beaker className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <h1 data-testid="admin-page-title" className="text-3xl sm:text-5xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">
                            {activeTab === "materials" 
                                ? (content?.admin?.inventory?.manufacture?.title || "Staff Inventory")
                                : activeTab === "rules" 
                                ? "Pravidla obalů"
                                : "Receptury výroby"
                            }
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-olive-dark/70 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px]">
                                {activeTab === "materials"
                                    ? content?.admin?.inventory?.manufacture?.subtitle
                                    : activeTab === "rules"
                                    ? "Správa automatického odpisu krabic při objednávkách"
                                    : "Správa automatického odpisu surovin při naskladnění hotového produktu"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {activeTab === "materials" ? (
                    <Button 
                        onClick={() => setIsAddOpen(true)} 
                        className="h-14 sm:h-16 px-8 sm:px-10 bg-olive-dark hover:bg-black text-white gap-4 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.05] active:scale-95 group w-full sm:w-auto"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        {content?.admin?.inventory?.manufacture?.newMaterial || "Nový materiál"}
                    </Button>
                ) : activeTab === "rules" ? (
                    <Button 
                        onClick={() => {
                            setRuleToEdit(null);
                            setIsRuleDialogOpen(true);
                        }} 
                        className="h-14 sm:h-16 px-8 sm:px-10 bg-olive-dark hover:bg-black text-white gap-4 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.05] active:scale-95 group w-full sm:w-auto"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        Nové pravidlo
                    </Button>
                ) : (
                    <Button 
                        onClick={() => {
                            setRecipeToEdit(null);
                            setIsRecipeDialogOpen(true);
                        }} 
                        className="h-14 sm:h-16 px-8 sm:px-10 bg-olive-dark hover:bg-black text-white gap-4 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.05] active:scale-95 group w-full sm:w-auto"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        Nová receptura
                    </Button>
                )}
            </div>

            {/* Tabs & Content Area */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
                <TabsList className="bg-olive-dark/5 p-1.5 rounded-2xl inline-flex border border-olive-dark/5 shadow-inner">
                    <TabsTrigger 
                        value="materials" 
                        className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2"
                    >
                        <Beaker className="w-3.5 h-3.5" />
                        Suroviny a materiály
                    </TabsTrigger>
                    <TabsTrigger 
                        value="rules" 
                        className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2"
                    >
                        <Box className="w-3.5 h-3.5" />
                        Pravidla obalů
                    </TabsTrigger>
                    <TabsTrigger 
                        value="recipes" 
                        className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2"
                    >
                        <Beaker className="w-3.5 h-3.5" />
                        Receptury
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: Suroviny a materiály */}
                <TabsContent value="materials" className="space-y-6 mt-0 border-none p-0 outline-none">
                    <div className="grid grid-cols-1 gap-6">
                        {materials.length === 0 ? (
                            <div className="glass-card rounded-[3.5rem] p-24 text-center space-y-8">
                                <div className="w-24 h-24 bg-olive-dark/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <Beaker className="w-10 h-10 text-olive-dark/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-olive-dark font-display uppercase italic">{content?.admin?.inventory?.manufacture?.emptyTitle || "No materials"}</p>
                                    <p className="text-[10px] text-olive-dark/70 font-black uppercase tracking-widest">{content?.admin?.inventory?.manufacture?.emptyDesc}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
                                {/* Desktop View Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-olive/10 bg-olive-dark">
                                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{content?.admin?.inventory?.manufacture?.table?.id || "ID"}</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{content?.admin?.inventory?.manufacture?.table?.status || "Status"}</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{content?.admin?.inventory?.manufacture?.table?.limits || "Limits"}</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{content?.promoCodes?.listSection?.table?.actions || "Actions"}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-olive/5">
                                            {materials.map((m) => {
                                                const isCritical = m.quantity <= m.min_quantity;
                                                const isWarning = !isCritical && m.warning_quantity > 0 && m.quantity <= m.warning_quantity;
                                                
                                                return (
                                                    <tr key={m.id} className="hover:bg-white/40 transition-colors group">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg ${isCritical ? 'bg-red-50 text-red-600' : 'bg-olive-dark text-white'}`}>
                                                                    <Beaker className="w-6 h-6" />
                                                                    {m.notifications_enabled && (
                                                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                                                            <Bell className={`w-3 h-3 ${isCritical ? 'text-red-500 animate-bounce' : 'text-olive-dark'}`} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="font-display font-black text-xl text-olive-dark uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{m.name}</p>
                                                                    <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest leading-none">ID {m.id.split('-')[0]}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="space-y-1">
                                                                <div className={`text-3xl font-black font-display italic leading-none ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark'}`}>
                                                                    {m.quantity} <span className="text-sm font-black uppercase text-olive-dark/50">{m.unit}</span>
                                                                </div>
                                                                <Badge variant="outline" className={`border-none px-0 text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark/70'}`}>
                                                                    {isCritical ? content?.admin?.inventory?.manufacture?.status?.critical : isWarning ? content?.admin?.inventory?.manufacture?.status?.warning : content?.admin?.inventory?.manufacture?.status?.ok}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex flex-col items-end gap-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-olive-dark/60">{content?.admin?.inventory?.manufacture?.limitLabel || "Min"}</span>
                                                                    <span className="text-xs font-black text-olive-dark">{m.min_quantity} {m.unit}</span>
                                                                </div>
                                                                {m.warning_quantity > 0 && (
                                                                    <div className="flex items-center gap-2">
                                                                         <span className="text-[9px] font-black uppercase tracking-widest text-olive-dark/60">{content?.admin?.inventory?.manufacture?.warnAtLabel || "Warn"}</span>
                                                                        <span className="text-xs font-black text-orange-500">{m.warning_quantity} {m.unit}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex justify-end gap-3 transition-all duration-500">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-white transition-all"
                                                                    onClick={() => setHistoryId(m.id)}
                                                                >
                                                                    <History className="h-5 w-5" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-white transition-all"
                                                                    onClick={() => setEditId(m.id)}
                                                                >
                                                                    <Edit className="h-5 w-5" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    className="h-12 w-12 rounded-2xl bg-lime text-olive-dark hover:bg-olive-dark hover:text-white shadow-lg shadow-lime/20"
                                                                    onClick={() => setRestockId(m.id)}
                                                                >
                                                                    <Plus className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View Card Grid */}
                                <div className="md:hidden space-y-6">
                                    {materials.map((m) => {
                                        const isCritical = m.quantity <= m.min_quantity;
                                        const isWarning = !isCritical && m.warning_quantity > 0 && m.quantity <= m.warning_quantity;
                                        return (
                                            <div key={m.id} className="glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border-none shadow-xl animate-in fade-in slide-in-from-bottom-6">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isCritical ? 'bg-red-50 text-red-600' : 'bg-olive-dark text-white'}`}>
                                                            <Beaker className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <p className="font-display font-black text-xl text-olive-dark uppercase italic leading-tight truncate">{m.name}</p>
                                                            <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest mt-1">ID {m.id.split('-')[0]}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className={`text-3xl font-black font-display italic leading-none ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark'}`}>
                                                            {m.quantity} <span className="text-[11px] uppercase opacity-40">{m.unit}</span>
                                                        </p>
                                                        <Badge variant="outline" className={`border-none px-0 text-[9px] font-black uppercase tracking-widest mt-1.5 ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark/60'}`}>
                                                            {isCritical ? content?.admin?.inventory?.manufacture?.status?.critical : isWarning ? content?.admin?.inventory?.manufacture?.status?.warning : content?.admin?.inventory?.manufacture?.status?.ok}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="p-5 rounded-[2rem] bg-olive-dark/5 border border-olive/5 grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-olive-dark/50 uppercase tracking-[0.2em] mb-1">{content?.admin?.inventory?.manufacture?.limitLabel || "Min"}</span>
                                                        <span className="text-xs font-black text-olive-dark">{m.min_quantity} {m.unit}</span>
                                                    </div>
                                                    {m.warning_quantity > 0 && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-olive-dark/50 uppercase tracking-[0.2em] mb-1">{content?.admin?.inventory?.warnAtLabel || "Warn"}</span>
                                                            <span className="text-xs font-black text-orange-500">{m.warning_quantity} {m.unit}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2.5 pt-6 border-t border-olive/5">
                                                    <Button
                                                        variant="outline"
                                                        className="h-14 w-14 rounded-2xl border-olive/10 text-olive-dark hover:bg-olive-dark hover:text-white transition-all shrink-0"
                                                        onClick={() => setHistoryId(m.id)}
                                                    >
                                                        <History className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="h-14 w-14 rounded-2xl border-olive/10 text-olive-dark hover:bg-olive-dark hover:text-white transition-all shrink-0"
                                                        onClick={() => setEditId(m.id)}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        className="bg-lime hover:bg-lime/80 text-olive-dark h-14 rounded-2xl font-black flex-1 shadow-xl shadow-lime/20 transition-all text-xs uppercase tracking-widest"
                                                        onClick={() => setRestockId(m.id)}
                                                    >
                                                        <Plus className="h-5 w-5 mr-2" />
                                                        {content?.admin?.inventory?.restock}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 2: Pravidla obalů */}
                <TabsContent value="rules" className="space-y-6 mt-0 border-none p-0 outline-none">
                    <div className="grid grid-cols-1 gap-6">
                        {packagingRules.length === 0 ? (
                            <div className="glass-card rounded-[3.5rem] p-24 text-center space-y-8">
                                <div className="w-24 h-24 bg-olive-dark/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <Box className="w-10 h-10 text-olive-dark/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-olive-dark font-display uppercase italic">Žádná pravidla obalů</p>
                                    <p className="text-[10px] text-olive-dark/70 font-black uppercase tracking-widest">Přidejte první pravidlo pro automatický odpis krabic ze skladu.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
                                {/* Desktop View Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-olive/10 bg-olive-dark">
                                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Velikost balení</th>
                                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Obalový materiál</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Spotřeba na balení</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-olive/5">
                                            {packagingRules.map((rule) => (
                                                <tr key={rule.id} className="hover:bg-white/40 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-lime/10 text-olive-dark flex items-center justify-center font-display font-black text-lg italic shadow-md">
                                                                {rule.pack_size}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-display font-black text-xl text-olive-dark uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">
                                                                    {rule.pack_size === 1 ? "Jednotlivé lahvičky" : `Balení po ${rule.pack_size} ks`}
                                                                </p>
                                                                <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest leading-none">
                                                                    Pravidlo pro {rule.pack_size} {rule.pack_size === 1 ? 'lahev' : rule.pack_size < 5 ? 'lahve' : 'lahví'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-left">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-olive-dark">{rule.material_name}</p>
                                                            <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest leading-none">
                                                                ID {rule.material_id.split('-')[0]}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="space-y-1">
                                                            <div className="text-3xl font-black font-display italic leading-none text-olive-dark">
                                                                {rule.quantity_required} <span className="text-sm font-black uppercase text-olive-dark/50">{rule.material_unit}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-olive-dark/50 uppercase tracking-widest mt-0.5 block">
                                                                Na jednu objednávku
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex justify-end gap-3 transition-all duration-500">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-white transition-all"
                                                                onClick={() => {
                                                                    setRuleToEdit(rule);
                                                                    setIsRuleDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white shadow-lg shadow-red-500/10 transition-all"
                                                                onClick={() => {
                                                                    if (confirm(`Opravdu chcete smazat pravidlo pro balení po ${rule.pack_size} ks?`)) {
                                                                        deletePackagingRule(rule.id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View Card Grid */}
                                <div className="md:hidden space-y-6">
                                    {packagingRules.map((rule) => (
                                        <div key={rule.id} className="glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border-none shadow-xl animate-in fade-in slide-in-from-bottom-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-lime/10 text-olive-dark flex items-center justify-center font-display font-black text-xl italic shrink-0 shadow-md">
                                                        {rule.pack_size}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <p className="font-display font-black text-xl text-olive-dark uppercase italic leading-tight truncate">
                                                            {rule.pack_size === 1 ? "Jednotlivé lahvičky" : `Balení po ${rule.pack_size} ks`}
                                                        </p>
                                                        <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest mt-1 truncate">{rule.material_name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-3xl font-black font-display italic leading-none text-olive-dark">
                                                        {rule.quantity_required} <span className="text-[11px] uppercase opacity-40">{rule.material_unit}</span>
                                                    </p>
                                                    <span className="text-[8px] font-black text-olive-dark/50 uppercase tracking-widest mt-1.5 block">
                                                        Spotřeba
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 pt-6 border-t border-olive/5">
                                                <Button
                                                    variant="outline"
                                                    className="h-14 rounded-2xl border-olive/10 text-olive-dark hover:bg-olive-dark hover:text-white transition-all flex-1 text-xs uppercase font-black tracking-widest"
                                                    onClick={() => {
                                                        setRuleToEdit(rule);
                                                        setIsRuleDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Upravit
                                                </Button>
                                                <Button
                                                    className="bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white h-14 rounded-2xl font-black shadow-xl shadow-red-500/5 transition-all text-xs uppercase tracking-widest px-6"
                                                    onClick={() => {
                                                        if (confirm(`Opravdu chcete smazat pravidlo pro balení po ${rule.pack_size} ks?`)) {
                                                            deletePackagingRule(rule.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 3: Receptury */}
                <TabsContent value="recipes" className="space-y-6 mt-0 border-none p-0 outline-none">
                    <div className="grid grid-cols-1 gap-6">
                        {recipeRules.length === 0 ? (
                            <div className="glass-card rounded-[3.5rem] p-24 text-center space-y-8">
                                <div className="w-24 h-24 bg-olive-dark/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <Beaker className="w-10 h-10 text-olive-dark/20" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-olive-dark font-display uppercase italic">Zatím žádné receptury</p>
                                    <p className="text-[10px] text-olive-dark/70 font-black uppercase tracking-widest">Přidejte pravidla pro odpisy surovin při výrobě příchutí.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
                                {/* Desktop View Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-olive/10 bg-olive-dark">
                                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Příchuť</th>
                                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Surovina k odečtení</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Množství na 1 ks</th>
                                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-olive/5">
                                            {recipeRules.map((rule) => {
                                                const flavorName = FLAVORS.find(f => f.id === rule.product_sku)?.name || rule.product_sku;
                                                return (
                                                <tr key={rule.id} className="hover:bg-white/40 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg bg-olive-dark text-white font-display font-black text-xs uppercase italic">
                                                                {rule.product_sku.substring(0,3)}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-display font-black text-lg text-olive-dark uppercase italic leading-tight">
                                                                    {flavorName}
                                                                </p>
                                                                <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest leading-none">
                                                                    ID {rule.product_sku}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-left">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-olive-dark">{rule.material_name}</p>
                                                            <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest leading-none">
                                                                ID {rule.material_id.split('-')[0]}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="space-y-1">
                                                            <div className="text-3xl font-black font-display italic leading-none text-olive-dark">
                                                                {rule.quantity_required} <span className="text-sm font-black uppercase text-olive-dark/50">{rule.material_unit}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-olive-dark/50 uppercase tracking-widest mt-0.5 block">
                                                                {recipeBasisLabel(rule)}
                                                            </span>
                                                            {rule.input_basis === 'batch' && (
                                                                <span className="text-[8px] font-bold text-olive-dark/40 tracking-widest block">
                                                                    = {recipePerBottle(rule).toLocaleString('cs-CZ', { maximumFractionDigits: 6 })} {rule.material_unit}/ks
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex justify-end gap-3 transition-all duration-500">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-white transition-all"
                                                                onClick={() => {
                                                                    setRecipeToEdit(rule);
                                                                    setIsRecipeDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white shadow-lg shadow-red-500/10 transition-all"
                                                                onClick={() => {
                                                                    if (confirm(`Opravdu chcete smazat recepturu pro ${flavorName}?`)) {
                                                                        deleteRecipeRule(rule.id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View Card Grid */}
                                <div className="md:hidden space-y-6">
                                    {recipeRules.map((rule) => {
                                        const flavorName = FLAVORS.find(f => f.id === rule.product_sku)?.name || rule.product_sku;
                                        return (
                                        <div key={rule.id} className="glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border-none shadow-xl animate-in fade-in slide-in-from-bottom-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-14 h-14 rounded-2xl bg-lime/10 text-olive-dark flex items-center justify-center font-display font-black text-xl italic shrink-0 shadow-md">
                                                        {rule.product_sku.substring(0,3)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <p className="font-display font-black text-xl text-olive-dark uppercase italic leading-tight truncate">
                                                            {flavorName}
                                                        </p>
                                                        <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest mt-1 truncate">{rule.material_name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-3xl font-black font-display italic leading-none text-olive-dark">
                                                        {rule.quantity_required} <span className="text-[11px] uppercase opacity-40">{rule.material_unit}</span>
                                                    </p>
                                                    <span className="text-[8px] font-black text-olive-dark/50 uppercase tracking-widest mt-1.5 block">
                                                        {recipeBasisLabel(rule)}
                                                    </span>
                                                    {rule.input_basis === 'batch' && (
                                                        <span className="text-[8px] font-bold text-olive-dark/40 tracking-widest block">
                                                            = {recipePerBottle(rule).toLocaleString('cs-CZ', { maximumFractionDigits: 6 })} {rule.material_unit}/ks
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 pt-6 border-t border-olive/5">
                                                <Button
                                                    variant="outline"
                                                    className="h-14 rounded-2xl border-olive/10 text-olive-dark hover:bg-olive-dark hover:text-white transition-all flex-1 text-xs uppercase font-black tracking-widest"
                                                    onClick={() => {
                                                        setRecipeToEdit(rule);
                                                        setIsRecipeDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Upravit
                                                </Button>
                                                <Button
                                                    className="bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white h-14 rounded-2xl font-black shadow-xl shadow-red-500/5 transition-all text-xs uppercase tracking-widest px-6"
                                                    onClick={() => {
                                                        if (confirm(`Opravdu chcete smazat recepturu pro ${flavorName}?`)) {
                                                            deleteRecipeRule(rule.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <ManufactureRestockDialog
                isOpen={!!restockId}
                onClose={() => setRestockId(null)}
                material={materials.find(m => m.id === restockId) || null}
            />

            <ManufactureHistoryDialog
                isOpen={!!historyId}
                onClose={() => setHistoryId(null)}
                material={materials.find(m => m.id === historyId) || null}
            />

            <ManufactureEditDialog
                isOpen={!!editId || isAddOpen}
                onClose={() => {
                    setEditId(null);
                    setIsAddOpen(false);
                }}
                material={materials.find(m => m.id === editId) || null}
            />

            <PackagingRuleDialog
                isOpen={isRuleDialogOpen}
                onClose={() => setIsRuleDialogOpen(false)}
                rule={ruleToEdit}
            />

            <RecipeRuleDialog
                isOpen={isRecipeDialogOpen}
                onClose={() => setIsRecipeDialogOpen(false)}
                rule={recipeToEdit}
            />
        </div>
    );
};

export default ManufactureInventory;
